
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/lib/security';
import { cleanupAuthState, performGlobalSignOut } from './authUtils';
import { checkUserPlanStatus } from './planStatusChecker';

export const signIn = async (email: string, password: string) => {
  try {
    // Limpar estado antes de fazer login
    cleanupAuthState();
    
    // Tentar logout global primeiro
    await performGlobalSignOut();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      secureLogger.security('signin_failed', { email, error: error.message });
      return { error };
    }

    // Verificar status do usuário e plano ANTES de completar o login
    if (data.user) {
      try {
        const planStatus = await checkUserPlanStatus(data.user.id);
        
        if (planStatus.isBlocked) {
          secureLogger.security('user_blocked_on_signin', { userId: data.user.id });
          await supabase.auth.signOut();
          return { error: { message: planStatus.reason || 'Acesso negado', code: 'USER_BLOCKED' } };
        }
        
        if (planStatus.shouldRedirect) {
          secureLogger.security('user_should_redirect_on_signin', { userId: data.user.id });
          setTimeout(() => {
            window.location.href = '/subscription';
          }, 100);
          return { error: null };
        }
      } catch (error) {
        secureLogger.error('Error checking user status on signin:', error);
        await supabase.auth.signOut();
        return { error: { message: 'Erro ao verificar status do usuário' } };
      }

      secureLogger.security('signin_success', { userId: data.user.id, email });
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    }

    return { error: null };
  } catch (error) {
    secureLogger.error('Erro no signIn:', error);
    return { error };
  }
};

export const signUp = async (email: string, password: string, options?: { data?: any; captchaToken?: string | null }) => {
  try {
    cleanupAuthState();
    
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const signUpOptions: any = {
      emailRedirectTo: redirectUrl,
    };

    // Incluir data do usuário se fornecida
    if (options?.data) {
      signUpOptions.data = options.data;
    }

    // Incluir captchaToken se fornecido
    if (options?.captchaToken) {
      signUpOptions.captchaToken = options.captchaToken;
    }
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: signUpOptions,
    });

    if (error) {
      secureLogger.security('signup_failed', { email, error: error.message });
      
      // Verificar se é erro de captcha
      if (error.message?.includes('Captcha verification failed') || 
          error.message?.includes('captcha')) {
        return { error: { ...error, needsCaptcha: true } };
      }
    } else {
      secureLogger.security('signup_success', { email });
    }

    return { error };
  } catch (error) {
    secureLogger.error('Erro no signUp:', error);
    return { error };
  }
};

export const signOut = async () => {
  try {
    secureLogger.security('signout_initiated');
    cleanupAuthState();
    
    await performGlobalSignOut();
    
    // Forçar redirecionamento
    window.location.href = '/auth';
  } catch (error) {
    secureLogger.error('Erro no signOut:', error);
    // Mesmo com erro, redirecionar
    window.location.href = '/auth';
  }
};
