
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveProfile } from '@/hooks/useEffectiveProfile';

export const usePedidoImpressao = (pedidoId: string) => {
  const { profile } = useEffectiveProfile();

  return useQuery({
    queryKey: ['pedido-impressao', pedidoId],
    queryFn: async () => {
      console.log('Profile for PDF:', profile);
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
        nome: profile.empresa_nome || profile.nome || 'Empresa',
        cnpj: profile.cnpj,
        telefone: profile.telefone,
        email: profile.email,
        logo_url: profile.logo_url
      } : {
        nome: 'Empresa'
      };
      
      console.log('Empresa data for PDF:', empresa);

      return {
        pedido: {
          ...pedidoData,
          cliente: pedidoData.clientes
        },
        itens: itensData || [],
        empresa
      };
    },
    enabled: !!pedidoId && !!profile
  });
};
