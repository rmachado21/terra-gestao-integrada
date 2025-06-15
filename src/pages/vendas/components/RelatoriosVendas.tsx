import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Download, Calendar, DollarSign, Package, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading";

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
  const { data: dadosVendas, isLoading } = useQuery({
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

  const cores = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#F97316'];

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
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Relatórios de Vendas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semana">Última semana</SelectItem>
                  <SelectItem value="mes">Este mês</SelectItem>
                  <SelectItem value="trimestre">Este trimestre</SelectItem>
                  <SelectItem value="ano">Este ano</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {periodo === 'personalizado' && (
              <>
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </>
            )}
            
            <div className="flex items-end">
              <Button 
                variant="outline"
                onClick={handleExportPDF}
                disabled={isExporting || isLoading || !dadosVendas}
              >
                {isExporting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      {dadosVendas && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                  <p className="text-2xl font-bold">
                    R$ {dadosVendas.resumo.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                  <p className="text-2xl font-bold">{dadosVendas.resumo.totalPedidos}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                  <p className="text-2xl font-bold">
                    R$ {dadosVendas.resumo.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pedidos Entregues</p>
                  <p className="text-2xl font-bold">{dadosVendas.resumo.pedidosEntregues}</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Entrega</p>
                  <p className="text-2xl font-bold">{dadosVendas.resumo.taxaEntrega.toFixed(1)}%</p>
                </div>
                <Calendar className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      {dadosVendas && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vendas por Dia */}
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosVendas.vendasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Vendas']} />
                  <Line type="monotone" dataKey="valor" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Clientes */}
          <Card>
            <CardHeader>
              <CardTitle>Top Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosVendas.topClientes.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Compras']} />
                  <Bar dataKey="valor" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Produtos */}
          <Card>
            <CardHeader>
              <CardTitle>Top Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosVendas.topProdutos.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Vendas']} />
                  <Bar dataKey="valor" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Vendas por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosVendas.vendasPorCategoria}
                    dataKey="valor"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({categoria, percent}) => `${categoria} ${(percent * 100).toFixed(0)}%`}
                  >
                    {dadosVendas.vendasPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Vendas']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RelatoriosVendas;
