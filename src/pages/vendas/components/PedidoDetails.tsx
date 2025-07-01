
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Pedido } from '../types/pedido';

interface PedidoDetailsProps {
  pedido: Pedido;
  onClose: () => void;
}

const PedidoDetails = ({ pedido, onClose }: PedidoDetailsProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detalhes do Pedido #{pedido.id.slice(-8)}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <strong>Cliente:</strong> {pedido.cliente?.nome || 'Cliente não informado'}
            </div>
            <div>
              <strong>Data do Pedido:</strong> {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
            </div>
            <div>
              <strong>Status:</strong> {pedido.status}
            </div>
            <div>
              <strong>Valor Total:</strong> R$ {pedido.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            {pedido.observacoes && (
              <div>
                <strong>Observações:</strong> {pedido.observacoes}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PedidoDetails;
