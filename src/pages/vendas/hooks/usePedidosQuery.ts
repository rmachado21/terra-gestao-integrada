import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';

export const usePedidosQuery = (searchTerm: string, statusFilter: string) => {
  const { effectiveUserId } = useEffectiveUser();

  return useQuery({
    queryKey: ['pedidos', effectiveUserId, searchTerm, statusFilter],
    queryFn: async () => {
      if (!effectiveUserId) return [];

      let query = supabase
        .from('pedidos')
        .select(`
          *,
          clientes:cliente_id (
            id,
            nome,
            telefone,
            endereco
          )
        `)
        .eq('user_id', effectiveUserId)
        .order('data_pedido', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter as 'pendente' | 'processando' | 'entregue' | 'cancelado');
      }

      const { data, error } = await query;
      if (error) throw error;
      
      const pedidosFormatted = data?.map(pedido => ({
        ...pedido,
        cliente: pedido.clientes
      })) || [];

      if (searchTerm) {
        return pedidosFormatted.filter(pedido => 
          pedido.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pedido.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return pedidosFormatted;
    },
    enabled: !!effectiveUserId
  });
};