
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { X, Save } from 'lucide-react';
import { Cliente, ClienteFormData } from '../types/cliente';
import { useClienteForm } from '../hooks/useClienteForm';
import ClienteBasicFields from './ClienteBasicFields';
import ClienteAddressFields from './ClienteAddressFields';
import ClienteAdditionalFields from './ClienteAdditionalFields';

interface ClienteFormProps {
  cliente?: Cliente | null;
  onClose: () => void;
}

const ClienteForm = ({ cliente, onClose }: ClienteFormProps) => {
  const { mutation } = useClienteForm({ cliente, onClose });
  
  const form = useForm<ClienteFormData>({
    defaultValues: {
      nome: cliente?.nome || '',
      email: cliente?.email || '',
      telefone: cliente?.telefone || '',
      cpf_cnpj: cliente?.cpf_cnpj || '',
      endereco: {
        cep: cliente?.cep || '',
        logradouro: cliente?.endereco || '',
        numero: '',
        complemento: '',
        bairro: cliente?.bairro || '',
        cidade: cliente?.cidade || '',
        estado: cliente?.estado || '',
      },
      observacoes: cliente?.observacoes || '',
      ativo: cliente?.ativo ?? true
    }
  });

  const onSubmit = (data: ClienteFormData) => {
    mutation.mutate(data);
  };

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ClienteBasicFields form={form} />
            <ClienteAddressFields form={form} />
            <ClienteAdditionalFields form={form} />

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
        </Form>
      </CardContent>
    </Card>
  );
};

export default ClienteForm;
