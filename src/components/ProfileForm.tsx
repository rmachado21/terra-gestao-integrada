
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { profileSchema, ProfileFormData } from './profile/types';
import PersonalInfoCard from './profile/PersonalInfoCard';
import CompanyInfoCard from './profile/CompanyInfoCard';

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
      endereco: '',
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
        endereco: profile.endereco || '',
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
        endereco: profile.endereco || '',
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
      <PersonalInfoCard
        form={form}
        email={profile?.email || ''}
        updating={updating}
        onSubmit={onSubmit}
        onCancel={handleCancel}
      />

      <CompanyInfoCard
        form={form}
        currentLogoUrl={profile?.logo_url}
        updating={updating}
        uploading={uploading}
        onSubmit={onSubmit}
        onCancel={handleCancel}
        onUploadLogo={uploadLogo}
      />
    </div>
  );
};

export default ProfileForm;
