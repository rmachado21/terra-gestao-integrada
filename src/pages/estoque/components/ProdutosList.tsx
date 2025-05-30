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
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
interface Produto {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  unidade_medida: string;
  preco_venda: number;
  ativo: boolean;
  created_at: string;
}
const ProdutosList = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    descricao: '',
    unidade_medida: '',
    preco_venda: ''
  });

  // Buscar produtos
  const {
    data: produtos,
    isLoading
  } = useQuery({
    queryKey: ['produtos', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const {
        data,
        error
      } = await supabase.from('produtos').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data as Produto[];
    },
    enabled: !!user?.id
  });
  const categorias = [...new Set(produtos?.map(p => p.categoria).filter(Boolean))];
  const produtosFiltrados = produtos?.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) || produto.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || produto.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const produtoMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingProduto) {
        const {
          error
        } = await supabase.from('produtos').update(data).eq('id', editingProduto.id).eq('user_id', user?.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from('produtos').insert([{
          ...data,
          user_id: user?.id
        }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['produtos']
      });
      toast({
        title: editingProduto ? 'Produto atualizado!' : 'Produto criado!',
        description: 'As alterações foram salvas com sucesso.'
      });
      handleCloseDialog();
    },
    onError: error => {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar produto.',
        variant: 'destructive'
      });
      console.error('Erro ao salvar produto:', error);
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const {
        error
      } = await supabase.from('produtos').delete().eq('id', id).eq('user_id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['produtos']
      });
      toast({
        title: 'Produto excluído!',
        description: 'O produto foi removido com sucesso.'
      });
    }
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.unidade_medida) {
      toast({
        title: 'Erro',
        description: 'Nome e unidade de medida são obrigatórios.',
        variant: 'destructive'
      });
      return;
    }
    const data = {
      ...formData,
      preco_venda: formData.preco_venda ? parseFloat(formData.preco_venda) : null,
      ativo: true
    };
    produtoMutation.mutate(data);
  };
  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome,
      categoria: produto.categoria || '',
      descricao: produto.descricao || '',
      unidade_medida: produto.unidade_medida,
      preco_venda: produto.preco_venda?.toString() || ''
    });
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduto(null);
    setFormData({
      nome: '',
      categoria: '',
      descricao: '',
      unidade_medida: '',
      preco_venda: ''
    });
  };
  if (isLoading) {
    return <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando produtos...</div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Produtos Cadastrados</span>
          </CardTitle>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto bg-orange-950 hover:bg-orange-800">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduto ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input id="nome" value={formData.nome} onChange={e => setFormData({
                  ...formData,
                  nome: e.target.value
                })} placeholder="Nome do produto" required />
                </div>
                
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input id="categoria" value={formData.categoria} onChange={e => setFormData({
                  ...formData,
                  categoria: e.target.value
                })} placeholder="Ex: Mandioca, Processados, etc." />
                </div>
                
                <div>
                  <Label htmlFor="unidade_medida">Unidade de Medida *</Label>
                  <Select value={formData.unidade_medida} onValueChange={value => setFormData({
                  ...formData,
                  unidade_medida: value
                })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Quilograma (kg)</SelectItem>
                      <SelectItem value="g">Grama (g)</SelectItem>
                      <SelectItem value="un">Unidade (un)</SelectItem>
                      <SelectItem value="cx">Caixa (cx)</SelectItem>
                      <SelectItem value="sc">Saco (sc)</SelectItem>
                      <SelectItem value="l">Litro (l)</SelectItem>
                      <SelectItem value="ml">Mililitro (ml)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="preco_venda">Preço de Venda (R$)</Label>
                  <Input id="preco_venda" type="number" step="0.01" value={formData.preco_venda} onChange={e => setFormData({
                  ...formData,
                  preco_venda: e.target.value
                })} placeholder="0.00" />
                </div>
                
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea id="descricao" value={formData.descricao} onChange={e => setFormData({
                  ...formData,
                  descricao: e.target.value
                })} placeholder="Descrição do produto..." rows={3} />
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={produtoMutation.isPending}>
                    {produtoMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filtros responsivos */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="flex-1">
            <Input placeholder="Buscar produtos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="w-full sm:w-48">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as categorias</SelectItem>
                {categorias.map(categoria => <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conteúdo adaptativo */}
        {produtosFiltrados && produtosFiltrados.length > 0 ? <>
            {/* Versão Mobile - Cards */}
            {isMobile ? <div className="space-y-4">
                {produtosFiltrados.map(produto => <Card key={produto.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{produto.nome}</h3>
                          <p className="text-sm text-gray-600">{produto.unidade_medida}</p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(produto)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(produto.id)} disabled={deleteMutation.isPending}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {produto.categoria && <Badge variant="secondary">{produto.categoria}</Badge>}
                        <Badge variant={produto.ativo ? "default" : "secondary"}>
                          {produto.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      
                      {produto.preco_venda && <p className="text-sm font-medium">
                          Preço: R$ {produto.preco_venda.toFixed(2)}
                        </p>}
                    </div>
                  </Card>)}
              </div> : (/* Versão Desktop - Tabela */
        <div className="overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Nome</TableHead>
                      <TableHead className="min-w-[120px]">Categoria</TableHead>
                      <TableHead className="min-w-[80px]">Unidade</TableHead>
                      <TableHead className="min-w-[100px]">Preço</TableHead>
                      <TableHead className="min-w-[80px]">Status</TableHead>
                      <TableHead className="min-w-[120px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtosFiltrados.map(produto => <TableRow key={produto.id}>
                        <TableCell className="font-medium">{produto.nome}</TableCell>
                        <TableCell>
                          {produto.categoria && <Badge variant="secondary">{produto.categoria}</Badge>}
                        </TableCell>
                        <TableCell>{produto.unidade_medida}</TableCell>
                        <TableCell>
                          {produto.preco_venda ? `R$ ${produto.preco_venda.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={produto.ativo ? "default" : "secondary"}>
                            {produto.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(produto)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(produto.id)} disabled={deleteMutation.isPending}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div>)}
          </> : <div className="text-center py-8 text-gray-500">
            {produtos?.length === 0 ? 'Nenhum produto cadastrado ainda.' : 'Nenhum produto encontrado com os filtros aplicados.'}
          </div>}
      </CardContent>
    </Card>;
};
export default ProdutosList;