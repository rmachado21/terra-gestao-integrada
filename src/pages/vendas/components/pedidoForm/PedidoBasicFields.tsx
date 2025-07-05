import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormData, Cliente } from './types';

interface PedidoBasicFieldsProps {
  formData: FormData;
  clientes?: Cliente[];
  onFormDataChange: (data: Partial<FormData>) => void;
}

export const PedidoBasicFields = ({ formData, clientes, onFormDataChange }: PedidoBasicFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
        <div>
          <Label htmlFor="cliente_id">Cliente</Label>
          <Select 
            value={formData.cliente_id} 
            onValueChange={(value) => onFormDataChange({ cliente_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes?.map(cliente => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="data_pedido">Data do Pedido</Label>
          <Input 
            id="data_pedido" 
            type="date" 
            value={formData.data_pedido} 
            onChange={(e) => onFormDataChange({ data_pedido: e.target.value })} 
            required 
          />
        </div>
      </div>

      <div className="animate-fade-in">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => onFormDataChange({ status: value as FormData['status'] })}
        >
          <SelectTrigger>
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
    </>
  );
};