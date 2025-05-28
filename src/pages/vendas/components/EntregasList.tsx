
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Search, CheckCircle, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Entrega {
  id: string;
  data_pedido: string;
  data_entrega: string | null;
  valor_total: number;
  status: 'pendente' | 'processando' | 'entregue' | 'cancelado';
  cliente: {
    id: string;
    nome: string;
    endereco: string | null;
    cidade: string | null;
  } | null;
}

const EntregasList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pendente');

  // Buscar pedidos para entrega
  const { data: entregas, isLoading } = useQuery({
    queryKey: ['entregas', user?.id, searchTerm, statusFilter],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          clientes:cliente_id (
            id,
            nome,
            endereco,
            cidade
          )
        `)
        .eq('user_id', user.id)
        .order('data_pedido', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      const entregasFormatted = data?.map(pedido => ({
        ...pedido,
        cliente: pedido.clientes
      })) || [];

      if (searchTerm) {
        return entregasFormatted.filter(entrega => 
          entrega.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entrega.cliente?.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entrega.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return entregasFormatted;
    },
    enabled: !!user?.id
  });

  // Marcar como entregue
  const marcarEntregue = useMutation({
    mutationFn: async (pedidoId: string) => {
      const { error } = await supabase
        .from('pedidos')
        .update({ 
          status: 'entregue',
          data_entrega: new Date().toISOString().split('T')[0]
        })
        .eq('id', pedidoId)
        .eq('user_id', user!.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Entrega confirmada',
        description: 'Pedido marcado como entregue com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      queryClient.invalidateQueries({ queryKey: ['vendas-stats'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao confirmar entrega',
        description: 'Não foi possível marcar o pedido como entregue.',
        variant: 'destructive',
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

  const handleMarcarEntregue = (pedidoId: string) => {
    if (confirm('Confirmar que este pedido foi entregue?')) {
      marcarEntregue.mutate(pedidoId);
    }
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
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5" />
            <span>Controle de Entregas</span>
          </CardTitle>
          
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por cliente, cidade ou ID do pedido..."
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
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4">
            {entregas?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma entrega encontrada</p>
                <p className="text-sm">Entregas aparecerão aqui conforme os pedidos forem criados</p>
              </div>
            ) : (
              entregas?.map((entrega) => (
                <div key={entrega.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">Pedido #{entrega.id.slice(-8)}</h3>
                        <Badge className={getStatusColor(entrega.status)}>
                          {getStatusLabel(entrega.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-800">{entrega.cliente?.nome || 'Cliente não informado'}</p>
                          {entrega.cliente?.endereco && (
                            <p>{entrega.cliente.endereco}</p>
                          )}
                          {entrega.cliente?.cidade && (
                            <p>{entrega.cliente.cidade}</p>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Pedido: {new Date(entrega.data_pedido).toLocaleDateString('pt-BR')}</span>
                          </div>
                          {entrega.data_entrega && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Entregue: {new Date(entrega.data_entrega).toLocaleDateString('pt-BR')}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>R$ {entrega.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {entrega.status !== 'entregue' && entrega.status !== 'cancelado' && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleMarcarEntregue(entrega.id)}
                          disabled={marcarEntregue.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marcar como Entregue
                        </Button>
                      </div>
                    )}
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

export default EntregasList;
