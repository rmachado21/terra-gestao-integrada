import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ItemPedido, Produto } from './types';
import { PedidoItemRow } from './PedidoItemRow';

interface PedidoItemsListProps {
  itens: ItemPedido[];
  produtos?: Produto[];
  valorTotal: number;
  onItemChange: (index: number, field: keyof ItemPedido, value: any) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

export const PedidoItemsList = ({ 
  itens, 
  produtos, 
  valorTotal, 
  onItemChange, 
  onAddItem, 
  onRemoveItem 
}: PedidoItemsListProps) => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <Label>Itens do Pedido</Label>
        <Button 
          type="button" 
          onClick={onAddItem} 
          variant="outline" 
          size="sm"
          className="hover-scale"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Item
        </Button>
      </div>
      
      <div className="space-y-4">
        {itens.map((item, index) => (
          <PedidoItemRow
            key={index}
            item={item}
            index={index}
            produtos={produtos}
            canRemove={itens.length > 1}
            onItemChange={onItemChange}
            onRemoveItem={onRemoveItem}
          />
        ))}
      </div>
      
      <div className="text-right mt-4 p-4 bg-gray-50 rounded animate-scale-in">
        <span className="text-lg font-semibold">
          Total: R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
};