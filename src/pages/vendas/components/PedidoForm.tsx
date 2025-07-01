
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';
import { useToast } from '@/hooks/use-toast';
import { Pedido } from '../types/pedido';

interface PedidoFormProps {
  pedido?: Pedido | null;
  onClose: () => void;
}

interface ItemPedido {
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

const PedidoForm = ({ pedido, onClose }: PedidoFormProps) => {
  const { effectiveUserId } = useEffectiveUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    cliente_id: '',
    data_pedido: new Date().toISOString().split('T')[0],
    status: 'pendente' as const,
    observacoes: ''
  });

  const [itens, setItens] = useState<ItemPedido[]>([{
    produto_id: '',
    quantidade: 1,
    preco_unitario: 0,
    subtotal: 0
  }]);

  // Buscar clientes
  const { data: clientes } = useQuery({
    queryKey: ['clientes-form', effectiveUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('user_id', effectiveUserId)
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      return data;
    },
    enabled: !!effectiveUserId
  });

  // Buscar produtos
  const { data: produtos } = useQuery({
    queryKey: ['produtos-form', effectiveUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, preco_venda, unidade_medida')
        .eq('user_id', effectiveUserId)
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      return data;
    },
    enabled: !!effectiveUserId
  });

  // Buscar dados do pedido para edição
  useEffect(() => {
    if (pedido) {
      setFormData({
        cliente_id: pedido.cliente_id || '',
        data_pedido: pedido.data_pedido,
        status: pedido.status,
        observacoes: pedido.observacoes || ''
      });

      // Buscar itens do pedido
      const fetchItens = async () => {
        const { data, error } = await supabase
          .from('itens_pedido')
          .select('produto_id, quantidade, preco_unitario, subtotal')
          .eq('pedido_id', pedido.id);

        if (error) {
          console.error('Erro ao buscar itens:', error);
          return;
        }

        if (data && data.length > 0) {
          setItens(data);
        }
      };

      fetchItens();
    }
  }, [pedido]);

  // Criar/atualizar pedido
  const savePedidoMutation = useMutation({
    mutationFn: async (data: any) => {
      if (pedido) {
        // Atualizar pedido existente
        const { error: pedidoError } = await supabase
          .from('pedidos')
          .update({
            cliente_id: data.cliente_id,
            data_pedido: data.data_pedido,
            status: data.status,
            observacoes: data.observacoes,
            valor_total: data.valor_total
          })
          .eq('id', pedido.id)
          .eq('user_id', effectiveUserId!);

        if (pedidoError) throw pedidoError;

        // Deletar itens antigos
        const { error: deleteError } = await supabase
          .from('itens_pedido')
          .delete()
          .eq('pedido_id', pedido.id);

        if (deleteError) throw deleteError;

        // Inserir novos itens
        const { error: itensError } = await supabase
          .from('itens_pedido')
          .insert(
            data.itens.map((item: ItemPedido) => ({
              ...item,
              pedido_id: pedido.id,
              user_id: effectiveUserId
            }))
          );

        if (itensError) throw itensError;
      } else {
        // Criar novo pedido
        const { data: novoPedido, error: pedidoError } = await supabase
          .from('pedidos')
          .insert([{
            ...data,
            user_id: effectiveUserId
          }])
          .select()
          .single();

        if (pedidoError) throw pedidoError;

        // Inserir itens
        const { error: itensError } = await supabase
          .from('itens_pedido')
          .insert(
            data.itens.map((item: ItemPedido) => ({
              ...item,
              pedido_id: novoPedido.id,
              user_id: effectiveUserId
            }))
          );

        if (itensError) throw itensError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['vendas-stats'] });
      toast({
        title: pedido ? 'Pedido atualizado' : 'Pedido criado',
        description: `Pedido ${pedido ? 'atualizado' : 'criado'} com sucesso.`
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar pedido',
        description: 'Não foi possível salvar o pedido.',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const itensValidos = itens.filter(item => 
      item.produto_id && item.quantidade > 0 && item.preco_unitario > 0
    );

    if (itensValidos.length === 0) {
      toast({
        title: 'Erro de validação',
        description: 'Adicione pelo menos um item ao pedido.',
        variant: 'destructive'
      });
      return;
    }

    const valorTotal = itensValidos.reduce((sum, item) => sum + item.subtotal, 0);

    savePedidoMutation.mutate({
      ...formData,
      valor_total: valorTotal,
      itens: itensValidos
    });
  };

  const handleItemChange = (index: number, field: keyof ItemPedido, value: any) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [field]: value };

    // Recalcular subtotal quando quantidade ou preço mudar
    if (field === 'quantidade' || field === 'preco_unitario') {
      novosItens[index].subtotal = novosItens[index].quantidade * novosItens[index].preco_unitario;
    }

    // Se produto mudou, atualizar preço automaticamente
    if (field === 'produto_id') {
      const produto = produtos?.find(p => p.id === value);
      if (produto) {
        novosItens[index].preco_unitario = produto.preco_venda || 0;
        novosItens[index].subtotal = novosItens[index].quantidade * (produto.preco_venda || 0);
      }
    }

    setItens(novosItens);
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
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index));
    }
  };

  const valorTotal = itens.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <Card className="fixed inset-0 z-50 bg-white shadow-xl overflow-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {pedido ? 'Editar Pedido' : 'Novo Pedido'}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cliente_id">Cliente</Label>
              <Select 
                value={formData.cliente_id} 
                onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes?.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="data_pedido">Data do Pedido</Label>
              <Input 
                id="data_pedido" 
                type="date" 
                value={formData.data_pedido} 
                onChange={(e) => setFormData({ ...formData, data_pedido: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData({ ...formData, status: value as any })}
            >
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

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Itens do Pedido</Label>
              <Button type="button" onClick={adicionarItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {itens.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded">
                  <div className="col-span-4">
                    <Label>Produto</Label>
                    <Select 
                      value={item.produto_id} 
                      onValueChange={(value) => handleItemChange(index, 'produto_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
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
                  
                  <div className="col-span-2">
                    <Label>Quantidade</Label>
                    <Input 
                      type="number" 
                      value={item.quantidade} 
                      onChange={(e) => handleItemChange(index, 'quantidade', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label>Preço Unit.</Label>
                    <Input 
                      type="number" 
                      value={item.preco_unitario} 
                      onChange={(e) => handleItemChange(index, 'preco_unitario', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="col-span-3">
                    <Label>Subtotal</Label>
                    <Input 
                      type="text" 
                      value={`R$ ${item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      disabled
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => removerItem(index)}
                      disabled={itens.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-right mt-4 p-4 bg-gray-50 rounded">
              <span className="text-lg font-semibold">
                Total: R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea 
              id="observacoes" 
              value={formData.observacoes} 
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} 
              placeholder="Observações sobre o pedido..." 
            />
          </div>
          
          <div className="flex gap-4 pt-6">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {pedido ? 'Atualizar' : 'Criar'} Pedido
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PedidoForm;
