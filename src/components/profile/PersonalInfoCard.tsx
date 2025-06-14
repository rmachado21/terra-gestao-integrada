import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Loader2 } from 'lucide-react';
import { MaskedInput } from '@/components/ui/masked-input';
import { getTelefoneMask } from '@/lib/maskUtils';
import { UseFormReturn } from 'react-hook-form';
import { ProfileFormData } from './types';

interface PersonalInfoCardProps {
  form: UseFormReturn<ProfileFormData>;
  email: string;
  updating: boolean;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
}

const PersonalInfoCard = ({ form, email, updating, onSubmit, onCancel }: PersonalInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <User className="h-6 w-6 text-green-600" />
          <CardTitle>Informações Pessoais</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input value={email} disabled className="bg-gray-100" />
              </FormControl>
              <p className="text-sm text-gray-500">O email não pode ser alterado</p>
            </FormItem>

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <MaskedInput
                      mask={getTelefoneMask()}
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="(11) 99999-9999"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo/Função</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu cargo ou função" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={updating}
                className="flex-1"
              >
                {updating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Salvar Alterações
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={updating}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoCard;
