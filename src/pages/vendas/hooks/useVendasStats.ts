
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';

export interface VendasStatsData {
  totalClientes: number;
  totalPedidos: number;
  pedidosPendentes: number;
  entregasRealizadas: number;
  faturamentoTotal: number;
  faturamentoMes: number;
}

export const useVendasStats = () => {
  const { effectiveUserId } = useEffectiveUser();

  return useQuery({
    queryKey: ['vendas-stats', effectiveUserId],
    queryFn: async (): Promise<VendasStatsData> => {
      if (!effectiveUserId) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar total de clientes
      const { count: totalClientes } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', effectiveUserId)
        .eq('ativo', true);

      // Buscar dados dos pedidos
      const { data: pedidos } = await supabase
        .from('pedidos')
        .select('status, valor_total, data_pedido')
        .eq('user_id', effectiveUserId);

      if (!pedidos) {
        throw new Error('Erro ao buscar pedidos');
      }

      // Calcular estatísticas dos pedidos
      const totalPedidos = pedidos.length;
      const pedidosPendentes = pedidos.filter(p => p.status === 'pendente').length;
      const entregasRealizadas = pedidos.filter(p => p.status === 'entregue').length;
      const faturamentoTotal = pedidos.reduce((acc, p) => acc + (p.valor_total || 0), 0);

      // Calcular faturamento do mês atual
      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();
      const faturamentoMes = pedidos
        .filter(p => {
          const dataPedido = new Date(p.data_pedido);
          return dataPedido.getMonth() === mesAtual && dataPedido.getFullYear() === anoAtual;
        })
        .reduce((acc, p) => acc + (p.valor_total || 0), 0);

      return {
        totalClientes: totalClientes || 0,
        totalPedidos,
        pedidosPendentes,
        entregasRealizadas,
        faturamentoTotal,
        faturamentoMes,
      };
    },
    enabled: !!effectiveUserId,
  });
};
