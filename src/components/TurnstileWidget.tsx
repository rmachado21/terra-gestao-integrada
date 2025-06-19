
import React from 'react';
import { useTurnstile } from '@/hooks/useTurnstile';

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
  const { widgetRef, token, isLoading, error, isValid, resetWidget } = useTurnstile();

  // Chamar callbacks quando houver mudanças
  React.useEffect(() => {
    if (isValid && token && onVerified) {
      onVerified(token);
    }
  }, [isValid, token, onVerified]);

  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  return (
    <div className={`turnstile-widget ${className}`}>
      <div ref={widgetRef} className="cf-turnstile" />
      
      {isLoading && (
        <div className="flex items-center justify-center mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          <span className="ml-2 text-sm text-gray-300">Verificando...</span>
        </div>
      )}
      
      {error && (
        <div className="mt-2">
          <p className="text-xs text-red-600">{error}</p>
          <button
            onClick={resetWidget}
            className="text-xs text-blue-600 underline mt-1 hover:text-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      )}
      
      {isValid && token && (
        <p className="text-xs text-green-600 mt-2">✓ Verificação concluída</p>
      )}
    </div>
  );
};

export default TurnstileWidget;
