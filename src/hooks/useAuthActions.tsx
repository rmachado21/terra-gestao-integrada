
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/lib/security';
import { cleanupAuthState } from '@/lib/authUtils';

export const useAuthActions = () => {
  const signIn = async (email: string, password: string) => {
    try {
      // Limpar estado antes de fazer login
      cleanupAuthState();
      
      // Tentar logout global primeiro
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continuar mesmo se o logout falhar
        secureLogger.info('Logout preventivo falhou, continuando...');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        secureLogger.security('signin_failed', { email, error: error.message });
        return { error };
      }

      // Forçar atualização da página para garantir estado limpo
      if (data.user) {
        secureLogger.security('signin_success', { userId: data.user.id, email });
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }

      return { error: null };
    } catch (error) {
      secureLogger.error('Erro no signIn:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, nome: string) => {
    try {
      cleanupAuthState();
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        secureLogger.security('signup_failed', { email, error: error.message });
      } else {
        secureLogger.security('signup_success', { email });
      }

      return { error };
    } catch (error) {
      secureLogger.error('Erro no signUp:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      secureLogger.security('signout_initiated');
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        secureLogger.info('Erro no logout, continuando...');
      }
      
      // Forçar redirecionamento
      window.location.href = '/auth';
    } catch (error) {
      secureLogger.error('Erro no signOut:', error);
      // Mesmo com erro, redirecionar
      window.location.href = '/auth';
    }
  };

  return { signIn, signUp, signOut };
};
