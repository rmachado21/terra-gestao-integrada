
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MaskedInput } from '@/components/ui/masked-input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ClienteFormData } from '../types/cliente';
import { getTelefoneMask } from '@/lib/maskUtils';

interface ClienteBasicFieldsProps {
  formData: ClienteFormData;
  handleChange: (field: keyof ClienteFormData, value: string | boolean) => void;
  getDocumentMask: (documentType: 'cpf' | 'cnpj') => string;
}

const ClienteBasicFields = ({ formData, handleChange, getDocumentMask }: ClienteBasicFieldsProps) => {
  const documentMask = getDocumentMask(formData.documentType);
  const documentPlaceholder = formData.documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00';

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
        <Label>Tipo de Documento</Label>
        <RadioGroup
          value={formData.documentType}
          onValueChange={(value) => handleChange('documentType', value)}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cpf" id="cpf" />
            <Label htmlFor="cpf">CPF</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cnpj" id="cnpj" />
            <Label htmlFor="cnpj">CNPJ</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf_cnpj">
          {formData.documentType === 'cpf' ? 'CPF' : 'CNPJ'}
        </Label>
        <MaskedInput
          id="cpf_cnpj"
          mask={documentMask}
          value={formData.cpf_cnpj}
          onChange={(e) => handleChange('cpf_cnpj', e.target.value)}
          placeholder={documentPlaceholder}
        />
      </div>
    </div>
  );
};

export default ClienteBasicFields;
