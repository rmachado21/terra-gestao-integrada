
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Pedido {
  id: string;
  cliente_id: string | null;
  data_pedido: string;
  data_entrega: string | null;
  valor_total: number;
  status: 'pendente' | 'processando' | 'entregue' | 'cancelado';
  observacoes: string | null;
}

interface ItemPedido {
  id?: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

interface PedidoFormProps {
  pedido?: Pedido | null;
  onClose: () => void;
}

const PedidoForm = ({ pedido, onClose }: PedidoFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    cliente_id: pedido?.cliente_id || '',
    data_pedido: pedido?.data_pedido || new Date().toISOString().split('T')[0],
    data_entrega: pedido?.data_entrega || '',
    status: pedido?.status || 'pendente' as const,
    observacoes: pedido?.observacoes || ''
  });

  const [itens, setItens] = useState<ItemPedido[]>([]);

  // Buscar clientes
  const { data: clientes } = useQuery({
    queryKey: ['clientes-select', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Buscar produtos
  const { data: produtos } = useQuery({
    queryKey: ['produtos-select', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, preco_venda, unidade_medida')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Buscar itens do pedido se estiver editando
  useEffect(() => {
    if (pedido?.id) {
      const fetchItens = async () => {
        const { data, error } = await supabase
          .from('itens_pedido')
          .select('*')
          .eq('pedido_id', pedido.id);
        
        if (error) {
          console.error('Erro ao buscar itens:', error);
          return;
        }
        
        setItens(data || []);
      };
      
      fetchItens();
    }
  }, [pedido?.id]);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const valorTotal = itens.reduce((sum, item) => sum + item.subtotal, 0);

      const pedidoData = {
        ...data,
        user_id: user.id,
        valor_total: valorTotal,
        cliente_id: data.cliente_id || null,
        data_entrega: data.data_entrega || null,
        observacoes: data.observacoes || null
      };

      let pedidoId: string;

      if (pedido) {
        const { error } = await supabase
          .from('pedidos')
          .update(pedidoData)
          .eq('id', pedido.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        pedidoId = pedido.id;
      } else {
        const { data: novoPedido, error } = await supabase
          .from('pedidos')
          .insert([pedidoData])
          .select('id')
          .single();
        
        if (error) throw error;
        pedidoId = novoPedido.id;
      }

      // Deletar itens existentes se estiver editando
      if (pedido) {
        await supabase
          .from('itens_pedido')
          .delete()
          .eq('pedido_id', pedidoId);
      }

      // Inserir novos itens
      if (itens.length > 0) {
        const itensData = itens.map(item => ({
          pedido_id: pedidoId,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal,
          user_id: user.id
        }));

        const { error } = await supabase
          .from('itens_pedido')
          .insert(itensData);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: pedido ? 'Pedido atualizado' : 'Pedido criado',
        description: `Pedido ${pedido ? 'atualizado' : 'criado'} com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      onClose();
    },
    onError: (error) => {
      console.error('Erro ao salvar pedido:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o pedido.',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente_id) {
      toast({
        title: 'Campo obrigatório',
        description: 'Selecione um cliente.',
        variant: 'destructive',
      });
      return;
    }

    if (itens.length === 0) {
      toast({
        title: 'Itens obrigatórios',
        description: 'Adicione pelo menos um item ao pedido.',
        variant: 'destructive',
      });
      return;
    }

    mutation.mutate(formData);
  };

  const adicionarItem = () => {
    setItens([...itens, {
      produto_id: '',
      quantidade: 1,
      preco_unitario: 0,
      subtotal: 0
    }]);
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const atualizarItem = (index: number, campo: keyof ItemPedido, valor: any) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [campo]: valor };
    
    // Recalcular subtotal
    if (campo === 'quantidade' || campo === 'preco_unitario') {
      novosItens[index].subtotal = novosItens[index].quantidade * novosItens[index].preco_unitario;
    }
    
    // Se mudou o produto, atualizar o preço
    if (campo === 'produto_id') {
      const produto = produtos?.find(p => p.id === valor);
      if (produto?.preco_venda) {
        novosItens[index].preco_unitario = produto.preco_venda;
        novosItens[index].subtotal = novosItens[index].quantidade * produto.preco_venda;
      }
    }
    
    setItens(novosItens);
  };

  const valorTotal = itens.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <Card className="fixed inset-0 z-50 bg-white shadow-lg overflow-y-auto">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>
            {pedido ? 'Editar Pedido' : 'Novo Pedido'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cliente_id">Cliente *</Label>
              <Select value={formData.cliente_id} onValueChange={(value) => setFormData(prev => ({ ...prev, cliente_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes?.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="processando">Processando</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_pedido">Data do Pedido</Label>
              <Input
                id="data_pedido"
                type="date"
                value={formData.data_pedido}
                onChange={(e) => setFormData(prev => ({ ...prev, data_pedido: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_entrega">Data de Entrega</Label>
              <Input
                id="data_entrega"
                type="date"
                value={formData.data_entrega}
                onChange={(e) => setFormData(prev => ({ ...prev, data_entrega: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Itens do Pedido</h3>
              <Button type="button" onClick={adicionarItem}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            <div className="space-y-4">
              {itens.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>Produto</Label>
                      <Select value={item.produto_id} onValueChange={(value) => atualizarItem(index, 'produto_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {produtos?.map((produto) => (
                            <SelectItem key={produto.id} value={produto.id}>
                              {produto.nome} - {produto.unidade_medida}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => atualizarItem(index, 'quantidade', Number(e.target.value))}
                        min="1"
                        step="0.1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Preço Unitário</Label>
                      <Input
                        type="number"
                        value={item.preco_unitario}
                        onChange={(e) => atualizarItem(index, 'preco_unitario', Number(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Subtotal</Label>
                      <Input
                        value={`R$ ${item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        disabled
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removerItem(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {itens.length > 0 && (
              <div className="text-right">
                <p className="text-lg font-semibold">
                  Total: R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações sobre o pedido..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {mutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PedidoForm;
