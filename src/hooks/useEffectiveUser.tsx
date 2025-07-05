
import { useAuth } from '@/hooks/useAuth';
import { useImpersonation } from '@/contexts/ImpersonationContext';

export const useEffectiveUser = () => {
  const { user } = useAuth();
  const { isImpersonating, impersonatedUserId } = useImpersonation();

  // Se estiver impersonando, retorna o ID do usuário impersonado
  // Caso contrário, retorna o usuário atual
  const effectiveUserId = isImpersonating ? impersonatedUserId : user?.id;

  // Logs detalhados para debugging
  console.log('[EFFECTIVE_USER] Current state:', {
    currentUserId: user?.id,
    isImpersonating,
    impersonatedUserId,
    effectiveUserId,
    timestamp: new Date().toISOString()
  });

  return {
    user,
    effectiveUserId,
    isImpersonating,
  };
};
