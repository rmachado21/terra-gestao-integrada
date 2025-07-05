import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';

export const usePedidoFinanceSync = () => {
  const { effectiveUserId } = useEffectiveUser();

  // Sincronizar movimentação financeira com pedido
  const syncPedidoFinanceiro = async (
    pedidoId: string,
    dados: {
      valor_total: number;
      status: 'pendente' | 'processando' | 'entregue' | 'cancelado';
      data_pedido?: string;
      data_entrega?: string;
      statusAnterior?: 'pendente' | 'processando' | 'entregue' | 'cancelado';
    }
  ) => {
    if (!effectiveUserId) throw new Error('Usuário não autenticado');

    const { valor_total, status, data_pedido, data_entrega, statusAnterior } = dados;

    // Buscar movimentação financeira existente
    const { data: movimentacaoExistente } = await supabase
      .from('movimentacoes_financeiras')
      .select('*')
      .eq('pedido_id', pedidoId)
      .eq('user_id', effectiveUserId)
      .eq('tipo', 'receita')
      .maybeSingle();

    // Cenário 1: Status mudou para "entregue" - criar receita
    if (status === 'entregue' && statusAnterior !== 'entregue') {
      if (!movimentacaoExistente && valor_total > 0) {
        const { error } = await supabase
          .from('movimentacoes_financeiras')
          .insert({
            tipo: 'receita',
            categoria: 'Vendas',
            valor: valor_total,
            data_movimentacao: data_entrega || data_pedido || new Date().toISOString().split('T')[0],
            descricao: `Pedido #${pedidoId.slice(-8)}`,
            pedido_id: pedidoId,
            user_id: effectiveUserId
          });
        
        if (error) throw error;
      }
    }

    // Cenário 2: Status mudou de "entregue" para outro - remover receita
    if (statusAnterior === 'entregue' && status !== 'entregue') {
      if (movimentacaoExistente) {
        const { error } = await supabase
          .from('movimentacoes_financeiras')
          .delete()
          .eq('id', movimentacaoExistente.id);
        
        if (error) throw error;
      }
    }

    // Cenário 3: Pedido entregue com valor ou data alterados - atualizar receita
    if (status === 'entregue' && movimentacaoExistente) {
      const { error } = await supabase
        .from('movimentacoes_financeiras')
        .update({
          valor: valor_total,
          data_movimentacao: data_entrega || data_pedido || movimentacaoExistente.data_movimentacao,
          descricao: `Pedido #${pedidoId.slice(-8)}`
        })
        .eq('id', movimentacaoExistente.id);
      
      if (error) throw error;
    }
  };

  // Remover todas as movimentações financeiras de um pedido
  const removePedidoFinanceiro = async (pedidoId: string) => {
    if (!effectiveUserId) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('movimentacoes_financeiras')
      .delete()
      .eq('pedido_id', pedidoId)
      .eq('user_id', effectiveUserId);
    
    if (error) throw error;
  };

  // Verificar consistência entre pedido e movimentações
  const verificarConsistencia = async (pedidoId: string) => {
    if (!effectiveUserId) return { consistente: true, problemas: [] };

    const { data: pedido } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', pedidoId)
      .eq('user_id', effectiveUserId)
      .single();

    const { data: movimentacoes } = await supabase
      .from('movimentacoes_financeiras')
      .select('*')
      .eq('pedido_id', pedidoId)
      .eq('user_id', effectiveUserId);

    if (!pedido) return { consistente: false, problemas: ['Pedido não encontrado'] };

    const problemas: string[] = [];
    const temReceita = movimentacoes?.some(m => m.tipo === 'receita');

    // Verificar se pedido entregue tem receita
    if (pedido.status === 'entregue' && !temReceita && pedido.valor_total > 0) {
      problemas.push('Pedido entregue sem receita correspondente');
    }

    // Verificar se pedido não entregue tem receita
    if (pedido.status !== 'entregue' && temReceita) {
      problemas.push('Pedido não entregue com receita registrada');
    }

    // Verificar valores divergentes
    if (temReceita) {
      const receita = movimentacoes.find(m => m.tipo === 'receita');
      if (receita && receita.valor !== pedido.valor_total) {
        problemas.push('Valor da receita diverge do valor do pedido');
      }
    }

    return {
      consistente: problemas.length === 0,
      problemas
    };
  };

  return {
    syncPedidoFinanceiro,
    removePedidoFinanceiro,
    verificarConsistencia
  };
};