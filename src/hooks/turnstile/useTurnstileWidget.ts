
import { useRef, useState, useCallback, useEffect } from 'react';
import { TURNSTILE_SITE_KEY } from './constants';
import { verifyTurnstileToken } from './utils';
import { secureLogger } from '@/lib/security';

interface UseTurnstileWidgetReturn {
  widgetRef: React.RefObject<HTMLDivElement>;
  token: string;
  isValid: boolean;
  error: string;
  isVerifying: boolean;
  resetWidget: () => void;
  renderWidget: () => void;
}

export const useTurnstileWidget = (
  onVerified?: (token: string) => void,
  onError?: (error: string) => void
): UseTurnstileWidgetReturn => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>('');
  const [token, setToken] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const resetWidget = useCallback(() => {
    secureLogger.info('[TURNSTILE] Resetando widget');
    
    if (window.turnstile && widgetIdRef.current) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (err) {
        secureLogger.error('[TURNSTILE] Erro ao resetar widget:', err);
      }
    }
    
    setToken('');
    setIsValid(false);
    setError('');
    setIsVerifying(false);
    widgetIdRef.current = '';
  }, []);

  const handleSuccess = useCallback(async (turnstileToken: string) => {
    secureLogger.info('[TURNSTILE] Token recebido, verificando...');
    setIsVerifying(true);
    setError('');

    try {
      const result = await verifyTurnstileToken(turnstileToken);
      
      if (result.success) {
        secureLogger.info('[TURNSTILE] Token verificado com sucesso');
        setToken(turnstileToken);
        setIsValid(true);
        onVerified?.(turnstileToken);
      } else {
        secureLogger.error('[TURNSTILE] Falha na verificação:', result.error);
        setError(result.error || 'Verificação de segurança falhou');
        onError?.(result.error || 'Verificação de segurança falhou');
        resetWidget();
      }
    } catch (err) {
      secureLogger.error('[TURNSTILE] Erro inesperado na verificação:', err);
      setError('Erro inesperado na verificação');
      onError?.('Erro inesperado na verificação');
      resetWidget();
    } finally {
      setIsVerifying(false);
    }
  }, [onVerified, onError, resetWidget]);

  const handleWidgetError = useCallback(() => {
    secureLogger.error('[TURNSTILE] Erro no widget');
    setError('Erro no widget de segurança');
    onError?.('Erro no widget de segurança');
  }, [onError]);

  const handleExpired = useCallback(() => {
    secureLogger.warn('[TURNSTILE] Widget expirado');
    setError('Verificação expirada, tente novamente');
    onError?.('Verificação expirada, tente novamente');
    resetWidget();
  }, [onError, resetWidget]);

  const renderWidget = useCallback(() => {
    if (!window.turnstile || !widgetRef.current || widgetIdRef.current) {
      return;
    }

    try {
      secureLogger.info('[TURNSTILE] Renderizando widget...');
      
      widgetIdRef.current = window.turnstile.render(widgetRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: handleSuccess,
        'error-callback': handleWidgetError,
        'expired-callback': handleExpired,
        theme: 'light',
        size: 'normal'
      });

      secureLogger.info('[TURNSTILE] Widget renderizado:', widgetIdRef.current);
    } catch (err) {
      secureLogger.error('[TURNSTILE] Erro ao renderizar widget:', err);
      setError('Erro ao carregar verificação de segurança');
      onError?.('Erro ao carregar verificação de segurança');
    }
  }, [handleSuccess, handleWidgetError, handleExpired, onError]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (err) {
          secureLogger.error('[TURNSTILE] Erro ao remover widget:', err);
        }
      }
    };
  }, []);

  return {
    widgetRef,
    token,
    isValid,
    error,
    isVerifying,
    resetWidget,
    renderWidget
  };
};
