import { Button } from '@/components/ui/button';

interface PedidoFormActionsProps {
  isEditing: boolean;
  isLoading?: boolean;
  onCancel: () => void;
}

export const PedidoFormActions = ({ isEditing, isLoading, onCancel }: PedidoFormActionsProps) => {
  return (
    <div className="flex gap-4 pt-6 animate-fade-in">
      <Button 
        type="submit" 
        className="bg-green-600 hover:bg-green-700 hover-scale"
        disabled={isLoading}
      >
        {isEditing ? 'Atualizar' : 'Criar'} Pedido
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        className="hover-scale"
      >
        Cancelar
      </Button>
    </div>
  );
};