import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';
import { useToast } from '@/hooks/use-toast';
import { usePedidoMutations } from '../../../hooks/usePedidoMutations';
import { FormData, ItemPedido, Cliente, Produto } from '../types';
import { Pedido } from '../../../types/pedido';

export const usePedidoForm = (pedido?: Pedido | null, onClose?: () => void) => {
  const { effectiveUserId } = useEffectiveUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { updatePedidoMutation } = usePedidoMutations();

  const [formData, setFormData] = useState<FormData>({
    cliente_id: '',
    data_pedido: new Date().toISOString().split('T')[0],
    status: 'pendente',
    observacoes: ''
  });

  const [itens, setItens] = useState<ItemPedido[]>([{
    produto_id: '',
    quantidade: 1,
    preco_unitario: 0,
    subtotal: 0
  }]);

  // Buscar clientes
  const { data: clientes } = useQuery<Cliente[]>({
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
  const { data: produtos } = useQuery<Produto[]>({
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

  // Criar/atualizar pedido com sincronização financeira
  const savePedidoMutation = useMutation({
    mutationFn: async (data: any) => {
      if (pedido) {
        // Armazenar status anterior para sincronização
        const statusAnterior = pedido.status;
        
        // Atualizar pedido usando a nova mutação
        await updatePedidoMutation.mutateAsync({
          pedidoId: pedido.id,
          cliente_id: data.cliente_id,
          data_pedido: data.data_pedido,
          status: data.status,
          observacoes: data.observacoes,
          valor_total: data.valor_total,
          statusAnterior
        });

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
            cliente_id: data.cliente_id,
            data_pedido: data.data_pedido,
            status: data.status,
            observacoes: data.observacoes,
            valor_total: data.valor_total,
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

        // Sincronizar movimentações financeiras para pedidos novos entregues
        if (data.status === 'entregue') {
          await updatePedidoMutation.mutateAsync({
            pedidoId: novoPedido.id,
            cliente_id: data.cliente_id,
            data_pedido: data.data_pedido,
            status: data.status,
            observacoes: data.observacoes,
            valor_total: data.valor_total,
            statusAnterior: 'pendente'
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['vendas-stats'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-financeiras'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: pedido ? 'Pedido atualizado' : 'Pedido criado',
        description: `Pedido ${pedido ? 'atualizado' : 'criado'} com sucesso. Movimentações financeiras sincronizadas.`
      });
      if (onClose) onClose();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar pedido',
        description: 'Não foi possível salvar o pedido.',
        variant: 'destructive'
      });
    }
  });

  const handleFormDataChange = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const itensValidos = itens.filter(item => 
      item.produto_id && item.quantidade > 0 && item.preco_unitario > 0
    );

    if (!formData.cliente_id) {
      toast({
        title: 'Cliente obrigatório',
        description: 'Selecione um cliente para o pedido.',
        variant: 'destructive'
      });
      return;
    }

    if (itensValidos.length === 0) {
      toast({
        title: 'Itens obrigatórios',
        description: 'Adicione pelo menos um item ao pedido.',
        variant: 'destructive'
      });
      return;
    }

    const valorTotal = itensValidos.reduce((sum, item) => sum + item.subtotal, 0);

    savePedidoMutation.mutate({
      cliente_id: formData.cliente_id,
      data_pedido: formData.data_pedido,
      status: formData.status,
      observacoes: formData.observacoes,
      valor_total: valorTotal,
      itens: itensValidos
    });
  };

  const valorTotal = itens.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    formData,
    itens,
    clientes,
    produtos,
    valorTotal,
    isLoading: savePedidoMutation.isPending,
    handleFormDataChange,
    handleItemChange,
    adicionarItem,
    removerItem,
    handleSubmit
  };
};