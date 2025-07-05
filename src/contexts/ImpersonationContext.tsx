
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useQueryClient } from '@tanstack/react-query';
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
  isTransitioning: boolean;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

const IMPERSONATION_STORAGE_KEY = 'impersonation_state';

export const ImpersonationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { isSuperAdmin } = useUserRoles();
  const queryClient = useQueryClient();
  const [state, setState] = useState<ImpersonationState>({
    isImpersonating: false,
    impersonatedUserId: null,
    originalUserId: null,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Carregar estado da impersonação do localStorage na inicialização
  useEffect(() => {
    if (user && isSuperAdmin) {
      console.log('[IMPERSONATION] Loading state from localStorage for user:', user.id);
      const savedState = localStorage.getItem(IMPERSONATION_STORAGE_KEY);
      console.log('[IMPERSONATION] Saved state:', savedState);
      
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          console.log('[IMPERSONATION] Parsed state:', parsed);
          
          if (parsed.originalUserId === user.id && parsed.impersonatedUserId) {
            console.log('[IMPERSONATION] Restoring impersonation:', parsed);
            setState(parsed);
            
            // Invalidar todas as queries quando restaurar impersonação
            queryClient.invalidateQueries();
            
            secureLogger.security('impersonation_restored', {
              originalUserId: user.id,
              impersonatedUserId: parsed.impersonatedUserId
            });
          } else {
            console.log('[IMPERSONATION] Invalid saved state, clearing');
            localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
          }
        } catch (error) {
          console.error('[IMPERSONATION] Error parsing saved state:', error);
          localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
        }
      } else {
        console.log('[IMPERSONATION] No saved state found');
      }
    } else if (!isSuperAdmin && state.isImpersonating) {
      console.log('[IMPERSONATION] User is not super admin, stopping impersonation');
      stopImpersonation();
    }
  }, [user, isSuperAdmin, queryClient]);

  // Limpar estado se usuário não for mais super admin
  useEffect(() => {
    if (!isSuperAdmin && state.isImpersonating) {
      console.log('[IMPERSONATION] User lost super admin, stopping impersonation');
      stopImpersonation();
    }
  }, [isSuperAdmin, state.isImpersonating]);

  const startImpersonation = async (userId: string) => {
    if (!user || !isSuperAdmin || userId === user.id) {
      console.log('[IMPERSONATION] Cannot start impersonation:', { user: !!user, isSuperAdmin, userId, currentUserId: user?.id });
      return;
    }

    console.log('[IMPERSONATION] Starting impersonation for user:', userId);
    setIsTransitioning(true);

    try {
      const newState: ImpersonationState = {
        isImpersonating: true,
        impersonatedUserId: userId,
        originalUserId: user.id,
      };

      // Primeiro invalidar queries para evitar dados em cache
      console.log('[IMPERSONATION] Invalidating queries before state change');
      await queryClient.invalidateQueries();
      
      // Depois definir o novo estado
      setState(newState);
      localStorage.setItem(IMPERSONATION_STORAGE_KEY, JSON.stringify(newState));
      
      console.log('[IMPERSONATION] State updated and saved to localStorage:', newState);
      
      // Invalidar queries novamente após mudança de estado
      setTimeout(() => {
        console.log('[IMPERSONATION] Invalidating queries after state change');
        queryClient.invalidateQueries();
      }, 100);
      
      secureLogger.security('impersonation_started', {
        originalUserId: user.id,
        impersonatedUserId: userId
      });
    } finally {
      setIsTransitioning(false);
    }
  };

  const stopImpersonation = async () => {
    console.log('[IMPERSONATION] Stopping impersonation');
    setIsTransitioning(true);

    try {
      if (state.isImpersonating) {
        secureLogger.security('impersonation_stopped', {
          originalUserId: state.originalUserId,
          impersonatedUserId: state.impersonatedUserId
        });
      }

      // Primeiro invalidar queries
      console.log('[IMPERSONATION] Invalidating queries before stopping');
      await queryClient.invalidateQueries();

      const newState = {
        isImpersonating: false,
        impersonatedUserId: null,
        originalUserId: null,
      };

      setState(newState);
      localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
      
      console.log('[IMPERSONATION] State cleared and localStorage removed');
      
      // Invalidar queries novamente após parar impersonação
      setTimeout(() => {
        console.log('[IMPERSONATION] Invalidating queries after stopping');
        queryClient.invalidateQueries();
      }, 100);
    } finally {
      setIsTransitioning(false);
    }
  };

  return (
    <ImpersonationContext.Provider
      value={{
        ...state,
        startImpersonation,
        stopImpersonation,
        canImpersonate: isSuperAdmin,
        isTransitioning,
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
