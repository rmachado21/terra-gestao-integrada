import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';
import { usePedidoFinanceSync } from './usePedidoFinanceSync';

export const usePedidoMutations = () => {
  const { effectiveUserId } = useEffectiveUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { syncPedidoFinanceiro, removePedidoFinanceiro } = usePedidoFinanceSync();

  // Atualizar status do pedido com sincronização financeira
  const updateStatusMutation = useMutation({
    mutationFn: async ({ pedidoId, status }: { pedidoId: string; status: 'pendente' | 'processando' | 'entregue' | 'cancelado' }) => {
      // Buscar dados atuais do pedido
      const { data: pedidoAtual, error: fetchError } = await supabase
        .from('pedidos')
        .select('valor_total, data_pedido, data_entrega, status')
        .eq('id', pedidoId)
        .eq('user_id', effectiveUserId!)
        .single();
      
      if (fetchError) throw fetchError;

      // Atualizar status do pedido
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({ status })
        .eq('id', pedidoId)
        .eq('user_id', effectiveUserId!);
      
      if (updateError) throw updateError;

      // Sincronizar com movimentações financeiras
      await syncPedidoFinanceiro(pedidoId, {
        valor_total: pedidoAtual.valor_total,
        status,
        data_pedido: pedidoAtual.data_pedido,
        data_entrega: pedidoAtual.data_entrega,
        statusAnterior: pedidoAtual.status
      });
    },
    onSuccess: () => {
      toast({
        title: 'Status atualizado',
        description: 'Status do pedido e movimentações financeiras atualizados com sucesso.'
      });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['vendas-stats'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-financeiras'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: () => {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o status do pedido.',
        variant: 'destructive'
      });
    }
  });

  // Deletar pedido com limpeza financeira
  const deletePedidoMutation = useMutation({
    mutationFn: async (pedidoId: string) => {
      // Remover movimentações financeiras associadas
      await removePedidoFinanceiro(pedidoId);

      // Deletar itens do pedido
      const { error: itensError } = await supabase
        .from('itens_pedido')
        .delete()
        .eq('pedido_id', pedidoId)
        .eq('user_id', effectiveUserId!);
      
      if (itensError) throw itensError;

      // Deletar o pedido
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', pedidoId)
        .eq('user_id', effectiveUserId!);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Pedido excluído',
        description: 'Pedido e movimentações financeiras removidos com sucesso.'
      });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['vendas-stats'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-financeiras'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: () => {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o pedido.',
        variant: 'destructive'
      });
    }
  });

  // Nova mutação para atualizar pedido completo (valor, data, etc.)
  const updatePedidoMutation = useMutation({
    mutationFn: async (dados: {
      pedidoId: string;
      cliente_id?: string;
      data_pedido: string;
      status: 'pendente' | 'processando' | 'entregue' | 'cancelado';
      observacoes?: string;
      valor_total: number;
      data_entrega?: string;
      statusAnterior?: 'pendente' | 'processando' | 'entregue' | 'cancelado';
    }) => {
      const { pedidoId, statusAnterior, ...updateData } = dados;

      // Atualizar pedido
      const { error: updateError } = await supabase
        .from('pedidos')
        .update(updateData)
        .eq('id', pedidoId)
        .eq('user_id', effectiveUserId!);
      
      if (updateError) throw updateError;

      // Sincronizar com movimentações financeiras
      await syncPedidoFinanceiro(pedidoId, {
        valor_total: updateData.valor_total,
        status: updateData.status,
        data_pedido: updateData.data_pedido,
        data_entrega: updateData.data_entrega,
        statusAnterior
      });
    },
    onSuccess: () => {
      toast({
        title: 'Pedido atualizado',
        description: 'Pedido e movimentações financeiras atualizados com sucesso.'
      });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['vendas-stats'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-financeiras'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: () => {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o pedido.',
        variant: 'destructive'
      });
    }
  });

  return {
    updateStatusMutation,
    deletePedidoMutation,
    updatePedidoMutation
  };
};