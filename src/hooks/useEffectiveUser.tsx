
import { useAuth } from './useAuth';
import { useImpersonation } from '@/contexts/ImpersonationContext';

export const useEffectiveUser = () => {
  const { user: authUser } = useAuth();
  const { impersonatedUser, isImpersonating } = useImpersonation();

  // Return the impersonated user if impersonating, otherwise the authenticated user
  const effectiveUser = isImpersonating ? impersonatedUser : authUser;

  return {
    user: effectiveUser,
    isImpersonating,
    originalUser: authUser,
  };
};
