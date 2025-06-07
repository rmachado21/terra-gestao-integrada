
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { secureLogger } from '@/lib/security';

interface Profile {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cargo?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        secureLogger.error('Error fetching profile:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar perfil",
          variant: "destructive",
        });
      } else {
        setProfile(data);
        secureLogger.info('Profile loaded successfully');
      }
    } catch (error) {
      secureLogger.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return false;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        secureLogger.error('Error updating profile:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar perfil",
          variant: "destructive",
        });
        return false;
      }

      // Update local state optimistically
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      secureLogger.security('profile_updated', { userId: user.id });
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
      });
      
      return true;
    } catch (error) {
      secureLogger.error('Error updating profile:', error);
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

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    updating,
    updateProfile,
    refetchProfile: fetchProfile,
  };
};
