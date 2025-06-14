
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Save } from 'lucide-react';
import { Cliente } from '../types/cliente';
import { useClienteForm } from '../hooks/useClienteForm';
import ClienteBasicFields from './ClienteBasicFields';
import ClienteAddressFields from './ClienteAddressFields';
import ClienteAdditionalFields from './ClienteAdditionalFields';

interface ClienteFormProps {
  cliente?: Cliente | null;
  onClose: () => void;
}

const ClienteForm = ({ cliente, onClose }: ClienteFormProps) => {
  const { formData, mutation, handleSubmit, handleChange, cpfCnpjMask } = useClienteForm({
    cliente,
    onClose
  });

  return (
    <Card className="fixed inset-0 z-50 bg-white shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <ClienteBasicFields 
            formData={formData} 
            handleChange={handleChange}
            cpfCnpjMask={cpfCnpjMask}
          />
          <ClienteAddressFields formData={formData} handleChange={handleChange} />
          <ClienteAdditionalFields formData={formData} handleChange={handleChange} />

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {mutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClienteForm;
