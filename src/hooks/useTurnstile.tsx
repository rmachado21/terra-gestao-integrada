
import { useEffect } from 'react';
import { useScriptLoader } from './turnstile/useScriptLoader';
import { useTurnstileWidget } from './turnstile/useTurnstileWidget';
import { secureLogger } from '@/lib/security';
import type { UseTurnstileReturn } from './turnstile/types';

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

export const useTurnstile = (
  onVerified?: (token: string) => void,
  onError?: (error: string) => void
): UseTurnstileReturn => {
  const { isLoaded: scriptLoaded, isLoading: scriptLoading, error: scriptError } = useScriptLoader(TURNSTILE_SCRIPT_URL);
  
  const {
    widgetRef,
    token,
    isValid,
    error: widgetError,
    isVerifying,
    resetWidget,
    renderWidget
  } = useTurnstileWidget(onVerified, onError);

  // Determinar o estado de loading geral
  const isLoading = scriptLoading || isVerifying;
  
  // Determinar o erro geral
  const error = scriptError || widgetError;

  // Renderizar widget quando script carregar
  useEffect(() => {
    if (scriptLoaded && !widgetError && !token) {
      secureLogger.info('[TURNSTILE] Script carregado, renderizando widget...');
      renderWidget();
    }
  }, [scriptLoaded, widgetError, token, renderWidget]);

  // Log do estado atual para debugging
  useEffect(() => {
    secureLogger.info('[TURNSTILE] Estado atual:', {
      scriptLoaded,
      scriptLoading,
      scriptError,
      widgetError,
      token: !!token,
      isValid,
      isVerifying
    });
  }, [scriptLoaded, scriptLoading, scriptError, widgetError, token, isValid, isVerifying]);

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
