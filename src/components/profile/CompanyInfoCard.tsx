
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Building, Loader2 } from 'lucide-react';
import { MaskedInput } from '@/components/ui/masked-input';
import LogoUpload from '../LogoUpload';
import { UseFormReturn } from 'react-hook-form';
import { ProfileFormData } from './types';

interface CompanyInfoCardProps {
  form: UseFormReturn<ProfileFormData>;
  currentLogoUrl?: string;
  updating: boolean;
  uploading: boolean;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
  onUploadLogo: (file: File) => Promise<string | null>;
}

const CompanyInfoCard = ({ 
  form, 
  currentLogoUrl, 
  updating, 
  uploading, 
  onSubmit, 
  onCancel, 
  onUploadLogo 
}: CompanyInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Building className="h-6 w-6 text-green-600" />
          <CardTitle>Informações da Empresa</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="empresa_nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da sua empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <MaskedInput
                      mask="99.999.999/9999-99"
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="XX.XXX.XXX/XXXX-XX"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço da Empresa</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite o endereço completo da empresa"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Logo da Empresa</FormLabel>
              <LogoUpload
                currentLogoUrl={currentLogoUrl}
                onUpload={onUploadLogo}
                uploading={uploading}
              />
            </div>

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

export default CompanyInfoCard;
