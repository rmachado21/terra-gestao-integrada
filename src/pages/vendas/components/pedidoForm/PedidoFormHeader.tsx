import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface PedidoFormHeaderProps {
  isEditing: boolean;
  onClose: () => void;
}

export const PedidoFormHeader = ({ isEditing, onClose }: PedidoFormHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="animate-fade-in">
        {isEditing ? 'Editar Pedido' : 'Novo Pedido'}
      </CardTitle>
      <Button variant="ghost" size="sm" onClick={onClose} className="hover-scale">
        <X className="h-4 w-4" />
      </Button>
    </CardHeader>
  );
};