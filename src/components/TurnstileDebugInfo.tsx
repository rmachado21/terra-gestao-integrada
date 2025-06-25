
import { useState } from 'react';
import { secureLogger } from '@/lib/security';

interface TurnstileDebugInfoProps {
  isVisible?: boolean;
}

export const TurnstileDebugInfo = ({ isVisible = false }: TurnstileDebugInfoProps) => {
  const [showDebug, setShowDebug] = useState(isVisible);

  if (!import.meta.env.DEV && !showDebug) {
    return null;
  }

  const debugInfo = {
    domain: window.location.hostname,
    protocol: window.location.protocol,
    siteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY || "Usando chave de teste",
    turnstileLoaded: !!window.turnstile,
    userAgent: navigator.userAgent.slice(0, 50) + '...',
    timestamp: new Date().toISOString()
  };

  const handleCopyDebugInfo = () => {
    navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
    secureLogger.info('Debug info copiado para clipboard');
  };

  return (
    <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Turnstile Debug Info:</span>
        <button
          onClick={handleCopyDebugInfo}
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Copiar
        </button>
      </div>
      <pre className="whitespace-pre-wrap text-gray-700">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};
