
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Site Key do Turnstile (chave pública - pode ser exposta)
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
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>('');
  const initAttemptRef = useRef<number>(0);

  console.log('[TURNSTILE] Hook initialized with site key:', TURNSTILE_SITE_KEY);

  const resetWidget = useCallback(() => {
    console.log('[TURNSTILE] Resetting widget');
    if (window.turnstile && widgetIdRef.current) {
      try {
        window.turnstile.reset(widgetIdRef.current);
        console.log('[TURNSTILE] Widget reset successfully');
      } catch (err) {
        console.error('[TURNSTILE] Error resetting widget:', err);
      }
    }
    setToken('');
    setIsValid(false);
    setError('');
  }, []);

  const verifyToken = useCallback(async (turnstileToken: string) => {
    console.log('[TURNSTILE] Starting token verification');
    setIsLoading(true);
    setError('');

    try {
      const { data, error: verifyError } = await supabase.functions.invoke('verify-turnstile', {
        body: { 
          token: turnstileToken,
          ip: '' // IP será detectado automaticamente pelo Cloudflare
        }
      });

      console.log('[TURNSTILE] Verification response:', { data, error: verifyError });

      if (verifyError) {
        throw new Error(verifyError.message || 'Erro na verificação');
      }

      if (data?.success) {
        console.log('[TURNSTILE] Token verified successfully');
        setIsValid(true);
        setToken(turnstileToken);
      } else {
        console.error('[TURNSTILE] Verification failed:', data);
        setError('Verificação de segurança falhou');
        resetWidget();
      }
    } catch (err) {
      console.error('[TURNSTILE] Verification error:', err);
      setError('Erro na verificação de segurança');
      resetWidget();
    } finally {
      setIsLoading(false);
    }
  }, [resetWidget]);

  const waitForTurnstile = useCallback(async (maxWait = 10000): Promise<boolean> => {
    console.log('[TURNSTILE] Waiting for Turnstile script to load...');
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      if (window.turnstile) {
        console.log('[TURNSTILE] Script loaded successfully');
        setScriptLoaded(true);
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.error('[TURNSTILE] Script loading timeout after', maxWait, 'ms');
    return false;
  }, []);

  const initializeWidget = useCallback(async () => {
    console.log('[TURNSTILE] Attempting widget initialization, attempt:', initAttemptRef.current + 1);
    
    if (!widgetRef.current) {
      console.log('[TURNSTILE] Widget ref not available');
      return;
    }

    if (widgetIdRef.current) {
      console.log('[TURNSTILE] Widget already initialized');
      return;
    }

    if (!TURNSTILE_SITE_KEY) {
      const errorMsg = 'Site Key do Turnstile não configurada';
      console.error('[TURNSTILE]', errorMsg);
      setError(errorMsg);
      return;
    }

    // Aguardar o script carregar se necessário
    if (!window.turnstile) {
      console.log('[TURNSTILE] Script not loaded, waiting...');
      const loaded = await waitForTurnstile();
      if (!loaded) {
        setError('Erro ao carregar script de segurança');
        return;
      }
    }

    try {
      console.log('[TURNSTILE] Rendering widget with site key:', TURNSTILE_SITE_KEY);
      
      widgetIdRef.current = window.turnstile.render(widgetRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => {
          console.log('[TURNSTILE] Callback received with token');
          verifyToken(token);
        },
        'error-callback': () => {
          console.error('[TURNSTILE] Error callback triggered');
          setError('Erro no widget de segurança');
          setIsLoading(false);
        },
        'expired-callback': () => {
          console.log('[TURNSTILE] Expired callback triggered');
          setError('Verificação expirada');
          resetWidget();
        },
        theme: 'light',
        size: 'normal'
      });
      
      console.log('[TURNSTILE] Widget rendered successfully with ID:', widgetIdRef.current);
      initAttemptRef.current++;
      
    } catch (err) {
      console.error('[TURNSTILE] Error rendering widget:', err);
      setError('Erro ao carregar verificação de segurança');
      
      // Tentar novamente após um delay se não passou de 3 tentativas
      if (initAttemptRef.current < 3) {
        setTimeout(() => {
          initializeWidget();
        }, 2000);
      }
    }
  }, [verifyToken, resetWidget, waitForTurnstile]);

  useEffect(() => {
    console.log('[TURNSTILE] useEffect triggered, script loaded:', scriptLoaded);
    
    // Verificar se o script já foi carregado
    if (window.turnstile) {
      console.log('[TURNSTILE] Script already available');
      setScriptLoaded(true);
      initializeWidget();
      return;
    }

    // Aguardar carregamento do script com polling
    const checkTurnstile = setInterval(() => {
      if (window.turnstile) {
        console.log('[TURNSTILE] Script detected via polling');
        clearInterval(checkTurnstile);
        setScriptLoaded(true);
        initializeWidget();
      }
    }, 200);

    // Timeout para evitar polling infinito
    const timeout = setTimeout(() => {
      clearInterval(checkTurnstile);
      if (!window.turnstile) {
        console.error('[TURNSTILE] Script loading timeout');
        setError('Timeout ao carregar script de segurança');
      }
    }, 15000);

    return () => {
      clearInterval(checkTurnstile);
      clearTimeout(timeout);
      if (window.turnstile && widgetIdRef.current) {
        try {
          console.log('[TURNSTILE] Cleaning up widget');
          window.turnstile.remove(widgetIdRef.current);
        } catch (err) {
          console.error('[TURNSTILE] Error during cleanup:', err);
        }
      }
    };
  }, [initializeWidget]);

  return {
    widgetRef,
    token,
    isLoading,
    error,
    isValid,
    resetWidget,
    scriptLoaded
  };
};
