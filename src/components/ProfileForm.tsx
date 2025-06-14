
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useProfile } from '@/hooks/useProfile';
import { useEffect } from 'react';
import { Loader2, User, Building } from 'lucide-react';
import { nameSchema, phoneSchema } from '@/lib/security';
import InputMask from 'react-input-mask';
import { getTelefoneMask } from '@/lib/maskUtils';
import LogoUpload from './LogoUpload';

const cnpjSchema = z.string()
  .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX')
  .optional()
  .or(z.literal(''));

const profileSchema = z.object({
  nome: nameSchema,
  telefone: phoneSchema,
  cargo: z.string().max(100, 'Cargo muito longo').optional(),
  empresa_nome: z.string().max(200, 'Nome da empresa muito longo').optional(),
  cnpj: cnpjSchema,
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileForm = () => {
  const { profile, loading, updating, uploading, updateProfile, uploadLogo } = useProfile();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: '',
      telefone: '',
      cargo: '',
      empresa_nome: '',
      cnpj: '',
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        nome: profile.nome || '',
        telefone: profile.telefone || '',
        cargo: profile.cargo || '',
        empresa_nome: profile.empresa_nome || '',
        cnpj: profile.cnpj || '',
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    const success = await updateProfile(data);
    if (success) {
      // Form will update automatically via the profile state
    }
  };

  const handleCancel = () => {
    if (profile) {
      form.reset({
        nome: profile.nome || '',
        telefone: profile.telefone || '',
        cargo: profile.cargo || '',
        empresa_nome: profile.empresa_nome || '',
        cnpj: profile.cnpj || '',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            <span className="ml-2">Carregando perfil...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informações Pessoais */}
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
                  <Input value={profile?.email || ''} disabled className="bg-gray-100" />
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
                      <InputMask
                        mask={getTelefoneMask(field.value || '')}
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      >
                        {(inputProps: any) => (
                          <Input 
                            {...inputProps}
                            placeholder="(11) 99999-9999" 
                          />
                        )}
                      </InputMask>
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
                  onClick={handleCancel}
                  disabled={updating}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Informações da Empresa */}
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
                      <InputMask
                        mask="99.999.999/9999-99"
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      >
                        {(inputProps: any) => (
                          <Input 
                            {...inputProps}
                            placeholder="XX.XXX.XXX/XXXX-XX" 
                          />
                        )}
                      </InputMask>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Logo da Empresa</FormLabel>
                <LogoUpload
                  currentLogoUrl={profile?.logo_url}
                  onUpload={uploadLogo}
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
                  onClick={handleCancel}
                  disabled={updating}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileForm;
