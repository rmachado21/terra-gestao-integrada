
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Package, ArrowUp, ArrowDown, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingCard } from '@/components/ui/loading';

interface EstoqueItem {
  id: string;
  quantidade: number;
  quantidade_minima: number;
  data_validade?: string;
  lote?: string;
  observacoes?: string;
  created_at: string;
  produtos?: {
    id: string;
    nome: string;
    unidade_medida: string;
  };
}

interface Produto {
  id: string;
  nome: string;
  unidade_medida: string;
}

const EstoqueMovimentacoes = () => {
  const { effectiveUserId } = useEffectiveUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EstoqueItem | null>(null);
  const [formData, setFormData] = useState({
    produto_id: '',
    quantidade: '',
    quantidade_minima: '',
    data_validade: '',
    lote: '',
    observacoes: ''
  });

  const { data: estoqueItems, isLoading } = useQuery({
    queryKey: ['estoque', effectiveUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('estoque')
        .select(`
          *,
          produtos (
            id,
            nome,
            unidade_medida
          )
        `)
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EstoqueItem[];
    },
    enabled: !!effectiveUserId
  });

  const { data: produtos } = useQuery({
    queryKey: ['produtos-estoque', effectiveUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, unidade_medida')
        .eq('user_id', effectiveUserId)
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data as Produto[];
    },
    enabled: !!effectiveUserId
  });

  const createEstoqueMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('estoque')
        .insert([{
          ...data,
          user_id: effectiveUserId
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      toast({
        title: 'Item adicionado ao estoque',
        description: 'Item registrado com sucesso no estoque.'
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao adicionar item',
        description: 'Não foi possível adicionar o item ao estoque.',
        variant: 'destructive'
      });
    }
  });

  const updateEstoqueMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('estoque')
        .update(data)
        .eq('id', id)
        .eq('user_id', effectiveUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      toast({
        title: 'Item atualizado',
        description: 'Item do estoque atualizado com sucesso.'
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar item',
        description: 'Não foi possível atualizar o item do estoque.',
        variant: 'destructive'
      });
    }
  });

  const deleteEstoqueMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('estoque')
        .delete()
        .eq('id', id)
        .eq('user_id', effectiveUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      toast({
        title: 'Item removido',
        description: 'Item removido do estoque com sucesso.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover item',
        description: 'Não foi possível remover o item do estoque.',
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      produto_id: '',
      quantidade: '',
      quantidade_minima: '',
      data_validade: '',
      lote: '',
      observacoes: ''
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      produto_id: formData.produto_id,
      quantidade: parseFloat(formData.quantidade),
      quantidade_minima: parseFloat(formData.quantidade_minima) || 0,
      data_validade: formData.data_validade || null,
      lote: formData.lote || null,
      observacoes: formData.observacoes || null
    };

    if (editingItem) {
      updateEstoqueMutation.mutate({ id: editingItem.id, data });
    } else {
      createEstoqueMutation.mutate(data);
    }
  };

  const handleEdit = (item: EstoqueItem) => {
    setEditingItem(item);
    setFormData({
      produto_id: item.produtos?.id || '',
      quantidade: item.quantidade.toString(),
      quantidade_minima: item.quantidade_minima.toString(),
      data_validade: item.data_validade || '',
      lote: item.lote || '',
      observacoes: item.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este item do estoque?')) {
      deleteEstoqueMutation.mutate(id);
    }
  };

  const getQuantityStatus = (quantidade: number, quantidadeMinima: number) => {
    if (quantidade === 0) return { color: 'bg-red-100 text-red-800', label: 'Esgotado' };
    if (quantidade <= quantidadeMinima) return { color: 'bg-yellow-100 text-yellow-800', label: 'Baixo' };
    return { color: 'bg-green-100 text-green-800', label: 'Normal' };
  };

  const isNearExpiration = (dataValidade?: string) => {
    if (!dataValidade) return false;
    const hoje = new Date();
    const validade = new Date(dataValidade);
    const diasParaVencer = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diasParaVencer <= 30 && diasParaVencer >= 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Movimentações de Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingCard count={4} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Movimentações de Estoque</span>
            </CardTitle>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Editar Item do Estoque' : 'Adicionar Item ao Estoque'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem ? 'Atualize as informações do item' : 'Registre um novo item no estoque'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="produto_id">Produto</Label>
                    <Select value={formData.produto_id} onValueChange={(value) => setFormData({ ...formData, produto_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {produtos?.map(produto => (
                          <SelectItem key={produto.id} value={produto.id}>
                            {produto.nome} ({produto.unidade_medida})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantidade">Quantidade</Label>
                      <Input 
                        id="quantidade" 
                        type="number" 
                        step="0.01"
                        value={formData.quantidade} 
                        onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })} 
                        placeholder="Ex: 100" 
                        required 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="quantidade_minima">Quantidade Mínima</Label>
                      <Input 
                        id="quantidade_minima" 
                        type="number" 
                        step="0.01"
                        value={formData.quantidade_minima} 
                        onChange={(e) => setFormData({ ...formData, quantidade_minima: e.target.value })} 
                        placeholder="Ex: 10" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="data_validade">Data de Validade</Label>
                      <Input 
                        id="data_validade" 
                        type="date" 
                        value={formData.data_validade} 
                        onChange={(e) => setFormData({ ...formData, data_validade: e.target.value })} 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="lote">Lote</Label>
                      <Input 
                        id="lote" 
                        value={formData.lote} 
                        onChange={(e) => setFormData({ ...formData, lote: e.target.value })} 
                        placeholder="Ex: L001" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea 
                      id="observacoes" 
                      value={formData.observacoes} 
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} 
                      placeholder="Informações adicionais..." 
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      {editingItem ? 'Atualizar' : 'Adicionar'} Item
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {estoqueItems?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum item no estoque</p>
                <p className="text-sm">Comece adicionando produtos ao seu estoque</p>
              </div>
            ) : (
              estoqueItems?.map((item) => {
                const statusQtd = getQuantityStatus(item.quantidade, item.quantidade_minima);
                const nearExpiration = isNearExpiration(item.data_validade);
                
                return (
                  <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{item.produtos?.nome}</h3>
                          <Badge className={statusQtd.color}>
                            {statusQtd.label}
                          </Badge>
                          {nearExpiration && (
                            <Badge variant="destructive">
                              Vencendo
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-600">
                          <div>
                            <strong>Quantidade:</strong> {item.quantidade} {item.produtos?.unidade_medida}
                          </div>
                          <div>
                            <strong>Mínima:</strong> {item.quantidade_minima} {item.produtos?.unidade_medida}
                          </div>
                          {item.data_validade && (
                            <div>
                              <strong>Validade:</strong> {new Date(item.data_validade).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                          {item.lote && (
                            <div>
                              <strong>Lote:</strong> {item.lote}
                            </div>
                          )}
                        </div>
                        
                        {item.observacoes && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Obs:</strong> {item.observacoes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstoqueMovimentacoes;
