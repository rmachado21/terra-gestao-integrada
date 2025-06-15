
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/lib/security';

// Função para limpar estado de autenticação
export const cleanupAuthState = () => {
  try {
    // Remove tokens do localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove tokens do sessionStorage se existir
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    secureLogger.error('Erro ao limpar estado de autenticação:', error);
  }
};

export const performGlobalSignOut = async () => {
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (err) {
    secureLogger.info('Logout preventivo falhou, continuando...');
  }
};

export const checkSubscription = async (session: any) => {
  if (!session) return;
  
  try {
    await supabase.functions.invoke('check-subscription', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
  } catch (error) {
    secureLogger.error('Error checking subscription:', error);
  }
};
