
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Site Key do Turnstile (chave pública - pode ser exposta)
// IMPORTANTE: Substitua pela sua Site Key real do Cloudflare Dashboard
const TURNSTILE_SITE_KEY = '0x4AAAAAAAk_bYlP5tOMPKS2'; // Esta é uma chave de exemplo - substitua pela sua

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
      getResponse: (widgetId?: string) => string;
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
        body: { 
          token: turnstileToken,
          ip: '' // IP será detectado automaticamente pelo Cloudflare
        }
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
      console.error('Erro na verificação do Turnstile:', err);
      setError('Erro na verificação de segurança');
      resetWidget();
    } finally {
      setIsLoading(false);
    }
  }, [resetWidget]);

  const initializeWidget = useCallback(() => {
    if (!window.turnstile || !widgetRef.current || widgetIdRef.current) {
      return;
    }

    // Verificar se a Site Key está configurada
    if (!TURNSTILE_SITE_KEY || TURNSTILE_SITE_KEY === '0x4AAAAAABgxh3tXWTPnB9_1') {
      setError('Site Key do Turnstile não configurada');
      console.error('TURNSTILE_SITE_KEY needs to be configured with your real Site Key from Cloudflare Dashboard');
      return;
    }

    try {
      widgetIdRef.current = window.turnstile.render(widgetRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: verifyToken,
        'error-callback': () => {
          setError('Erro no widget de segurança');
          setIsLoading(false);
        },
        'expired-callback': () => {
          setError('Verificação expirada');
          resetWidget();
        },
        theme: 'light',
        size: 'normal'
      });
      console.log('Turnstile widget initialized with Site Key:', TURNSTILE_SITE_KEY);
    } catch (err) {
      console.error('Erro ao inicializar Turnstile:', err);
      setError('Erro ao carregar verificação de segurança');
    }
  }, [verifyToken, resetWidget]);

  useEffect(() => {
    // Verificar se o script já foi carregado
    if (window.turnstile) {
      initializeWidget();
      return;
    }

    // Aguardar carregamento do script
    const checkTurnstile = setInterval(() => {
      if (window.turnstile) {
        clearInterval(checkTurnstile);
        initializeWidget();
      }
    }, 100);

    return () => {
      clearInterval(checkTurnstile);
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [initializeWidget]);

  return {
    widgetRef,
    token,
    isLoading,
    error,
    isValid,
    resetWidget
  };
};
