
import { Turnstile } from '@marsidev/react-turnstile';
import { useState, useEffect } from 'react';
import { secureLogger } from '@/lib/security';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  disabled?: boolean;
}

export const TurnstileWidget = ({ 
  onSuccess, 
  onError, 
  onExpire, 
  disabled 
}: TurnstileWidgetProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Site key configurável - usar variável de ambiente ou chave real
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAABgxh3tXWTPnB9_1";
  
  useEffect(() => {
    secureLogger.info('TurnstileWidget: Iniciando carregamento', { 
      siteKey: siteKey.substring(0, 10) + '...',
      disabled,
      domain: window.location.hostname
    });
    
    // Verificar se o script do Turnstile está carregado
    const checkTurnstileScript = () => {
      if (window.turnstile) {
        secureLogger.info('TurnstileWidget: Script Turnstile carregado com sucesso');
        setIsLoading(false);
      } else {
        secureLogger.warn('TurnstileWidget: Script Turnstile não encontrado');
        setTimeout(checkTurnstileScript, 1000);
      }
    };
    
    checkTurnstileScript();
  }, [siteKey, disabled]);

  const handleSuccess = (token: string) => {
    secureLogger.info('TurnstileWidget: Verificação concluída com sucesso');
    setHasError(false);
    onSuccess(token);
  };

  const handleError = () => {
    secureLogger.error('TurnstileWidget: Erro na verificação', {
      retryCount,
      siteKey: siteKey.substring(0, 10) + '...',
      domain: window.location.hostname
    });
    setHasError(true);
    onError?.();
  };

  const handleExpire = () => {
    secureLogger.warn('TurnstileWidget: Verificação expirou');
    onExpire?.();
  };

  const handleRetry = () => {
    secureLogger.info('TurnstileWidget: Tentando novamente', { retryCount: retryCount + 1 });
    setRetryCount(prev => prev + 1);
    setHasError(false);
    setIsLoading(true);
    
    // Forçar reload do widget
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          <span className="text-sm">Carregando verificação de segurança...</span>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center my-4 p-4 border border-red-300 rounded-md bg-red-50">
        <p className="text-red-600 text-sm mb-2">
          Erro ao carregar verificação de segurança
        </p>
        <button
          onClick={handleRetry}
          className="text-sm text-green-600 hover:text-green-700 underline"
          disabled={disabled}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center my-4">
      <Turnstile
        siteKey={siteKey}
        onSuccess={handleSuccess}
        onError={handleError}
        onExpire={handleExpire}
        options={{
          theme: 'light',
          size: 'normal',
          retry: 'auto'
        }}
        style={{
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      />
    </div>
  );
};
