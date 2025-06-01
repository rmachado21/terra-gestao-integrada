import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Eye, Calendar, DollarSign, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import PedidoForm from './PedidoForm';
import PedidoDetalhes from './PedidoDetalhes';

interface Pedido {
  id: string;
  cliente_id: string | null;
  data_pedido: string;
  data_entrega: string | null;
  valor_total: number;
  status: 'pendente' | 'processando' | 'entregue' | 'cancelado';
  observacoes: string | null;
  cliente: {
    id: string;
    nome: string;
  } | null;
}

const PedidosList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);

  // Buscar pedidos
  const { data: pedidos, isLoading } = useQuery({
    queryKey: ['pedidos', user?.id, searchTerm, statusFilter],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          clientes:cliente_id (
            id,
            nome
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

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
    enabled: !!user?.id
  });

  // Mutation para atualizar status do pedido
  const updateStatusMutation = useMutation({
    mutationFn: async ({ pedidoId, newStatus }: { pedidoId: string; newStatus: 'pendente' | 'processando' | 'entregue' | 'cancelado' }) => {
      // Buscar dados do pedido antes de atualizar
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .eq('user_id', user?.id)
        .single();

      if (pedidoError) throw pedidoError;

      // Atualizar status do pedido
      const { error } = await supabase
        .from('pedidos')
        .update({ status: newStatus })
        .eq('id', pedidoId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Se o novo status é "entregue", criar lançamento financeiro
      if (newStatus === 'entregue' && pedidoData.status !== 'entregue') {
        // Verificar se já existe um lançamento para este pedido
        const { data: existingLancamento } = await supabase
          .from('movimentacoes_financeiras')
          .select('id')
          .eq('pedido_id', pedidoId)
          .eq('user_id', user?.id)
          .maybeSingle();

        // Só criar se não existir um lançamento
        if (!existingLancamento) {
          const { error: lancamentoError } = await supabase
            .from('movimentacoes_financeiras')
            .insert({
              user_id: user.id,
              descricao: `Pedido #${pedidoId.slice(-8)}`,
              valor: pedidoData.valor_total,
              tipo: 'receita',
              categoria: 'Vendas',
              data_movimentacao: pedidoData.data_pedido,
              pedido_id: pedidoId
            });

          if (lancamentoError) {
            console.error('Erro ao criar lançamento financeiro:', lancamentoError);
            throw new Error('Erro ao criar lançamento financeiro automático');
          }
        }
      }

      return { pedidoData, newStatus };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-financeiras'] });
      
      if (data.newStatus === 'entregue' && data.pedidoData.status !== 'entregue') {
        toast({
          title: "Status atualizado",
          description: "O pedido foi marcado como entregue e um lançamento financeiro foi criado automaticamente."
        });
      } else {
        toast({
          title: "Status atualizado",
          description: "O status do pedido foi atualizado com sucesso."
        });
      }
    },
    onError: (error) => {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar o status do pedido.",
        variant: "destructive"
      });
    }
  });

  const handleStatusChange = (pedidoId: string, newStatus: string) => {
    updateStatusMutation.mutate({
      pedidoId,
      newStatus: newStatus as 'pendente' | 'processando' | 'entregue' | 'cancelado'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'processando':
        return 'bg-blue-100 text-blue-800';
      case 'entregue':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'processando':
        return 'Processando';
      case 'entregue':
        return 'Entregue';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const handleEdit = (pedido: Pedido) => {
    setEditingPedido(pedido);
    setShowForm(true);
  };

  const handleDetalhes = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setShowDetalhes(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPedido(null);
  };

  const handleCloseDetalhes = () => {
    setShowDetalhes(false);
    setSelectedPedido(null);
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
              <ShoppingCart className="h-5 w-5" />
              <span>Pedidos</span>
            </CardTitle>
            <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Pedido
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por cliente ou ID do pedido..."
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
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum pedido encontrado</p>
                <p className="text-sm">Comece criando um novo pedido</p>
              </div>
            ) : (
              pedidos?.map((pedido) => (
                <div key={pedido.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold">Pedido #{pedido.id.slice(-8)}</h3>
                        <Badge className={getStatusColor(pedido.status)}>
                          {getStatusLabel(pedido.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">Cliente:</span>
                          <span>{pedido.cliente?.nome || 'Cliente não informado'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>R$ {pedido.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {pedido.data_entrega ? (
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">Entrega:</span>
                            <span>{new Date(pedido.data_entrega).toLocaleDateString('pt-BR')}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-gray-400">
                            <span>Sem data de entrega</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">Status:</span>
                          <Select
                            value={pedido.status}
                            onValueChange={(value) => handleStatusChange(pedido.id, value)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <SelectTrigger className="w-32 h-7 text-xs">
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
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleDetalhes(pedido)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(pedido)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {showForm && <PedidoForm pedido={editingPedido} onClose={handleCloseForm} />}

      {showDetalhes && selectedPedido && <PedidoDetalhes pedido={selectedPedido} onClose={handleCloseDetalhes} />}
    </div>
  );
};

export default PedidosList;
