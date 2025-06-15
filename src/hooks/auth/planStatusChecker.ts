
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/lib/security';

export interface PlanStatus {
  shouldRedirect: boolean;
  isBlocked: boolean;
  reason?: string;
}

// Helper function to check if user should be redirected to subscription
export const checkUserPlanStatus = async (userId: string): Promise<PlanStatus> => {
  try {
    // Check if user has super admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'super_admin')
      .single();
    
    if (roleData) {
      return { shouldRedirect: false, isBlocked: false };
    }

    // Get user profile status
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('ativo')
      .eq('id', userId)
      .single();

    if (profileError) {
      return { shouldRedirect: false, isBlocked: true, reason: 'Erro ao verificar dados do usuário' };
    }

    // Get user plan status
    const { data: planData } = await supabase
      .from('user_plans')
      .select('tipo_plano, data_fim, ativo')
      .eq('user_id', userId)
      .eq('ativo', true)
      .single();

    const hasActivePlan = planData && new Date(planData.data_fim) > new Date();

    // If user is inactive in profile
    if (!profileData?.ativo) {
      // If user has no active plan or expired plan, redirect to subscription
      if (!hasActivePlan) {
        return { shouldRedirect: true, isBlocked: false };
      }
      // If user has active plan but is inactive, they are admin-disabled
      return { shouldRedirect: false, isBlocked: true, reason: 'Seu acesso está inativo. Entre em contato com o suporte.' };
    }

    // User is active in profile
    return { shouldRedirect: false, isBlocked: false };
  } catch (error) {
    secureLogger.error('Error checking user plan status:', error);
    return { shouldRedirect: false, isBlocked: true, reason: 'Erro ao verificar status do usuário' };
  }
};
