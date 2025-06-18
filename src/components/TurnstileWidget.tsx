
import React, { useEffect, useRef } from 'react';
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
  const { widgetRef, token, isLoading, error, isValid, scriptLoaded } = useTurnstile();
  
  // Use refs to track previous values and prevent infinite loops
  const prevTokenRef = useRef<string>('');
  const prevErrorRef = useRef<string>('');

  useEffect(() => {
    if (isValid && token && token !== prevTokenRef.current && onVerified) {
      console.log('[TURNSTILE_WIDGET] Verified token callback');
      prevTokenRef.current = token;
      onVerified(token);
    }
  }, [isValid, token, onVerified]);

  useEffect(() => {
    if (error && error !== prevErrorRef.current && onError) {
      console.log('[TURNSTILE_WIDGET] Error callback:', error);
      prevErrorRef.current = error;
      onError(error);
    }
  }, [error, onError]);

  console.log('[TURNSTILE_WIDGET] Render state:', { 
    scriptLoaded, 
    isLoading, 
    error, 
    isValid, 
    hasToken: !!token 
  });

  return (
    <div className={`turnstile-widget ${className}`}>
      <div ref={widgetRef} className="cf-turnstile" />
      
      {!scriptLoaded && (
        <div className="flex items-center justify-center mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          <span className="ml-2 text-sm text-gray-300">Carregando verificação...</span>
        </div>
      )}
      
      {scriptLoaded && isLoading && (
        <div className="flex items-center justify-center mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          <span className="ml-2 text-sm text-gray-300">Verificando...</span>
        </div>
      )}
      
      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
      
      {isValid && token && (
        <p className="text-xs text-green-600 mt-2">✓ Verificação concluída</p>
      )}
    </div>
  );
};

export default TurnstileWidget;
