import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { ItemPedido, Produto } from './types';

interface PedidoItemRowProps {
  item: ItemPedido;
  index: number;
  produtos?: Produto[];
  canRemove: boolean;
  onItemChange: (index: number, field: keyof ItemPedido, value: any) => void;
  onRemoveItem: (index: number) => void;
}

export const PedidoItemRow = ({ 
  item, 
  index, 
  produtos, 
  canRemove, 
  onItemChange, 
  onRemoveItem 
}: PedidoItemRowProps) => {
  return (
    <div className="grid grid-cols-12 gap-2 items-end p-4 border rounded animate-scale-in">
      <div className="col-span-4">
        <Label>Produto</Label>
        <Select 
          value={item.produto_id} 
          onValueChange={(value) => onItemChange(index, 'produto_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {produtos?.map(produto => (
              <SelectItem key={produto.id} value={produto.id}>
                {produto.nome} ({produto.unidade_medida})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="col-span-2">
        <Label>Quantidade</Label>
        <Input 
          type="number" 
          value={item.quantidade} 
          onChange={(e) => onItemChange(index, 'quantidade', parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
        />
      </div>
      
      <div className="col-span-2">
        <Label>Preço Unit.</Label>
        <Input 
          type="number" 
          value={item.preco_unitario} 
          onChange={(e) => onItemChange(index, 'preco_unitario', parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
        />
      </div>
      
      <div className="col-span-3">
        <Label>Subtotal</Label>
        <Input 
          type="text" 
          value={`R$ ${item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          disabled
        />
      </div>
      
      <div className="col-span-1">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => onRemoveItem(index)}
          disabled={!canRemove}
          className="hover-scale"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};