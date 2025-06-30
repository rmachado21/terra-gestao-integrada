
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoadingPage } from '@/components/ui/loading';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormData } from '@/components/profile/types';
import PersonalInfoCard from '@/components/profile/PersonalInfoCard';
import CompanyInfoCard from '@/components/profile/CompanyInfoCard';

const EditUserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const fetchUserProfile = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar perfil do usuário",
          variant: "destructive",
        });
        navigate('/admin/users');
        return;
      }

      setProfile(data);
      form.reset({
        nome: data.nome || '',
        telefone: data.telefone || '',
        cargo: data.cargo || '',
        empresa_nome: data.empresa_nome || '',
        cnpj: data.cnpj || '',
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar perfil do usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: ProfileFormData) => {
    if (!userId) return false;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao atualizar perfil",
          variant: "destructive",
        });
        return false;
      }

      setProfile(prev => prev ? { ...prev, ...data } : null);
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil",
        variant: "destructive",
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const uploadLogo = async (file: File) => {
    if (!userId) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      const logoUrl = data.publicUrl;

      // Update profile with new logo URL directly
      const { error } = await supabase
        .from('profiles')
        .update({
          logo_url: logoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao atualizar logo",
          variant: "destructive",
        });
        return null;
      }

      setProfile(prev => prev ? { ...prev, logo_url: logoUrl } : null);
      toast({
        title: "Sucesso",
        description: "Logo da empresa enviado com sucesso",
      });
      
      return logoUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da logo",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfile(data);
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

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return <LoadingPage message="Carregando perfil do usuário..." />;
  }

  if (!profile) {
    return (
      <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Usuário não encontrado
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/admin/users')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              Editar Perfil - {profile.nome}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Editando como Super Admin
            </p>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default EditUserProfilePage;
