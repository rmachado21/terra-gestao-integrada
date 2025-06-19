
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
  const scriptLoadedRef = useRef<boolean>(false);

  console.log('[TURNSTILE] Hook initialized - Environment:', {
    isDev: import.meta.env.DEV,
    currentDomain: window.location.hostname,
    siteKey: TURNSTILE_SITE_KEY
  });

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

  const checkScriptAvailability = useCallback((): boolean => {
    const scriptExists = document.querySelector('script[src*="challenges.cloudflare.com"]');
    const apiAvailable = window.turnstile;
    
    console.log('[TURNSTILE] Script availability check:', {
      scriptExists: !!scriptExists,
      apiAvailable: !!apiAvailable,
      scriptLoaded: scriptLoadedRef.current
    });
    
    return !!apiAvailable;
  }, []);

  const waitForTurnstile = useCallback(async (maxWait = 30000): Promise<boolean> => {
    console.log('[TURNSTILE] Waiting for Turnstile script to load...');
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        
        if (checkScriptAvailability()) {
          console.log('[TURNSTILE] Script loaded successfully after', elapsed, 'ms');
          clearInterval(checkInterval);
          setScriptLoaded(true);
          scriptLoadedRef.current = true;
          resolve(true);
          return;
        }
        
        if (elapsed >= maxWait) {
          console.error('[TURNSTILE] Script loading timeout after', maxWait, 'ms');
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 200);
    });
  }, [checkScriptAvailability]);

  const loadScriptManually = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log('[TURNSTILE] Attempting manual script load');
      
      // Verificar se já existe
      if (checkScriptAvailability()) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector('script[src*="challenges.cloudflare.com"]');
      if (existingScript) {
        existingScript.remove();
        console.log('[TURNSTILE] Removed existing script tag');
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('[TURNSTILE] Manual script load successful');
        setTimeout(() => {
          if (checkScriptAvailability()) {
            setScriptLoaded(true);
            scriptLoadedRef.current = true;
            resolve(true);
          } else {
            console.error('[TURNSTILE] API not available after manual load');
            resolve(false);
          }
        }, 1000);
      };
      
      script.onerror = (err) => {
        console.error('[TURNSTILE] Manual script load failed:', err);
        resolve(false);
      };
      
      document.head.appendChild(script);
    });
  }, [checkScriptAvailability]);

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

    // Tentar carregar o script se necessário
    let scriptAvailable = checkScriptAvailability();
    
    if (!scriptAvailable) {
      console.log('[TURNSTILE] Script not available, waiting...');
      scriptAvailable = await waitForTurnstile();
      
      if (!scriptAvailable && initAttemptRef.current < 2) {
        console.log('[TURNSTILE] Attempting manual script load...');
        scriptAvailable = await loadScriptManually();
      }
    }

    if (!scriptAvailable) {
      const errorMsg = 'Não foi possível carregar o script de segurança';
      console.error('[TURNSTILE]', errorMsg);
      setError(errorMsg);
      return;
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
        }, 3000);
      }
    }
  }, [verifyToken, resetWidget, waitForTurnstile, loadScriptManually, checkScriptAvailability]);

  useEffect(() => {
    console.log('[TURNSTILE] useEffect triggered');
    
    // Reset counters on mount
    initAttemptRef.current = 0;
    scriptLoadedRef.current = false;
    
    // Verificar se o script já foi carregado
    if (checkScriptAvailability()) {
      console.log('[TURNSTILE] Script already available');
      setScriptLoaded(true);
      scriptLoadedRef.current = true;
      initializeWidget();
      return;
    }

    // Aguardar carregamento do script com polling mais robusto
    let attempts = 0;
    const maxAttempts = 150; // 30 segundos com intervalo de 200ms
    
    const checkTurnstile = setInterval(() => {
      attempts++;
      
      if (checkScriptAvailability()) {
        console.log('[TURNSTILE] Script detected via polling after', attempts * 200, 'ms');
        clearInterval(checkTurnstile);
        setScriptLoaded(true);
        scriptLoadedRef.current = true;
        initializeWidget();
        return;
      }
      
      if (attempts >= maxAttempts) {
        console.error('[TURNSTILE] Script loading timeout after polling');
        clearInterval(checkTurnstile);
        
        // Tentar carregamento manual como último recurso
        loadScriptManually().then((success) => {
          if (success) {
            initializeWidget();
          } else {
            setError('Timeout ao carregar script de segurança');
          }
        });
      }
    }, 200);

    return () => {
      clearInterval(checkTurnstile);
      if (window.turnstile && widgetIdRef.current) {
        try {
          console.log('[TURNSTILE] Cleaning up widget');
          window.turnstile.remove(widgetIdRef.current);
        } catch (err) {
          console.error('[TURNSTILE] Error during cleanup:', err);
        }
      }
    };
  }, [initializeWidget, checkScriptAvailability, loadScriptManually]);

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
