import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Eye, MessageCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Pedido } from '../types/pedido';
import { useWhatsAppHandler } from '../utils/pedidoUtils';
import PedidoImpressaoButton from './PedidoImpressaoButton';

interface PedidoItemProps {
  pedido: Pedido;
  onEdit: (pedido: Pedido) => void;
  onView: (pedido: Pedido) => void;
  onStatusChange: (pedidoId: string, status: 'pendente' | 'processando' | 'entregue' | 'cancelado') => void;
  isUpdatingStatus: boolean;
}

const PedidoItem = ({ 
  pedido, 
  onEdit, 
  onView, 
  onStatusChange, 
  isUpdatingStatus 
}: PedidoItemProps) => {
  const { handleWhatsApp } = useWhatsAppHandler();

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Pedido #{pedido.id.slice(-8)}</h3>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => onView(pedido)}>
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
                <PedidoImpressaoButton 
                  pedidoId={pedido.id} 
                  variant="outline" 
                  size="sm" 
                  showText={false}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Imprimir Pedido</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => onEdit(pedido)}>
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
                  onClick={() => handleWhatsApp(pedido)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Conversar no WhatsApp</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
        <div>
          <strong>Cliente:</strong> {pedido.cliente?.nome || 'Cliente não informado'}
        </div>
        <div>
          <strong>Data:</strong> {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
        </div>
        <div>
          <strong>Total:</strong> R$ {pedido.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <div>
          <strong>Status:</strong>
          <Select
            value={pedido.status}
            onValueChange={(value) => onStatusChange(pedido.id, value as 'pendente' | 'processando' | 'entregue' | 'cancelado')}
            disabled={isUpdatingStatus}
          >
            <SelectTrigger className="w-full mt-1 h-8">
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
      
      {pedido.observacoes && (
        <p className="text-sm text-gray-600 mt-2">
          <strong>Obs:</strong> {pedido.observacoes}
        </p>
      )}
    </div>
  );
};

export default PedidoItem;