
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
  const { widgetRef, token, isLoading, error, isValid, scriptLoaded, resetWidget } = useTurnstile();
  
  // Use refs to track previous values and prevent infinite loops
  const prevTokenRef = useRef<string>('');
  const prevErrorRef = useRef<string>('');
  const retryCountRef = useRef<number>(0);

  useEffect(() => {
    if (isValid && token && token !== prevTokenRef.current && onVerified) {
      console.log('[TURNSTILE_WIDGET] Verified token callback');
      prevTokenRef.current = token;
      onVerified(token);
      retryCountRef.current = 0; // Reset retry count on success
    }
  }, [isValid, token, onVerified]);

  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      console.log('[TURNSTILE_WIDGET] Error callback:', error);
      prevErrorRef.current = error;
      
      if (onError) {
        onError(error);
      }
      
      // Auto-retry for certain errors (max 2 retries)
      if (retryCountRef.current < 2 && 
          (error.includes('Timeout') || error.includes('script') || error.includes('carregar'))) {
        retryCountRef.current++;
        console.log('[TURNSTILE_WIDGET] Auto-retry attempt:', retryCountRef.current);
        
        setTimeout(() => {
          resetWidget();
          window.location.reload(); // Force page reload as last resort
        }, 3000);
      }
    }
  }, [error, onError, resetWidget]);

  console.log('[TURNSTILE_WIDGET] Render state:', { 
    scriptLoaded, 
    isLoading, 
    error, 
    isValid, 
    hasToken: !!token,
    retryCount: retryCountRef.current
  });

  const handleManualRetry = () => {
    console.log('[TURNSTILE_WIDGET] Manual retry triggered');
    retryCountRef.current = 0;
    prevErrorRef.current = '';
    resetWidget();
    
    // Force page reload to get fresh script
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className={`turnstile-widget ${className}`}>
      <div ref={widgetRef} className="cf-turnstile" />
      
      {!scriptLoaded && !error && (
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
        <div className="mt-2">
          <p className="text-xs text-red-600">{error}</p>
          {retryCountRef.current < 2 && (
            <button
              onClick={handleManualRetry}
              className="text-xs text-blue-600 underline mt-1 hover:text-blue-700"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}
      
      {isValid && token && (
        <p className="text-xs text-green-600 mt-2">✓ Verificação concluída</p>
      )}
    </div>
  );
};

export default TurnstileWidget;
