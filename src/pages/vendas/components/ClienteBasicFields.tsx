
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputMask from 'react-input-mask';
import { ClienteFormData } from '../types/cliente';
import { getCpfCnpjMask, getTelefoneMask } from '../utils/maskUtils';

interface ClienteBasicFieldsProps {
  formData: ClienteFormData;
  handleChange: (field: keyof ClienteFormData, value: string | boolean) => void;
}

const ClienteBasicFields = ({ formData, handleChange }: ClienteBasicFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          placeholder="Nome do cliente"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="email@exemplo.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <InputMask
          mask={getTelefoneMask(formData.telefone)}
          value={formData.telefone}
          onChange={(e) => handleChange('telefone', e.target.value)}
        >
          {(inputProps: any) => (
            <Input
              {...inputProps}
              id="telefone"
              placeholder="(11) 99999-9999"
            />
          )}
        </InputMask>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
        <InputMask
          mask={getCpfCnpjMask(formData.cpf_cnpj)}
          value={formData.cpf_cnpj}
          onChange={(e) => handleChange('cpf_cnpj', e.target.value)}
        >
          {(inputProps: any) => (
            <Input
              {...inputProps}
              id="cpf_cnpj"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
            />
          )}
        </InputMask>
      </div>
    </div>
  );
};

export default ClienteBasicFields;
