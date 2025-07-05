
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';

export const useDashboardData = () => {
  const { effectiveUserId } = useEffectiveUser();

  return useQuery({
    queryKey: ['dashboard-data', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return null;

      // Buscar todas as estatísticas em paralelo
      const [
        areasRes,
        plantiosRes, 
        colheitasRes,
        pedidosRes,
        movimentacoesRes,
        alertasRes,
        estoqueRes,
        produtosRes
      ] = await Promise.all([
        supabase.from('areas').select('id, tamanho_hectares, ativa').eq('user_id', effectiveUserId),
        supabase.from('plantios').select('id, variedade, data_plantio, status, created_at').eq('user_id', effectiveUserId),
        supabase.from('colheitas').select('id, quantidade_kg, data_colheita, created_at').eq('user_id', effectiveUserId),
        supabase.from('pedidos').select('id, valor_total, status, data_pedido, created_at').eq('user_id', effectiveUserId),
        supabase.from('movimentacoes_financeiras').select('id, valor, tipo, data_movimentacao, created_at').eq('user_id', effectiveUserId),
        supabase.from('alertas').select('id, titulo, mensagem, tipo, prioridade, lido, created_at').eq('user_id', effectiveUserId).eq('lido', false),
        supabase.from('estoque').select('id, produto_id, quantidade, quantidade_minima, data_validade').eq('user_id', effectiveUserId),
        supabase.from('produtos').select('id, nome, ativo').eq('user_id', effectiveUserId).eq('ativo', true)
      ]);

      // Calcular estatísticas
      const areas = areasRes.data || [];
      const plantios = plantiosRes.data || [];
      const colheitas = colheitasRes.data || [];
      const pedidos = pedidosRes.data || [];
      const movimentacoes = movimentacoesRes.data || [];
      const alertas = alertasRes.data || [];
      const estoque = estoqueRes.data || [];
      const produtos = produtosRes.data || [];

      // Área plantada total
      const areaTotal = areas
        .filter(area => area.ativa)
        .reduce((sum, area) => sum + (area.tamanho_hectares || 0), 0);

      // Produção do mês atual
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const producaoMes = colheitas
        .filter(colheita => new Date(colheita.data_colheita) >= inicioMes)
        .reduce((sum, colheita) => sum + (colheita.quantidade_kg || 0), 0);

      // Crescimento da produção (comparar com mês anterior)
      const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      const producaoMesAnterior = colheitas
        .filter(colheita => {
          const dataColheita = new Date(colheita.data_colheita);
          return dataColheita >= inicioMesAnterior && dataColheita <= fimMesAnterior;
        })
        .reduce((sum, colheita) => sum + (colheita.quantidade_kg || 0), 0);

      const crescimentoProducao = producaoMesAnterior > 0 
        ? ((producaoMes - producaoMesAnterior) / producaoMesAnterior * 100).toFixed(1)
        : '0';

      // Vendas do mês
      const vendasMes = pedidos
        .filter(pedido => new Date(pedido.data_pedido) >= inicioMes)
        .reduce((sum, pedido) => sum + (pedido.valor_total || 0), 0);

      const pedidosEntreguesMes = pedidos
        .filter(pedido => 
          new Date(pedido.data_pedido) >= inicioMes && 
          pedido.status === 'entregue'
        ).length;

      // Lucro líquido (receitas - despesas do mês)
      const receitasMes = movimentacoes
        .filter(mov => 
          new Date(mov.data_movimentacao) >= inicioMes && 
          mov.tipo === 'receita'
        )
        .reduce((sum, mov) => sum + mov.valor, 0);

      const despesasMes = movimentacoes
        .filter(mov => 
          new Date(mov.data_movimentacao) >= inicioMes && 
          mov.tipo === 'despesa'
        )
        .reduce((sum, mov) => sum + mov.valor, 0);

      const lucroLiquido = receitasMes - despesasMes;
      const margemLucro = vendasMes > 0 ? ((lucroLiquido / vendasMes) * 100).toFixed(1) : '0';

      // Atividades recentes
      const atividadesRecentes = [];

      // Adicionar colheitas recentes
      colheitas.slice(-3).reverse().forEach(colheita => {
        atividadesRecentes.push({
          action: "Colheita registrada",
          details: `${colheita.quantidade_kg}kg colhidos`,
          time: getTimeAgo(colheita.created_at),
          type: "production",
          route: "/colheitas"
        });
      });

      // Adicionar vendas recentes
      pedidos.slice(-3).reverse().forEach(pedido => {
        atividadesRecentes.push({
          action: "Venda realizada",
          details: `Pedido - R$ ${pedido.valor_total?.toFixed(2)}`,
          time: getTimeAgo(pedido.created_at),
          type: "sale",
          route: "/vendas"
        });
      });

      // Adicionar plantios recentes
      plantios.slice(-2).reverse().forEach(plantio => {
        atividadesRecentes.push({
          action: "Plantio iniciado",
          details: `${plantio.variedade}`,
          time: getTimeAgo(plantio.created_at),
          type: "planting",
          route: "/plantios"
        });
      });

      // Ordenar por data mais recente e limitar a 5
      atividadesRecentes.sort((a, b) => 
        new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      
      // Limitar a 5 atividades mais recentes
      const atividadesLimitadas = atividadesRecentes.slice(0, 5);

      // Alertas automáticos + alertas manuais
      const alertasCompletos = [...alertas];

      // Verificar estoque baixo
      estoque.forEach(item => {
        if (item.quantidade_minima && item.quantidade <= item.quantidade_minima) {
          const produto = produtos.find(p => p.id === item.produto_id);
          alertasCompletos.push({
            id: `estoque-${item.id}`,
            titulo: "Estoque Crítico",
            mensagem: `${produto?.nome || 'Produto não encontrado'} - apenas ${item.quantidade} unidades`,
            prioridade: item.quantidade === 0 ? "critica" as const : "alta" as const,
            tipo: "estoque",
            created_at: new Date().toISOString(),
            lido: false
          });
        }
      });

      // Verificar produtos vencendo
      const produtosVencendo = estoque.filter(item => {
        if (!item.data_validade) return false;
        const hoje = new Date();
        const vencimento = new Date(item.data_validade);
        const diasParaVencer = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        return diasParaVencer <= 30 && diasParaVencer >= 0;
      }).length;

      if (produtosVencendo > 0) {
        alertasCompletos.push({
          id: 'produtos-vencendo',
          titulo: "Produtos Vencendo",
          mensagem: `${produtosVencendo} produtos vencem nos próximos 30 dias`,
          prioridade: "media" as const,
          tipo: "validade",
          created_at: new Date().toISOString(),
          lido: false
        });
      }

      return {
        stats: {
          areaPlantada: {
            value: `${areaTotal.toFixed(1)} ha`,
            subtitle: `${areas.filter(a => a.ativa).length} áreas ativas`
          },
          producaoMensal: {
            value: producaoMes > 0 ? `${producaoMes.toLocaleString()} kg` : "0 kg",
            subtitle: producaoMes > 0 ? `${crescimentoProducao}% vs mês anterior` : "Nenhuma produção este mês"
          },
          vendasMes: {
            value: `R$ ${vendasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            subtitle: `${pedidosEntreguesMes} pedidos entregues`
          },
          lucroLiquido: {
            value: `R$ ${lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            subtitle: `Margem de ${margemLucro}%`
          }
        },
        atividadesRecentes: atividadesLimitadas,
        alertas: alertasCompletos.slice(0, 5) // Limitar a 5 alertas
      };
    },
    enabled: !!effectiveUserId
  });
};

// Função auxiliar para calcular tempo relativo
function getTimeAgo(dateString: string): string {
  const agora = new Date();
  const data = new Date(dateString);
  const diffMs = agora.getTime() - data.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
  } else if (diffHours > 0) {
    return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
  } else {
    return 'Agora';
  }
}
