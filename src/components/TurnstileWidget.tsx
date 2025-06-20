
import React from 'react';
import { useTurnstile } from '@/hooks/useTurnstile';
import { secureLogger } from '@/lib/security';

interface TurnstileWidgetProps {
  onVerified?: (token: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onVerified,
  onError,
  className = ''
}) => {
  const { widgetRef, token, isLoading, error, isValid, resetWidget } = useTurnstile(
    onVerified,
    onError
  );

  // Log para debugging
  React.useEffect(() => {
    secureLogger.info('[TURNSTILE_WIDGET] Estado:', {
      hasToken: !!token,
      isLoading,
      hasError: !!error,
      isValid
    });
  }, [token, isLoading, error, isValid]);

  return (
    <div className={`turnstile-widget ${className}`}>
      <div ref={widgetRef} className="cf-turnstile" />
      
      {isLoading && (
        <div className="flex items-center justify-center mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          <span className="ml-2 text-sm text-gray-600">
            {token ? 'Verificando...' : 'Carregando verificação...'}
          </span>
        </div>
      )}
      
      {error && (
        <div className="mt-2">
          <p className="text-xs text-red-600">{error}</p>
          <button
            onClick={resetWidget}
            className="text-xs text-blue-600 underline mt-1 hover:text-blue-700"
            type="button"
          >
            Tentar novamente
          </button>
        </div>
      )}
      
      {isValid && token && (
        <p className="text-xs text-green-600 mt-2 flex items-center">
          <span className="mr-1">✓</span>
          Verificação concluída
        </p>
      )}
    </div>
  );
};

export default TurnstileWidget;
