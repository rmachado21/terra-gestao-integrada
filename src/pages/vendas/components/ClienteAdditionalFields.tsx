import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ClienteFormData } from '../types/cliente';
interface ClienteAdditionalFieldsProps {
  formData: ClienteFormData;
  handleChange: (field: keyof ClienteFormData, value: string | boolean) => void;
}
const ClienteAdditionalFields = ({
  formData,
  handleChange
}: ClienteAdditionalFieldsProps) => {
  return <div className="space-y-6">
      

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" value={formData.observacoes} onChange={e => handleChange('observacoes', e.target.value)} placeholder="Observações sobre o cliente..." rows={3} />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="ativo" checked={formData.ativo} onCheckedChange={checked => handleChange('ativo', checked)} />
        <Label htmlFor="ativo">Cliente ativo</Label>
      </div>
    </div>;
};
export default ClienteAdditionalFields;