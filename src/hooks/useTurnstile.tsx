
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TURNSTILE_SITE_KEY = '0x4AAAAAABgxh3tXWTPnB9_1';

interface TurnstileOptions {
  sitekey: string;
  callback: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement | string, options: TurnstileOptions) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export const useTurnstile = () => {
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

  const verifyToken = useCallback(async (turnstileToken: string) => {
    setIsLoading(true);
    setError('');

    try {
      const { data, error: verifyError } = await supabase.functions.invoke('verify-turnstile', {
        body: { token: turnstileToken, ip: '' }
      });

      if (verifyError) {
        throw new Error(verifyError.message || 'Erro na verificação');
      }

      if (data?.success) {
        setIsValid(true);
        setToken(turnstileToken);
      } else {
        setError('Verificação de segurança falhou');
        resetWidget();
      }
    } catch (err) {
      setError('Erro na verificação de segurança');
      resetWidget();
    } finally {
      setIsLoading(false);
    }
  }, [resetWidget]);

  useEffect(() => {
    if (!widgetRef.current || widgetIdRef.current) return;

    // Aguardar o script carregar (máximo 10 tentativas)
    let attempts = 0;
    const checkTurnstile = setInterval(() => {
      attempts++;
      
      if (window.turnstile) {
        clearInterval(checkTurnstile);
        
        try {
          widgetIdRef.current = window.turnstile.render(widgetRef.current!, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: verifyToken,
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
        return;
      }
      
      if (attempts >= 10) {
        clearInterval(checkTurnstile);
        setError('Não foi possível carregar a verificação de segurança');
      }
    }, 500);

    return () => {
      clearInterval(checkTurnstile);
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [verifyToken, resetWidget]);

  return {
    widgetRef,
    token,
    isLoading,
    error,
    isValid,
    resetWidget,
    scriptLoaded: !!window.turnstile
  };
};
