import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Eye, FileText, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';
import { useToast } from '@/hooks/use-toast';
import PedidoForm from './PedidoForm';
import PedidoDetails from './PedidoDetails';
import { usePedidoImpressao } from '../hooks/usePedidoImpressao';
import { Pedido } from '../types/pedido';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PedidosList = () => {
  const { effectiveUserId } = useEffectiveUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const [viewingPedido, setViewingPedido] = useState<Pedido | null>(null);

  // Buscar pedidos  
  const { data: pedidos, isLoading } = useQuery({
    queryKey: ['pedidos', effectiveUserId, searchTerm, statusFilter],
    queryFn: async () => {
      if (!effectiveUserId) return [];

      let query = supabase
        .from('pedidos')
        .select(`
          *,
          clientes:cliente_id (
            id,
            nome,
            telefone,
            endereco
          )
        `)
        .eq('user_id', effectiveUserId)
        .order('data_pedido', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter as 'pendente' | 'processando' | 'entregue' | 'cancelado');
      }

      const { data, error } = await query;
      if (error) throw error;
      
      const pedidosFormatted = data?.map(pedido => ({
        ...pedido,
        cliente: pedido.clientes
      })) || [];

      if (searchTerm) {
        return pedidosFormatted.filter(pedido => 
          pedido.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pedido.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return pedidosFormatted;
    },
    enabled: !!effectiveUserId
  });

  // Deletar pedido
  const deletePedidoMutation = useMutation({
    mutationFn: async (pedidoId: string) => {
      // Primeiro deletar itens do pedido
      const { error: itensError } = await supabase
        .from('itens_pedido')
        .delete()
        .eq('pedido_id', pedidoId)
        .eq('user_id', effectiveUserId!);
      
      if (itensError) throw itensError;

      // Depois deletar o pedido
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', pedidoId)
        .eq('user_id', effectiveUserId!);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Pedido excluído',
        description: 'Pedido excluído com sucesso.'
      });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['vendas-stats'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o pedido.',
        variant: 'destructive'
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'processando': return 'bg-blue-100 text-blue-800';
      case 'entregue': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'processando': return 'Processando';
      case 'entregue': return 'Entregue';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const handleEdit = (pedido: Pedido) => {
    setEditingPedido(pedido);
    setShowForm(true);
  };

  const handleDelete = (pedidoId: string) => {
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
      deletePedidoMutation.mutate(pedidoId);
    }
  };

  const handleView = (pedido: Pedido) => {
    setViewingPedido(pedido);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPedido(null);
  };

  const handlePrint = (pedidoId: string) => {
    // Implementar lógica de impressão usando o hook usePedidoImpressao
    window.open(`/pedidos/${pedidoId}/print`, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
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
              <FileText className="h-5 w-5" />
              <span>Pedidos</span>
            </CardTitle>
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Pedido
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar pedidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="processando">Processando</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4">
            {pedidos?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum pedido encontrado</p>
                <p className="text-sm">Comece criando um novo pedido</p>
              </div>
            ) : (
              pedidos?.map((pedido) => (
                <div key={pedido.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">Pedido #{pedido.id.slice(-8)}</h3>
                        <Badge className={getStatusColor(pedido.status)}>
                          {getStatusLabel(pedido.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <strong>Cliente:</strong> {pedido.cliente?.nome || 'Cliente não informado'}
                        </div>
                        <div>
                          <strong>Data:</strong> {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
                        </div>
                        <div>
                          <strong>Total:</strong> R$ {pedido.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      
                      {pedido.observacoes && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Obs:</strong> {pedido.observacoes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleView(pedido)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Visualizar Pedido</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handlePrint(pedido.id)}>
                              <Printer className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Imprimir Pedido</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(pedido)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar Pedido</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(pedido.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir Pedido</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <PedidoForm 
          pedido={editingPedido} 
          onClose={handleCloseForm} 
        />
      )}

      {viewingPedido && (
        <PedidoDetails
          pedido={viewingPedido}
          onClose={() => setViewingPedido(null)}
        />
      )}
    </div>
  );
};

export default PedidosList;
