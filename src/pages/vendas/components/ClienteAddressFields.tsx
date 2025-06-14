
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputMask from 'react-input-mask';
import { ClienteFormData } from '../types/cliente';

interface ClienteAddressFieldsProps {
  formData: ClienteFormData;
  handleChange: (field: keyof ClienteFormData, value: string | boolean) => void;
}

// Lista de siglas dos estados brasileiros
const ESTADOS_BRASIL = [
  'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 
  'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 
  'SE', 'TO'
];

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
        <Select
          value={formData.estado}
          onValueChange={(value) => handleChange('estado', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS_BRASIL.map((estado) => (
              <SelectItem key={estado} value={estado}>
                {estado}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="endereco">Endereço</Label>
        <Input
          id="endereco"
          value={formData.endereco}
          onChange={(e) => handleChange('endereco', e.target.value)}
          placeholder="Rua, número, complemento"
        />
      </div>
    </div>
  );
};

export default ClienteAddressFields;
