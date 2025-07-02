import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';

export const usePedidoMutations = () => {
  const { effectiveUserId } = useEffectiveUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Atualizar status do pedido
  const updateStatusMutation = useMutation({
    mutationFn: async ({ pedidoId, status }: { pedidoId: string; status: 'pendente' | 'processando' | 'entregue' | 'cancelado' }) => {
      const { error } = await supabase
        .from('pedidos')
        .update({ status })
        .eq('id', pedidoId)
        .eq('user_id', effectiveUserId!);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Status atualizado',
        description: 'Status do pedido atualizado com sucesso.'
      });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['vendas-stats'] });
    },
    onError: () => {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o status do pedido.',
        variant: 'destructive'
      });
    }
  });

  // Deletar pedido
  const deletePedidoMutation = useMutation({
    mutationFn: async (pedidoId: string) => {
      // Primeiro deletar itens do pedido
      const { error: itensError } = await supabase
        .from('itens_pedido')
        .delete()
        .eq('pedido_id', pedidoId)
        .eq('user_id', effectiveUserId!);
      
      if (itensError) throw itensError;

      // Depois deletar o pedido
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
        description: 'Pedido excluído com sucesso.'
      });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['vendas-stats'] });
    },
    onError: () => {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o pedido.',
        variant: 'destructive'
      });
    }
  });

  return {
    updateStatusMutation,
    deletePedidoMutation
  };
};