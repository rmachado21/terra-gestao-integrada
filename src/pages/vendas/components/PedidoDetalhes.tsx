
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, DollarSign, User, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PedidoImpressaoButton from './PedidoImpressaoButton';

interface Pedido {
  id: string;
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

interface PedidoDetalhesProps {
  pedido: Pedido;
  onClose: () => void;
}

const PedidoDetalhes = ({ pedido, onClose }: PedidoDetalhesProps) => {
  // Buscar itens do pedido
  const { data: itens, isLoading } = useQuery({
    queryKey: ['pedido-itens', pedido.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('itens_pedido')
        .select(`
          *,
          produtos:produto_id (
            nome,
            unidade_medida
          )
        `)
        .eq('pedido_id', pedido.id);
      
      if (error) throw error;
      return data;
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

  return (
    <Card className="fixed inset-0 z-50 bg-white shadow-lg overflow-y-auto">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>
            Detalhes do Pedido #{pedido.id.slice(-8)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <PedidoImpressaoButton pedidoId={pedido.id} />
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Informações Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informações do Cliente</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Nome:</strong> {pedido.cliente?.nome || 'Cliente não informado'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Informações do Pedido</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span><strong>Status:</strong></span>
                  <Badge className={getStatusColor(pedido.status)}>
                    {getStatusLabel(pedido.status)}
                  </Badge>
                </div>
                <p><strong>Data do Pedido:</strong> {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</p>
                {pedido.data_entrega && (
                  <p><strong>Data de Entrega:</strong> {new Date(pedido.data_entrega).toLocaleDateString('pt-BR')}</p>
                )}
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span><strong>Valor Total:</strong> R$ {pedido.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Itens do Pedido */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Itens do Pedido</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {itens?.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="font-medium">{item.produtos?.nome || 'Produto não encontrado'}</p>
                        <p className="text-sm text-gray-600">{item.produtos?.unidade_medida}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Quantidade</p>
                        <p className="font-medium">{item.quantidade}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Preço Unitário</p>
                        <p className="font-medium">R$ {item.preco_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Subtotal</p>
                        <p className="font-medium">R$ {item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4 text-right">
                  <p className="text-xl font-bold">
                    Total: R$ {pedido.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observações */}
        {pedido.observacoes && (
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{pedido.observacoes}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default PedidoDetalhes;
