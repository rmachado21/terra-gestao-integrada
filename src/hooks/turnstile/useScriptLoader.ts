
import { useState, useEffect } from 'react';
import { secureLogger } from '@/lib/security';

interface ScriptLoaderReturn {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useScriptLoader = (src: string): ScriptLoaderReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se o script já está carregado
    if (window.turnstile) {
      secureLogger.info('[TURNSTILE] Script já carregado');
      setIsLoaded(true);
      return;
    }

    // Verificar se já existe um script carregando
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      secureLogger.info('[TURNSTILE] Script já existe no DOM, aguardando carregamento...');
      setIsLoading(true);
      
      // Polling para detectar quando o script carregar
      const pollInterval = setInterval(() => {
        if (window.turnstile) {
          secureLogger.info('[TURNSTILE] Script carregado via polling');
          setIsLoaded(true);
          setIsLoading(false);
          clearInterval(pollInterval);
        }
      }, 100);

      // Timeout de 10 segundos
      const timeout = setTimeout(() => {
        secureLogger.error('[TURNSTILE] Timeout ao carregar script existente');
        setError('Timeout ao carregar verificação de segurança');
        setIsLoading(false);
        clearInterval(pollInterval);
      }, 10000);

      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeout);
      };
    }

    // Criar e carregar novo script
    secureLogger.info('[TURNSTILE] Carregando script do Turnstile...');
    setIsLoading(true);
    setError(null);

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;

    const handleLoad = () => {
      secureLogger.info('[TURNSTILE] Script carregado com sucesso');
      
      // Aguardar um pouco para garantir que o turnstile está disponível
      setTimeout(() => {
        if (window.turnstile) {
          setIsLoaded(true);
          setIsLoading(false);
        } else {
          secureLogger.error('[TURNSTILE] Script carregado mas window.turnstile não disponível');
          setError('Erro ao inicializar verificação de segurança');
          setIsLoading(false);
        }
      }, 100);
    };

    const handleError = () => {
      secureLogger.error('[TURNSTILE] Erro ao carregar script');
      setError('Erro ao carregar verificação de segurança');
      setIsLoading(false);
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    document.head.appendChild(script);

    // Timeout de segurança
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        secureLogger.error('[TURNSTILE] Timeout ao carregar script');
        setError('Timeout ao carregar verificação de segurança');
        setIsLoading(false);
      }
    }, 10000);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      clearTimeout(timeout);
    };
  }, [src, isLoaded]);

  return { isLoaded, isLoading, error };
};
