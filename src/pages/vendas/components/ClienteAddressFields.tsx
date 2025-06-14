
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputMask from 'react-input-mask';
import { ClienteFormData } from '../types/cliente';

interface ClienteAddressFieldsProps {
  formData: ClienteFormData;
  handleChange: (field: keyof ClienteFormData, value: string | boolean) => void;
}

const ClienteAddressFields = ({ formData, handleChange }: ClienteAddressFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="cep">CEP</Label>
        <InputMask
          mask="99999-999"
          value={formData.cep}
          onChange={(e) => handleChange('cep', e.target.value)}
        >
          {(inputProps: any) => (
            <Input
              {...inputProps}
              id="cep"
              placeholder="00000-000"
            />
          )}
        </InputMask>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bairro">Bairro</Label>
        <Input
          id="bairro"
          value={formData.bairro}
          onChange={(e) => handleChange('bairro', e.target.value)}
          placeholder="Bairro"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cidade">Cidade</Label>
        <Input
          id="cidade"
          value={formData.cidade}
          onChange={(e) => handleChange('cidade', e.target.value)}
          placeholder="Cidade"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="estado">Estado</Label>
        <Input
          id="estado"
          value={formData.estado}
          onChange={(e) => handleChange('estado', e.target.value)}
          placeholder="Estado"
        />
      </div>
    </div>
  );
};

export default ClienteAddressFields;
