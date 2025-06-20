
import { useEffect, useRef, useState, useCallback } from 'react';
import { TURNSTILE_SITE_KEY } from './turnstile/constants';
import { verifyTurnstileToken, isScriptLoaded } from './turnstile/utils';
import type { UseTurnstileReturn } from './turnstile/types';

export const useTurnstile = (): UseTurnstileReturn => {
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isValid, setIsValid] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>('');

  const resetWidget = useCallback(() => {
    if (window.turnstile && widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current);
    }
    setToken('');
    setIsValid(false);
    setError('');
  }, []);

  const handleTokenVerification = useCallback(async (turnstileToken: string) => {
    setIsLoading(true);
    setError('');

    const result = await verifyTurnstileToken(turnstileToken);

    if (result.success) {
      setIsValid(true);
      setToken(turnstileToken);
    } else {
      setError(result.error || 'Verificação de segurança falhou');
      resetWidget();
    }

    setIsLoading(false);
  }, [resetWidget]);

  useEffect(() => {
    if (!widgetRef.current || widgetIdRef.current || !isScriptLoaded()) {
      return;
    }

    try {
      widgetIdRef.current = window.turnstile!.render(widgetRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: handleTokenVerification,
        'error-callback': () => setError('Erro no widget de segurança'),
        'expired-callback': () => {
          setError('Verificação expirada');
          resetWidget();
        },
        theme: 'light',
        size: 'normal'
      });
    } catch (err) {
      setError('Erro ao carregar verificação de segurança');
    }

    return () => {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [handleTokenVerification, resetWidget]);

  return {
    widgetRef,
    token,
    isLoading,
    error,
    isValid,
    resetWidget,
    scriptLoaded: isScriptLoaded()
  };
};
