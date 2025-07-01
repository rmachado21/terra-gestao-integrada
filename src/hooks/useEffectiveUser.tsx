
import { useAuth } from '@/hooks/useAuth';
import { useImpersonation } from '@/contexts/ImpersonationContext';

export const useEffectiveUser = () => {
  const { user } = useAuth();
  const { isImpersonating, impersonatedUserId } = useImpersonation();

  // Se estiver impersonando, retorna o ID do usuário impersonado
  // Caso contrário, retorna o usuário atual
  const effectiveUserId = isImpersonating ? impersonatedUserId : user?.id;

  return {
    user,
    effectiveUserId,
    isImpersonating,
  };
};
