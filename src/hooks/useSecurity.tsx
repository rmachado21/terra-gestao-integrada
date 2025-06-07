
import { useState, useEffect, useCallback } from 'react';
import { rateLimiter, secureLogger, SECURITY_CONFIG } from '@/lib/security';

interface SecurityState {
  isBlocked: boolean;
  attemptsRemaining: number;
  sessionTimeoutWarning: boolean;
}

export const useSecurity = () => {
  const [securityState, setSecurityState] = useState<SecurityState>({
    isBlocked: false,
    attemptsRemaining: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
    sessionTimeoutWarning: false,
  });

  const [lastActivity, setLastActivity] = useState(Date.now());

  // Monitorar atividade do usuário
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Verificar rate limiting
  const checkRateLimit = useCallback((identifier: string) => {
    const isBlocked = rateLimiter.isBlocked(identifier);
    setSecurityState(prev => ({
      ...prev,
      isBlocked,
      attemptsRemaining: isBlocked ? 0 : SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS
    }));
    return !isBlocked;
  }, []);

  // Registrar tentativa de login
  const recordLoginAttempt = useCallback((identifier: string, success: boolean) => {
    if (!success) {
      rateLimiter.recordAttempt(identifier);
      secureLogger.security('failed_login_attempt', { identifier });
    } else {
      rateLimiter.reset(identifier);
      secureLogger.security('successful_login', { identifier });
    }
    
    checkRateLimit(identifier);
  }, [checkRateLimit]);

  // Monitorar timeout de sessão
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      
      // Aviso 5 minutos antes do timeout
      if (timeSinceActivity > SECURITY_CONFIG.SESSION_TIMEOUT - 5 * 60 * 1000) {
        setSecurityState(prev => ({ ...prev, sessionTimeoutWarning: true }));
      }
      
      // Logout automático por inatividade
      if (timeSinceActivity > SECURITY_CONFIG.SESSION_TIMEOUT) {
        secureLogger.security('session_timeout');
        // Disparar evento de logout
        window.dispatchEvent(new CustomEvent('security:session-timeout'));
      }
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, [lastActivity]);

  // Eventos de atividade
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [updateActivity]);

  return {
    securityState,
    checkRateLimit,
    recordLoginAttempt,
    updateActivity,
  };
};
