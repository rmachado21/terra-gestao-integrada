import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, FileText } from 'lucide-react';
import PedidoForm from './PedidoForm';
import PedidoDetails from './PedidoDetails';
import PedidoItem from './PedidoItem';
import { Pedido } from '../types/pedido';
import { usePedidosQuery } from '../hooks/usePedidosQuery';
import { usePedidoMutations } from '../hooks/usePedidoMutations';

const PedidosList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const [viewingPedido, setViewingPedido] = useState<Pedido | null>(null);

  const { data: pedidos, isLoading } = usePedidosQuery(searchTerm, statusFilter);
  const { updateStatusMutation } = usePedidoMutations();

  const handleEdit = (pedido: Pedido) => {
    setEditingPedido(pedido);
    setShowForm(true);
  };

  const handleView = (pedido: Pedido) => {
    setViewingPedido(pedido);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPedido(null);
  };

  const handleStatusChange = (pedidoId: string, status: 'pendente' | 'processando' | 'entregue' | 'cancelado') => {
    updateStatusMutation.mutate({ pedidoId, status });
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
                <PedidoItem
                  key={pedido.id}
                  pedido={pedido}
                  onEdit={handleEdit}
                  onView={handleView}
                  onStatusChange={handleStatusChange}
                  isUpdatingStatus={updateStatusMutation.isPending}
                />
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
