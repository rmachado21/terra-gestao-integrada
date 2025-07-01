
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { secureLogger } from '@/lib/security';

interface ImpersonationState {
  isImpersonating: boolean;
  impersonatedUserId: string | null;
  originalUserId: string | null;
}

interface ImpersonationContextType extends ImpersonationState {
  startImpersonation: (userId: string) => void;
  stopImpersonation: () => void;
  canImpersonate: boolean;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

const IMPERSONATION_STORAGE_KEY = 'impersonation_state';

export const ImpersonationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { isSuperAdmin } = useUserRoles();
  const [state, setState] = useState<ImpersonationState>({
    isImpersonating: false,
    impersonatedUserId: null,
    originalUserId: null,
  });

  // Carregar estado da impersonação do localStorage na inicialização
  useEffect(() => {
    if (user && isSuperAdmin) {
      const savedState = localStorage.getItem(IMPERSONATION_STORAGE_KEY);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          if (parsed.originalUserId === user.id && parsed.impersonatedUserId) {
            setState(parsed);
            secureLogger.security('impersonation_restored', {
              originalUserId: user.id,
              impersonatedUserId: parsed.impersonatedUserId
            });
          }
        } catch (error) {
          localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
        }
      }
    }
  }, [user, isSuperAdmin]);

  // Limpar estado se usuário não for mais super admin
  useEffect(() => {
    if (!isSuperAdmin && state.isImpersonating) {
      stopImpersonation();
    }
  }, [isSuperAdmin]);

  const startImpersonation = (userId: string) => {
    if (!user || !isSuperAdmin || userId === user.id) {
      return;
    }

    const newState: ImpersonationState = {
      isImpersonating: true,
      impersonatedUserId: userId,
      originalUserId: user.id,
    };

    setState(newState);
    localStorage.setItem(IMPERSONATION_STORAGE_KEY, JSON.stringify(newState));
    
    secureLogger.security('impersonation_started', {
      originalUserId: user.id,
      impersonatedUserId: userId
    });
  };

  const stopImpersonation = () => {
    if (state.isImpersonating) {
      secureLogger.security('impersonation_stopped', {
        originalUserId: state.originalUserId,
        impersonatedUserId: state.impersonatedUserId
      });
    }

    setState({
      isImpersonating: false,
      impersonatedUserId: null,
      originalUserId: null,
    });
    localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
  };

  return (
    <ImpersonationContext.Provider
      value={{
        ...state,
        startImpersonation,
        stopImpersonation,
        canImpersonate: isSuperAdmin,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
};

export const useImpersonation = () => {
  const context = useContext(ImpersonationContext);
  if (context === undefined) {
    throw new Error('useImpersonation must be used within an ImpersonationProvider');
  }
  return context;
};
