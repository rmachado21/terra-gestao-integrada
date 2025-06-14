
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MaskedInput } from '@/components/ui/masked-input';
import { ClienteFormData } from '../types/cliente';
import { getCepMask } from '@/lib/maskUtils';

interface ClienteAddressFieldsProps {
  formData: ClienteFormData;
  handleChange: (field: keyof ClienteFormData, value: string | boolean) => void;
}

const ClienteAddressFields = ({ formData, handleChange }: ClienteAddressFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cep">CEP</Label>
        <MaskedInput
          id="cep"
          mask={getCepMask()}
          value={formData.cep}
          onChange={(e) => handleChange('cep', e.target.value)}
          placeholder="00000-000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endereco">Endereço</Label>
        <Input
          id="endereco"
          value={formData.endereco}
          onChange={(e) => handleChange('endereco', e.target.value)}
          placeholder="Rua, Avenida, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bairro">Bairro</Label>
        <Input
          id="bairro"
          value={formData.bairro}
          onChange={(e) => handleChange('bairro', e.target.value)}
          placeholder="Nome do bairro"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            value={formData.cidade}
            onChange={(e) => handleChange('cidade', e.target.value)}
            placeholder="Nome da cidade"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Input
            id="estado"
            value={formData.estado}
            onChange={(e) => handleChange('estado', e.target.value)}
            placeholder="SP"
            maxLength={2}
          />
        </div>
      </div>
    </div>
  );
};

export default ClienteAddressFields;
