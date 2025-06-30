
import { useState, useEffect } from 'react';
import { useEffectiveUser } from './useEffectiveUser';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cargo?: string;
  avatar_url?: string;
  empresa_nome?: string;
  cnpj?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export const useEffectiveProfile = () => {
  const { user, isImpersonating, originalUser } = useEffectiveUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
      setLoading(false);
    };

    loadProfile();
  }, [user]);

  return {
    profile,
    loading,
    isImpersonating,
    originalUser,
    effectiveUser: user,
  };
};
