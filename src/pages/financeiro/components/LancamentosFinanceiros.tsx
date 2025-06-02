import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
interface MovimentacaoFinanceira {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  data_movimentacao: string;
  observacoes?: string;
}
const categorias = {
  receita: ['Vendas', 'Subsídios', 'Investimentos', 'Outros'],
  despesa: ['Sementes', 'Fertilizantes', 'Equipamentos', 'Combustível', 'Mão de obra', 'Outros']
};
const LancamentosFinanceiros = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    tipo: 'despesa' as 'receita' | 'despesa',
    categoria: '',
    data_movimentacao: new Date().toISOString().split('T')[0],
    observacoes: ''
  });
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const {
    data: movimentacoes = [],
    isLoading
  } = useQuery({
    queryKey: ['movimentacoes-financeiras'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('movimentacoes_financeiras').select('*').order('data_movimentacao', {
        ascending: false
      });
      if (error) throw error;
      return data as MovimentacaoFinanceira[];
    }
  });
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const {
        error
      } = await supabase.from('movimentacoes_financeiras').insert([{
        ...data,
        valor: parseFloat(data.valor),
        user_id: (await supabase.auth.getUser()).data.user?.id
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['movimentacoes-financeiras']
      });
      toast({
        title: "Sucesso!",
        description: "Lançamento financeiro registrado com sucesso."
      });
      setShowForm(false);
      setFormData({
        descricao: '',
        valor: '',
        tipo: 'despesa',
        categoria: '',
        data_movimentacao: new Date().toISOString().split('T')[0],
        observacoes: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro!",
        description: "Erro ao registrar lançamento: " + error.message,
        variant: "destructive"
      });
    }
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao || !formData.valor || !formData.categoria) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    createMutation.mutate(formData);
  };
  const totalReceitas = movimentacoes.filter(m => m.tipo === 'receita').reduce((sum, m) => sum + m.valor, 0);
  const totalDespesas = movimentacoes.filter(m => m.tipo === 'despesa').reduce((sum, m) => sum + m.valor, 0);
  const saldo = totalReceitas - totalDespesas;
  if (isLoading) {
    return <div className="text-center py-4">Carregando...</div>;
  }
  return <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Receitas</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalReceitas.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2
                })}
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
                <p className="text-sm text-gray-600">Total Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {totalDespesas.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2
                })}
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
                <p className="text-sm text-gray-600">Saldo</p>
                <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {saldo.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2
                })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão Adicionar */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Movimentações Recentes</h3>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4" />
          Novo Lançamento
        </Button>
      </div>

      {/* Formulário */}
      {showForm && <Card>
          <CardHeader>
            <CardTitle>Novo Lançamento Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input id="descricao" value={formData.descricao} onChange={e => setFormData({
                ...formData,
                descricao: e.target.value
              })} placeholder="Ex: Venda de hortaliças" />
                </div>

                <div>
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input id="valor" type="number" step="0.01" value={formData.valor} onChange={e => setFormData({
                ...formData,
                valor: e.target.value
              })} placeholder="0,00" />
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(value: 'receita' | 'despesa') => setFormData({
                ...formData,
                tipo: value,
                categoria: ''
              })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={formData.categoria} onValueChange={value => setFormData({
                ...formData,
                categoria: value
              })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias[formData.tipo].map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="data">Data *</Label>
                  <Input id="data" type="date" value={formData.data_movimentacao} onChange={e => setFormData({
                ...formData,
                data_movimentacao: e.target.value
              })} />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" value={formData.observacoes} onChange={e => setFormData({
              ...formData,
              observacoes: e.target.value
            })} placeholder="Informações adicionais..." />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>}

      {/* Lista de Movimentações */}
      <div className="space-y-3">
        {movimentacoes.length === 0 ? <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Nenhuma movimentação registrada ainda.</p>
            </CardContent>
          </Card> : movimentacoes.map(mov => <Card key={mov.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {mov.tipo === 'receita' ? <TrendingUp className="h-5 w-5 text-green-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
                    <div>
                      <h4 className="font-medium">{mov.descricao}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(mov.data_movimentacao), 'dd/MM/yyyy', {
                    locale: ptBR
                  })}
                        <Badge variant="outline">{mov.categoria}</Badge>
                      </div>
                      {mov.observacoes && <p className="text-sm text-gray-500 mt-1">{mov.observacoes}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${mov.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                      {mov.tipo === 'receita' ? '+' : '-'} R$ {mov.valor.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2
                })}
                    </p>
                    <Badge variant={mov.tipo === 'receita' ? 'default' : 'destructive'}>
                      {mov.tipo === 'receita' ? 'Receita' : 'Despesa'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>)}
      </div>
    </div>;
};
export default LancamentosFinanceiros;