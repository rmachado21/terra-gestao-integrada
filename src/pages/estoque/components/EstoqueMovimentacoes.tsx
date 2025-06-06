import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
interface EstoqueItem {
  id: string;
  produto_id: string;
  quantidade: number;
  quantidade_minima: number;
  data_validade: string | null;
  lote: string | null;
  observacoes: string | null;
  produtos: {
    nome: string;
    unidade_medida: string;
  };
}
const EstoqueMovimentacoes = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    produto_id: '',
    tipo_movimento: 'entrada',
    // entrada ou saida
    quantidade: '',
    data_validade: '',
    lote: '',
    quantidade_minima: '',
    observacoes: ''
  });

  // Buscar produtos para o select
  const {
    data: produtos
  } = useQuery({
    queryKey: ['produtos-select', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const {
        data,
        error
      } = await supabase.from('produtos').select('id, nome, unidade_medida').eq('user_id', user.id).eq('ativo', true).order('nome');
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Buscar itens do estoque
  const {
    data: estoque,
    isLoading
  } = useQuery({
    queryKey: ['estoque', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const {
        data,
        error
      } = await supabase.from('estoque').select(`
          *,
          produtos (nome, unidade_medida)
        `).eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data as EstoqueItem[];
    },
    enabled: !!user?.id
  });

  // Filtrar estoque
  const estoqueFiltrado = estoque?.filter(item => item.produtos?.nome.toLowerCase().includes(searchTerm.toLowerCase()) || item.lote?.toLowerCase().includes(searchTerm.toLowerCase()));

  // Mutation para movimentação
  const movimentacaoMutation = useMutation({
    mutationFn: async (data: any) => {
      const {
        tipo_movimento,
        produto_id,
        quantidade,
        ...restoData
      } = data;

      // Verificar se já existe item no estoque para este produto
      const {
        data: existingItem
      } = await supabase.from('estoque').select('*').eq('user_id', user?.id).eq('produto_id', produto_id).eq('lote', data.lote || '').single();
      if (existingItem) {
        // Atualizar quantidade existente
        const novaQuantidade = tipo_movimento === 'entrada' ? existingItem.quantidade + parseInt(quantidade) : existingItem.quantidade - parseInt(quantidade);
        if (novaQuantidade < 0) {
          throw new Error('Quantidade insuficiente no estoque');
        }
        const {
          error
        } = await supabase.from('estoque').update({
          quantidade: novaQuantidade,
          ...restoData,
          updated_at: new Date().toISOString()
        }).eq('id', existingItem.id);
        if (error) throw error;
      } else {
        // Criar novo item no estoque (apenas para entrada)
        if (tipo_movimento === 'saida') {
          throw new Error('Não é possível dar saída de produto que não está no estoque');
        }
        const {
          error
        } = await supabase.from('estoque').insert([{
          produto_id,
          quantidade: parseInt(quantidade),
          user_id: user?.id,
          ...restoData
        }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['estoque']
      });
      toast({
        title: 'Movimentação registrada!',
        description: 'A movimentação do estoque foi registrada com sucesso.'
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao registrar movimentação.',
        variant: 'destructive'
      });
    }
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.produto_id || !formData.quantidade || !formData.tipo_movimento) {
      toast({
        title: 'Erro',
        description: 'Produto, tipo de movimento e quantidade são obrigatórios.',
        variant: 'destructive'
      });
      return;
    }
    const data = {
      ...formData,
      quantidade_minima: formData.quantidade_minima ? parseInt(formData.quantidade_minima) : 0,
      data_validade: formData.data_validade || null
    };
    movimentacaoMutation.mutate(data);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      produto_id: '',
      tipo_movimento: 'entrada',
      quantidade: '',
      data_validade: '',
      lote: '',
      quantidade_minima: '',
      observacoes: ''
    });
  };
  if (isLoading) {
    return <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando estoque...</div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Controle de Estoque</span>
          </CardTitle>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Movimentação</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="produto_id">Produto *</Label>
                  <Select value={formData.produto_id} onValueChange={value => setFormData({
                  ...formData,
                  produto_id: value
                })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto..." />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos?.map(produto => <SelectItem key={produto.id} value={produto.id}>
                          {produto.nome} ({produto.unidade_medida})
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tipo_movimento">Tipo de Movimento *</Label>
                  <Select value={formData.tipo_movimento} onValueChange={value => setFormData({
                  ...formData,
                  tipo_movimento: value
                })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="quantidade">Quantidade *</Label>
                  <Input id="quantidade" type="number" value={formData.quantidade} onChange={e => setFormData({
                  ...formData,
                  quantidade: e.target.value
                })} placeholder="0" required />
                </div>
                
                <div>
                  <Label htmlFor="lote">Lote</Label>
                  <Input id="lote" value={formData.lote} onChange={e => setFormData({
                  ...formData,
                  lote: e.target.value
                })} placeholder="Número do lote" />
                </div>
                
                <div>
                  <Label htmlFor="data_validade">Data de Validade</Label>
                  <Input id="data_validade" type="date" value={formData.data_validade} onChange={e => setFormData({
                  ...formData,
                  data_validade: e.target.value
                })} />
                </div>
                
                <div>
                  <Label htmlFor="quantidade_minima">Quantidade Mínima</Label>
                  <Input id="quantidade_minima" type="number" value={formData.quantidade_minima} onChange={e => setFormData({
                  ...formData,
                  quantidade_minima: e.target.value
                })} placeholder="0" />
                </div>
                
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" value={formData.observacoes} onChange={e => setFormData({
                  ...formData,
                  observacoes: e.target.value
                })} placeholder="Observações sobre a movimentação..." rows={3} />
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={movimentacaoMutation.isPending}>
                    {movimentacaoMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filtro */}
        <div className="mb-6">
          <Input placeholder="Buscar por produto ou lote..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {/* Conteúdo adaptativo */}
        {estoqueFiltrado && estoqueFiltrado.length > 0 ? <>
            {/* Versão Mobile - Cards */}
            {isMobile ? <div className="space-y-4">
                {estoqueFiltrado.map(item => {
            const isLowStock = item.quantidade_minima > 0 && item.quantidade <= item.quantidade_minima;
            const isExpiringSoon = item.data_validade ? new Date(item.data_validade) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : false;
            return <Card key={item.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{item.produtos?.nome}</h3>
                            <p className="text-sm text-gray-600">{item.produtos?.unidade_medida}</p>
                          </div>
                          <div className="ml-4">
                            <p className="text-lg font-bold">{item.quantidade}</p>
                            <p className="text-xs text-gray-500">{item.produtos?.unidade_medida}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {item.lote && <Badge variant="outline">Lote: {item.lote}</Badge>}
                          {item.data_validade && <Badge variant="outline">
                              Venc: {format(new Date(item.data_validade), 'dd/MM/yyyy', {
                      locale: ptBR
                    })}
                            </Badge>}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {isLowStock && <Badge variant="destructive" className="text-xs">
                              Estoque Baixo
                            </Badge>}
                          {isExpiringSoon && <Badge variant="secondary" className="text-xs">
                              Vencendo
                            </Badge>}
                          {!isLowStock && !isExpiringSoon && <Badge variant="default" className="text-xs">
                              Normal
                            </Badge>}
                        </div>
                        
                        {item.quantidade_minima > 0 && <div className="text-sm text-gray-600">
                            <span>Qtd. Mínima: {item.quantidade_minima}</span>
                          </div>}
                      </div>
                    </Card>;
          })}
              </div> : (/* Versão Desktop - Tabela */
        <div className="overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Produto</TableHead>
                      <TableHead className="min-w-[100px]">Lote</TableHead>
                      <TableHead className="min-w-[120px]">Quantidade</TableHead>
                      <TableHead className="min-w-[100px]">Qtd. Mínima</TableHead>
                      <TableHead className="min-w-[100px]">Validade</TableHead>
                      <TableHead className="min-w-[120px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estoqueFiltrado.map(item => {
                const isLowStock = item.quantidade_minima > 0 && item.quantidade <= item.quantidade_minima;
                const isExpiringSoon = item.data_validade ? new Date(item.data_validade) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : false;
                return <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div className="min-w-0">
                              <div className="truncate">{item.produtos?.nome}</div>
                              <div className="text-sm text-gray-500 truncate">
                                {item.produtos?.unidade_medida}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{item.lote || '-'}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{item.quantidade}</span>
                              <span className="text-xs text-gray-500">{item.produtos?.unidade_medida}</span>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantidade_minima}</TableCell>
                          <TableCell className="text-sm">
                            {item.data_validade ? format(new Date(item.data_validade), 'dd/MM/yyyy', {
                      locale: ptBR
                    }) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              {isLowStock && <Badge variant="destructive" className="text-xs">
                                  Estoque Baixo
                                </Badge>}
                              {isExpiringSoon && <Badge variant="secondary" className="text-xs">
                                  Vencendo
                                </Badge>}
                              {!isLowStock && !isExpiringSoon && <Badge variant="default" className="text-xs">
                                  Normal
                                </Badge>}
                            </div>
                          </TableCell>
                        </TableRow>;
              })}
                  </TableBody>
                </Table>
              </div>)}
          </> : <div className="text-center py-8 text-gray-500">
            {estoque?.length === 0 ? 'Nenhum item no estoque ainda.' : 'Nenhum item encontrado com os filtros aplicados.'}
          </div>}
      </CardContent>
    </Card>;
};
export default EstoqueMovimentacoes;