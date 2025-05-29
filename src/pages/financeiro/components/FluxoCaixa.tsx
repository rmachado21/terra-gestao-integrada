
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

interface MovimentacaoFinanceira {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  data_movimentacao: string;
}

const FluxoCaixa = () => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('6');

  const { data: movimentacoes = [], isLoading } = useQuery({
    queryKey: ['movimentacoes-fluxo'],
    queryFn: async () => {
      const dataInicio = subMonths(new Date(), parseInt(periodoSelecionado));
      
      const { data, error } = await supabase
        .from('movimentacoes_financeiras')
        .select('*')
        .gte('data_movimentacao', dataInicio.toISOString().split('T')[0])
        .order('data_movimentacao', { ascending: true });
      
      if (error) throw error;
      return data as MovimentacaoFinanceira[];
    }
  });

  // Agrupar dados por mês
  const dadosPorMes = movimentacoes.reduce((acc, mov) => {
    const mes = format(parseISO(mov.data_movimentacao), 'yyyy-MM');
    const mesLabel = format(parseISO(mov.data_movimentacao), 'MMM/yyyy', { locale: ptBR });
    
    if (!acc[mes]) {
      acc[mes] = {
        mes: mesLabel,
        receitas: 0,
        despesas: 0,
        saldo: 0
      };
    }
    
    if (mov.tipo === 'receita') {
      acc[mes].receitas += mov.valor;
    } else {
      acc[mes].despesas += mov.valor;
    }
    
    acc[mes].saldo = acc[mes].receitas - acc[mes].despesas;
    
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(dadosPorMes);

  // Agrupar por categoria
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

  const chartReceitasCategoria = Object.entries(receitasPorCategoria).map(([categoria, valor]) => ({
    categoria,
    valor
  }));

  const chartDespesasCategoria = Object.entries(despesasPorCategoria).map(([categoria, valor]) => ({
    categoria,
    valor
  }));

  // Totais
  const totalReceitas = movimentacoes
    .filter(m => m.tipo === 'receita')
    .reduce((sum, m) => sum + m.valor, 0);

  const totalDespesas = movimentacoes
    .filter(m => m.tipo === 'despesa')
    .reduce((sum, m) => sum + m.valor, 0);

  const saldoTotal = totalReceitas - totalDespesas;

  if (isLoading) {
    return <div className="text-center py-4">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">Período:</span>
        </div>
        <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Últimos 3 meses</SelectItem>
            <SelectItem value="6">Últimos 6 meses</SelectItem>
            <SelectItem value="12">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resumo do Período */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receitas no Período</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Despesas no Período</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saldo do Período</p>
                <p className={`text-2xl font-bold ${saldoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Fluxo Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  name === 'receitas' ? 'Receitas' : name === 'despesas' ? 'Despesas' : 'Saldo'
                ]}
              />
              <Bar dataKey="receitas" fill="#16a34a" name="receitas" />
              <Bar dataKey="despesas" fill="#dc2626" name="despesas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Saldo Acumulado */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Saldo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [
                  `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  'Saldo'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráficos por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {chartReceitasCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartReceitasCategoria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [
                      `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                      'Valor'
                    ]}
                  />
                  <Bar dataKey="valor" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">Nenhuma receita no período</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {chartDespesasCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartDespesasCategoria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [
                      `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                      'Valor'
                    ]}
                  />
                  <Bar dataKey="valor" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">Nenhuma despesa no período</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FluxoCaixa;
