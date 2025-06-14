
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-lg flex flex-col max-h-[90vh]">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>
              {cliente ? 'Editar Cliente' : 'Novo Cliente'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <ClienteBasicFields 
              formData={formData} 
              handleChange={handleChange}
              cpfCnpjMask={cpfCnpjMask}
            />
            <ClienteAddressFields formData={formData} handleChange={handleChange} />
            <ClienteAdditionalFields formData={formData} handleChange={handleChange} />
          </form>
        </CardContent>

        <div className="border-t p-6 flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit} 
              disabled={mutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {mutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ClienteForm;
