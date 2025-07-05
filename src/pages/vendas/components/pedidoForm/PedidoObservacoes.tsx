import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PedidoObservacoesProps {
  value: string;
  onChange: (value: string) => void;
}

export const PedidoObservacoes = ({ value, onChange }: PedidoObservacoesProps) => {
  return (
    <div className="animate-fade-in">
      <Label htmlFor="observacoes">Observações</Label>
      <Textarea 
        id="observacoes" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder="Observações sobre o pedido..." 
      />
    </div>
  );
};