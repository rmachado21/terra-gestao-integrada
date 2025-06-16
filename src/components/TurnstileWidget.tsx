
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
  const { widgetRef, token, isLoading, error, isValid } = useTurnstile();

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
          <span className="ml-2 text-sm text-gray-600">Verificando...</span>
        </div>
      )}
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
};

export default TurnstileWidget;
