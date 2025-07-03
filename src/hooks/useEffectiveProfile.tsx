
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/lib/security';

interface Profile {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  avatar_url?: string;
  empresa_nome?: string;
  cnpj?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export const useEffectiveProfile = () => {
  const { user } = useAuth();
  const { profile: originalProfile, loading: originalLoading } = useProfile();
  const { isImpersonating, impersonatedUserId } = useImpersonation();
  const [impersonatedProfile, setImpersonatedProfile] = useState<Profile | null>(null);
  const [impersonatedLoading, setImpersonatedLoading] = useState(false);

  useEffect(() => {
    if (isImpersonating && impersonatedUserId) {
      setImpersonatedLoading(true);
      
      const fetchImpersonatedProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', impersonatedUserId)
            .single();

          if (error) {
            secureLogger.error('Error fetching impersonated profile:', error);
            setImpersonatedProfile(null);
          } else {
            setImpersonatedProfile(data);
          }
        } catch (error) {
          secureLogger.error('Error fetching impersonated profile:', error);
          setImpersonatedProfile(null);
        } finally {
          setImpersonatedLoading(false);
        }
      };

      fetchImpersonatedProfile();
    } else {
      setImpersonatedProfile(null);
      setImpersonatedLoading(false);
    }
  }, [isImpersonating, impersonatedUserId]);

  // Retorna o perfil impersonado se estiver impersonando, caso contrário o perfil original
  return {
    profile: isImpersonating ? impersonatedProfile : originalProfile,
    loading: isImpersonating ? impersonatedLoading : originalLoading,
    isImpersonating,
    originalProfile,
  };
};
