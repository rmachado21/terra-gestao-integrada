
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, parseISO, startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Download, TrendingUp, TrendingDown, Target, AlertCircle } from 'lucide-react';

interface MovimentacaoFinanceira {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  data_movimentacao: string;
}

const COLORS = ['#16a34a', '#dc2626', '#2563eb', '#ea580c', '#7c3aed', '#db2777'];

const RelatoriosFinanceiros = () => {
  const [periodoRelatorio, setPeriodoRelatorio] = useState('ano-atual');

  const { data: movimentacoes = [], isLoading } = useQuery({
    queryKey: ['relatorios-financeiros', periodoRelatorio],
    queryFn: async () => {
      let dataInicio, dataFim;
      
      const hoje = new Date();
      
      switch (periodoRelatorio) {
        case 'mes-atual':
          dataInicio = startOfMonth(hoje);
          dataFim = endOfMonth(hoje);
          break;
        case 'ano-atual':
          dataInicio = startOfYear(hoje);
          dataFim = endOfYear(hoje);
          break;
        default:
          dataInicio = startOfYear(hoje);
          dataFim = endOfYear(hoje);
      }
      
      const { data, error } = await supabase
        .from('movimentacoes_financeiras')
        .select('*')
        .gte('data_movimentacao', dataInicio.toISOString().split('T')[0])
        .lte('data_movimentacao', dataFim.toISOString().split('T')[0])
        .order('data_movimentacao', { ascending: false });
      
      if (error) throw error;
      return data as MovimentacaoFinanceira[];
    }
  });

  // Cálculos principais
  const totalReceitas = movimentacoes
    .filter(m => m.tipo === 'receita')
    .reduce((sum, m) => sum + m.valor, 0);

  const totalDespesas = movimentacoes
    .filter(m => m.tipo === 'despesa')
    .reduce((sum, m) => sum + m.valor, 0);

  const lucroLiquido = totalReceitas - totalDespesas;
  const margemLucro = totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0;

  // Análise por categoria
  const receitasPorCategoria = movimentacoes
    .filter(m => m.tipo === 'receita')
    .reduce((acc, mov) => {
      acc[mov.categoria] = (acc[mov.categoria] || 0) + mov.valor;
      return acc;
    }, {} as Record<string, number>);

  const despesasPorCategoria = movimentacoes
    .filter(m => m.tipo === 'despesa')
    .reduce((acc, mov) => {
      acc[mov.categoria] = (acc[mov.categoria] || 0) + mov.valor;
      return acc;
    }, {} as Record<string, number>);

  // Dados para gráficos
  const pieDataReceitas = Object.entries(receitasPorCategoria).map(([categoria, valor]) => ({
    name: categoria,
    value: valor,
    percentage: ((valor / totalReceitas) * 100).toFixed(1)
  }));

  const pieDataDespesas = Object.entries(despesasPorCategoria).map(([categoria, valor]) => ({
    name: categoria,
    value: valor,
    percentage: ((valor / totalDespesas) * 100).toFixed(1)
  }));

  // Top categorias
  const topReceitas = Object.entries(receitasPorCategoria)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const topDespesas = Object.entries(despesasPorCategoria)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Indicadores de performance
  const indicadores = [
    {
      titulo: 'Receita Total',
      valor: totalReceitas,
      icon: TrendingUp,
      cor: 'text-green-600',
      formato: 'moeda'
    },
    {
      titulo: 'Despesa Total',
      valor: totalDespesas,
      icon: TrendingDown,
      cor: 'text-red-600',
      formato: 'moeda'
    },
    {
      titulo: 'Lucro Líquido',
      valor: lucroLiquido,
      icon: Target,
      cor: lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600',
      formato: 'moeda'
    },
    {
      titulo: 'Margem de Lucro',
      valor: margemLucro,
      icon: AlertCircle,
      cor: margemLucro >= 20 ? 'text-green-600' : margemLucro >= 10 ? 'text-yellow-600' : 'text-red-600',
      formato: 'percentual'
    }
  ];

  const exportarRelatorio = () => {
    const relatorio = {
      periodo: periodoRelatorio,
      data_geracao: new Date().toISOString(),
      resumo: {
        total_receitas: totalReceitas,
        total_despesas: totalDespesas,
        lucro_liquido: lucroLiquido,
        margem_lucro: margemLucro
      },
      receitas_por_categoria: receitasPorCategoria,
      despesas_por_categoria: despesasPorCategoria,
      movimentacoes: movimentacoes
    };

    const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="text-center py-4">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={periodoRelatorio} onValueChange={setPeriodoRelatorio}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes-atual">Mês Atual</SelectItem>
              <SelectItem value="ano-atual">Ano Atual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={exportarRelatorio} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicadores.map((indicador, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{indicador.titulo}</p>
                  <p className={`text-2xl font-bold ${indicador.cor}`}>
                    {indicador.formato === 'moeda' 
                      ? `R$ ${indicador.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                      : `${indicador.valor.toFixed(1)}%`
                    }
                  </p>
                </div>
                <indicador.icon className={`h-8 w-8 ${indicador.cor}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos de Pizza */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Receitas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieDataReceitas.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieDataReceitas}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {pieDataReceitas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [
                      `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                      'Valor'
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-12">Nenhuma receita no período</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="h-5 w-5" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieDataDespesas.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieDataDespesas}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {pieDataDespesas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [
                      `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                      'Valor'
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-12">Nenhuma despesa no período</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Principais Fontes de Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topReceitas.map(([categoria, valor], index) => (
                <div key={categoria} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-green-600">#{index + 1}</Badge>
                    <span className="font-medium">{categoria}</span>
                  </div>
                  <span className="font-bold text-green-600">
                    R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
              {topReceitas.length === 0 && (
                <p className="text-center text-gray-500 py-4">Nenhuma receita registrada</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Principais Categorias de Despesa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDespesas.map(([categoria, valor], index) => (
                <div key={categoria} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-red-600">#{index + 1}</Badge>
                    <span className="font-medium">{categoria}</span>
                  </div>
                  <span className="font-bold text-red-600">
                    R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
              {topDespesas.length === 0 && (
                <p className="text-center text-gray-500 py-4">Nenhuma despesa registrada</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo do Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resumo do Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Análise de Receitas</h4>
              <div className="space-y-1 text-sm">
                <p>Total de movimentações: {movimentacoes.filter(m => m.tipo === 'receita').length}</p>
                <p>Maior receita: R$ {Math.max(...movimentacoes.filter(m => m.tipo === 'receita').map(m => m.valor) || [0]).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p>Receita média: R$ {(totalReceitas / (movimentacoes.filter(m => m.tipo === 'receita').length || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">Análise de Despesas</h4>
              <div className="space-y-1 text-sm">
                <p>Total de movimentações: {movimentacoes.filter(m => m.tipo === 'despesa').length}</p>
                <p>Maior despesa: R$ {Math.max(...movimentacoes.filter(m => m.tipo === 'despesa').map(m => m.valor) || [0]).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p>Despesa média: R$ {(totalDespesas / (movimentacoes.filter(m => m.tipo === 'despesa').length || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">Performance Geral</h4>
              <div className="space-y-1 text-sm">
                <p>Total de categorias: {new Set(movimentacoes.map(m => m.categoria)).size}</p>
                <p>Eficiência: {totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas * 100).toFixed(1) : 0}%</p>
                <p className={lucroLiquido >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  Status: {lucroLiquido >= 0 ? 'Lucro' : 'Prejuízo'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatoriosFinanceiros;
