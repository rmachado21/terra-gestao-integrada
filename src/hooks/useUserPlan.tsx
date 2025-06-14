
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from './useUserRoles';

interface UserPlan {
  id: string;
  tipo_plano: 'mensal' | 'anual' | 'teste';
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
  created_at: string;
}

export const useUserPlan = () => {
  const { user } = useAuth();
  const { isSuperAdmin } = useUserRoles();
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!user || isSuperAdmin) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_plans')
          .select('*')
          .eq('user_id', user.id)
          .eq('ativo', true)
          .single();

        if (error) {
          console.error('Error fetching user plan:', error);
          setPlan(null);
        } else {
          setPlan(data);
        }
      } catch (error) {
        console.error('Error fetching user plan:', error);
        setPlan(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlan();
  }, [user, isSuperAdmin]);

  const calculateDaysRemaining = (dataFim: string) => {
    const endDate = new Date(dataFim);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return {
    plan,
    loading,
    calculateDaysRemaining,
  };
};
