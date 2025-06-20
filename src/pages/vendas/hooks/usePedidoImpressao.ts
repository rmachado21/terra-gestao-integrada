
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

export const usePedidoImpressao = (pedidoId: string) => {
  const { profile } = useProfile();

  return useQuery({
    queryKey: ['pedido-impressao', pedidoId],
    queryFn: async () => {
      // Buscar dados do pedido com cliente
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .select(`
          *,
          clientes:cliente_id (
            id,
            nome,
            telefone,
            endereco,
            cidade,
            estado,
            cep,
            cpf_cnpj
          )
        `)
        .eq('id', pedidoId)
        .single();

      if (pedidoError) throw pedidoError;

      // Buscar itens do pedido
      const { data: itensData, error: itensError } = await supabase
        .from('itens_pedido')
        .select(`
          *,
          produtos:produto_id (
            nome,
            unidade_medida
          )
        `)
        .eq('pedido_id', pedidoId);

      if (itensError) throw itensError;

      // Preparar dados da empresa a partir do perfil
      const empresa = profile ? {
        nome: profile.empresa_nome,
        cnpj: profile.cnpj,
        telefone: profile.telefone,
        email: profile.email,
        logo_url: profile.logo_url
      } : undefined;

      return {
        pedido: {
          ...pedidoData,
          cliente: pedidoData.clientes
        },
        itens: itensData || [],
        empresa
      };
    },
    enabled: !!pedidoId
  });
};
