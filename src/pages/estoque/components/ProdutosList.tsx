
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Package, Search, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  unidade_medida: string;
  preco_venda?: number;
  ativo: boolean;
  created_at: string;
}

const ProdutosList = () => {
  const { effectiveUserId } = useEffectiveUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    unidade_medida: 'kg',
    preco_venda: '',
    ativo: true
  });

  const { data: produtos, isLoading } = useQuery({
    queryKey: ['produtos', effectiveUserId, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('produtos')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Produto[];
    },
    enabled: !!effectiveUserId
  });

  const createProdutoMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('produtos')
        .insert([{
          ...data,
          user_id: effectiveUserId
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast({
        title: 'Produto criado',
        description: 'Produto cadastrado com sucesso.'
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar produto',
        description: 'Não foi possível cadastrar o produto.',
        variant: 'destructive'
      });
    }
  });

  const updateProdutoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('produtos')
        .update(data)
        .eq('id', id)
        .eq('user_id', effectiveUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast({
        title: 'Produto atualizado',
        description: 'Produto atualizado com sucesso.'
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar produto',
        description: 'Não foi possível atualizar o produto.',
        variant: 'destructive'
      });
    }
  });

  const deleteProdutoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id)
        .eq('user_id', effectiveUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast({
        title: 'Produto excluído',
        description: 'Produto excluído com sucesso.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir produto',
        description: 'Não foi possível excluir o produto.',
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      categoria: '',
      unidade_medida: 'kg',
      preco_venda: '',
      ativo: true
    });
    setEditingProduto(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      preco_venda: formData.preco_venda ? parseFloat(formData.preco_venda) : null
    };

    if (editingProduto) {
      updateProdutoMutation.mutate({ id: editingProduto.id, data });
    } else {
      createProdutoMutation.mutate(data);
    }
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao || '',
      categoria: produto.categoria || '',
      unidade_medida: produto.unidade_medida,
      preco_venda: produto.preco_venda?.toString() || '',
      ativo: produto.ativo
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProdutoMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Produtos</span>
            </CardTitle>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingProduto ? 'Editar Produto' : 'Cadastrar Produto'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProduto ? 'Atualize as informações do produto' : 'Cadastre um novo produto'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome do Produto</Label>
                    <Input 
                      id="nome" 
                      value={formData.nome} 
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })} 
                      placeholder="Ex: Tomate Orgânico" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Input 
                      id="categoria" 
                      value={formData.categoria} 
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} 
                      placeholder="Ex: Hortaliças, Frutas..." 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="unidade_medida">Unidade de Medida</Label>
                      <Select value={formData.unidade_medida} onValueChange={(value) => setFormData({ ...formData, unidade_medida: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Quilograma (kg)</SelectItem>
                          <SelectItem value="g">Grama (g)</SelectItem>
                          <SelectItem value="t">Tonelada (t)</SelectItem>
                          <SelectItem value="l">Litro (l)</SelectItem>
                          <SelectItem value="ml">Mililitro (ml)</SelectItem>
                          <SelectItem value="un">Unidade (un)</SelectItem>
                          <SelectItem value="cx">Caixa (cx)</SelectItem>
                          <SelectItem value="sc">Saco (sc)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="preco_venda">Preço de Venda (R$)</Label>
                      <Input 
                        id="preco_venda" 
                        type="number" 
                        step="0.01"
                        value={formData.preco_venda} 
                        onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })} 
                        placeholder="Ex: 12.50" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea 
                      id="descricao" 
                      value={formData.descricao} 
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} 
                      placeholder="Descrição detalhada do produto..." 
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="ativo" 
                      checked={formData.ativo}
                      onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                    />
                    <Label htmlFor="ativo">Produto ativo</Label>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      {editingProduto ? 'Atualizar' : 'Cadastrar'} Produto
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {produtos?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum produto encontrado</p>
                <p className="text-sm">Comece cadastrando seus produtos</p>
              </div>
            ) : (
              produtos?.map((produto) => (
                <div key={produto.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{produto.nome}</h3>
                        <Badge variant={produto.ativo ? 'default' : 'secondary'}>
                          {produto.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {produto.categoria && (
                          <Badge variant="outline">
                            {produto.categoria}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <strong>Unidade:</strong> {produto.unidade_medida}
                        </div>
                        {produto.preco_venda && (
                          <div>
                            <strong>Preço:</strong> R$ {produto.preco_venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        )}
                        <div>
                          <strong>Cadastrado:</strong> {new Date(produto.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      
                      {produto.descricao && (
                        <p className="text-sm text-gray-600 mt-2">{produto.descricao}</p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(produto)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(produto.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProdutosList;
