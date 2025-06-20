
import { supabase } from '@/integrations/supabase/client';

export const verifyTurnstileToken = async (token: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-turnstile', {
      body: { token, ip: '' }
    });

    if (error) {
      throw new Error(error.message || 'Erro na verificação');
    }

    return { success: data?.success || false };
  } catch (err) {
    return { success: false, error: 'Erro na verificação de segurança' };
  }
};

export const isScriptLoaded = (): boolean => {
  return !!window.turnstile;
};
