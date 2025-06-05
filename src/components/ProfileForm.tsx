
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useProfile } from '@/hooks/useProfile';
import { useEffect } from 'react';
import { Loader2, User } from 'lucide-react';

const profileSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  telefone: z.string().optional().refine((val) => !val || val.length >= 10, {
    message: 'Telefone deve ter pelo menos 10 dígitos'
  }),
  cargo: z.string().max(100, 'Cargo muito longo').optional(),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileForm = () => {
  const { profile, loading, updating, updateProfile } = useProfile();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: '',
      telefone: '',
      cargo: '',
      bio: '',
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        nome: profile.nome || '',
        telefone: profile.telefone || '',
        cargo: profile.cargo || '',
        bio: profile.bio || '',
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
        bio: profile.bio || '',
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
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <User className="h-6 w-6 text-green-600" />
          <CardTitle>Editar Perfil</CardTitle>
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
                    <Input placeholder="(11) 99999-9999" {...field} />
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

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Conte um pouco sobre você..."
                      className="min-h-[100px]"
                      {...field}
                    />
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
  );
};

export default ProfileForm;
