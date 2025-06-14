
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MaskedInput } from '@/components/ui/masked-input';
import { ClienteFormData } from '../types/cliente';
import { getTelefoneMask } from '@/lib/maskUtils';

interface ClienteBasicFieldsProps {
  formData: ClienteFormData;
  handleChange: (field: keyof ClienteFormData, value: string | boolean) => void;
  cpfCnpjMask: string;
}

const ClienteBasicFields = ({ formData, handleChange, cpfCnpjMask }: ClienteBasicFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          placeholder="Nome do cliente"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
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
        <MaskedInput
          id="telefone"
          mask={getTelefoneMask()}
          value={formData.telefone}
          onChange={(e) => handleChange('telefone', e.target.value)}
          placeholder="(11) 99999-9999"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
        <MaskedInput
          id="cpf_cnpj"
          mask={getCpfCnpjMask}
          value={formData.cpf_cnpj}
          onChange={(e) => handleChange('cpf_cnpj', e.target.value)}
          placeholder="000.000.000-00 ou 00.000.000/0000-00"
        />
      </div>
    </div>
  );
};

export default ClienteBasicFields;
