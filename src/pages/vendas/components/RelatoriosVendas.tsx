import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { RelatorioFiltros } from './relatorios/RelatorioFiltros';
import { RelatorioResumo } from './relatorios/RelatorioResumo';
import { GraficoVendasDia } from './relatorios/GraficoVendasDia';
import { GraficoTopClientes } from './relatorios/GraficoTopClientes';
import { GraficoTopProdutos } from './relatorios/GraficoTopProdutos';
import { GraficoVendasCategoria } from './relatorios/GraficoVendasCategoria';
import { DadosVendas } from './relatorios/types';

const RelatoriosVendas = () => {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState('mes');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Calcular período automaticamente
  const calcularPeriodo = () => {
    const hoje = new Date();
    let inicio: Date;
    
    switch (periodo) {
      case 'semana':
        inicio = new Date(hoje);
        inicio.setDate(hoje.getDate() - 7);
        break;
      case 'mes':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        break;
      case 'trimestre':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
        break;
      case 'ano':
        inicio = new Date(hoje.getFullYear(), 0, 1);
        break;
      case 'personalizado':
        return {
          inicio: dataInicio ? new Date(dataInicio) : new Date(hoje.getFullYear(), hoje.getMonth(), 1),
          fim: dataFim ? new Date(dataFim) : hoje
        };
      default:
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }
    
    return { inicio, fim: hoje };
  };

  // Buscar dados de vendas por período
  const { data: dadosVendas, isLoading } = useQuery<DadosVendas | null>({
    queryKey: ['relatorio-vendas', user?.id, periodo, dataInicio, dataFim],
    queryFn: async () => {
      if (!user?.id) return null;

      const { inicio, fim } = calcularPeriodo();
      
      const { data: pedidos, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          clientes:cliente_id (nome),
          itens_pedido (
            quantidade,
            preco_unitario,
            subtotal,
            produtos:produto_id (nome, categoria)
          )
        `)
        .eq('user_id', user.id)
        .gte('data_pedido', inicio.toISOString().split('T')[0])
        .lte('data_pedido', fim.toISOString().split('T')[0])
        .order('data_pedido', { ascending: true });

      if (error) throw error;

      // Processar dados para gráficos
      const vendasPorDia = new Map();
      const vendasPorCliente = new Map();
      const vendasPorProduto = new Map();
      const vendasPorCategoria = new Map();
      
      let totalVendas = 0;
      let totalPedidos = pedidos?.length || 0;
      let pedidosEntregues = 0;

      pedidos?.forEach(pedido => {
        const data = new Date(pedido.data_pedido).toLocaleDateString('pt-BR');
        const valor = pedido.valor_total || 0;
        
        totalVendas += valor;
        
        if (pedido.status === 'entregue') {
          pedidosEntregues++;
        }

        // Vendas por dia
        vendasPorDia.set(data, (vendasPorDia.get(data) || 0) + valor);
        
        // Vendas por cliente
        const nomeCliente = pedido.clientes?.nome || 'Cliente não informado';
        vendasPorCliente.set(nomeCliente, (vendasPorCliente.get(nomeCliente) || 0) + valor);
        
        // Vendas por produto e categoria
        pedido.itens_pedido?.forEach(item => {
          const nomeProduto = item.produtos?.nome || 'Produto não informado';
          const categoria = item.produtos?.categoria || 'Sem categoria';
          
          vendasPorProduto.set(nomeProduto, (vendasPorProduto.get(nomeProduto) || 0) + item.subtotal);
          vendasPorCategoria.set(categoria, (vendasPorCategoria.get(categoria) || 0) + item.subtotal);
        });
      });

      return {
        resumo: {
          totalVendas,
          totalPedidos,
          pedidosEntregues,
          ticketMedio: totalPedidos > 0 ? totalVendas / totalPedidos : 0,
          taxaEntrega: totalPedidos > 0 ? (pedidosEntregues / totalPedidos) * 100 : 0
        },
        vendasPorDia: Array.from(vendasPorDia.entries()).map(([data, valor]) => ({
          data,
          valor
        })),
        topClientes: Array.from(vendasPorCliente.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([nome, valor]) => ({ nome, valor })),
        topProdutos: Array.from(vendasPorProduto.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([nome, valor]) => ({ nome, valor })),
        vendasPorCategoria: Array.from(vendasPorCategoria.entries())
          .map(([categoria, valor]) => ({ categoria, valor }))
      };
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleExportPDF = async () => {
    if (!dadosVendas) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Selecione um período com dados de vendas para gerar o relatório.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const periodoOptions: { [key: string]: string } = {
        'semana': 'Última semana',
        'mes': 'Este mês',
        'trimestre': 'Este trimestre',
        'ano': 'Este ano',
        'personalizado': `Personalizado: ${dataInicio} a ${dataFim}`,
      };
      const periodoLabel = periodoOptions[periodo] || 'Período não definido';

      const { data, error: invokeError } = await supabase.functions.invoke('export-sales-report', {
        body: { dadosVendas, periodoLabel },
      });

      if (invokeError) {
        throw invokeError;
      }
      
      const responseData = data;
      if (responseData.error) {
         throw new Error(responseData.error);
      }
      
      const link = document.createElement('a');
      link.href = responseData.pdf;
      const dataString = new Date().toISOString().slice(0,10);
      link.download = `relatorio-vendas-${periodo.replace(' ', '-')}-${dataString}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Relatório gerado com sucesso!",
        description: "O download do seu relatório em PDF foi iniciado.",
      });

    } catch (error: any) {
      console.error("Erro ao exportar PDF:", error);
      toast({
        title: "Erro ao exportar",
        description: error.message || "Não foi possível gerar o relatório em PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <RelatorioFiltros
        periodo={periodo}
        setPeriodo={setPeriodo}
        dataInicio={dataInicio}
        setDataInicio={setDataInicio}
        dataFim={dataFim}
        setDataFim={setDataFim}
        handleExportPDF={handleExportPDF}
        isExporting={isExporting}
        isLoading={isLoading}
        hasData={!!dadosVendas}
      />

      {dadosVendas && (
        <>
          <RelatorioResumo resumo={dadosVendas.resumo} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraficoVendasDia data={dadosVendas.vendasPorDia} />
            <GraficoTopClientes data={dadosVendas.topClientes} />
            <GraficoTopProdutos data={dadosVendas.topProdutos} />
            <GraficoVendasCategoria data={dadosVendas.vendasPorCategoria} />
          </div>
        </>
      )}
    </div>
  );
};

export default RelatoriosVendas;
