
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/lib/security';

export const verifyTurnstileToken = async (token: string): Promise<{ success: boolean; error?: string }> => {
  try {
    secureLogger.info('[TURNSTILE] Iniciando verificação do token');
    
    const { data, error } = await supabase.functions.invoke('verify-turnstile', {
      body: { 
        token, 
        ip: '', // IP será capturado no servidor
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      }
    });

    if (error) {
      secureLogger.error('[TURNSTILE] Erro na função verify-turnstile:', error);
      throw new Error(error.message || 'Erro na verificação');
    }

    secureLogger.info('[TURNSTILE] Resposta da verificação:', data);
    
    const success = data?.success || false;
    
    if (success) {
      secureLogger.info('[TURNSTILE] Token verificado com sucesso');
    } else {
      secureLogger.error('[TURNSTILE] Token inválido:', data);
    }

    return { success };
  } catch (err) {
    secureLogger.error('[TURNSTILE] Erro inesperado na verificação:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Erro na verificação de segurança'
    };
  }
};

export const isScriptLoaded = (): boolean => {
  const loaded = !!window.turnstile;
  secureLogger.info('[TURNSTILE] Script loaded check:', loaded);
  return loaded;
};
