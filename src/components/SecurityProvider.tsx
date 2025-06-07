
import React, { createContext, useContext, useEffect } from 'react';
import { useSecurity } from '@/hooks/useSecurity';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { secureLogger } from '@/lib/security';

interface SecurityContextType {
  checkRateLimit: (identifier: string) => boolean;
  recordLoginAttempt: (identifier: string, success: boolean) => void;
  updateActivity: () => void;
  isBlocked: boolean;
  sessionTimeoutWarning: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider = ({ children }: { children: React.ReactNode }) => {
  const { securityState, checkRateLimit, recordLoginAttempt, updateActivity } = useSecurity();
  const { signOut } = useAuth();
  const { toast } = useToast();

  // Lidar com timeout de sessão
  useEffect(() => {
    const handleSessionTimeout = () => {
      toast({
        title: "Sessão Expirada",
        description: "Sua sessão expirou por inatividade. Faça login novamente.",
        variant: "destructive",
      });
      signOut();
    };

    window.addEventListener('security:session-timeout', handleSessionTimeout);

    return () => {
      window.removeEventListener('security:session-timeout', handleSessionTimeout);
    };
  }, [signOut, toast]);

  // Aviso de timeout de sessão
  useEffect(() => {
    if (securityState.sessionTimeoutWarning) {
      toast({
        title: "Sessão Expirando",
        description: "Sua sessão expirará em 5 minutos por inatividade.",
        variant: "destructive",
      });
    }
  }, [securityState.sessionTimeoutWarning, toast]);

  // Log de eventos suspeitos
  useEffect(() => {
    // Detectar múltiplas abas (possível session hijacking)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        secureLogger.security('tab_focus_change');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const value = {
    checkRateLimit,
    recordLoginAttempt,
    updateActivity,
    isBlocked: securityState.isBlocked,
    sessionTimeoutWarning: securityState.sessionTimeoutWarning,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSafeSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSafeSecurity must be used within a SecurityProvider');
  }
  return context;
};
