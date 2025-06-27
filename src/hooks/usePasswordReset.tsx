
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { secureLogger } from '@/lib/security';

interface PasswordResetState {
  loading: boolean;
  emailSent: boolean;
  error: string | null;
}

export const usePasswordReset = () => {
  const [state, setState] = useState<PasswordResetState>({
    loading: false,
    emailSent: false,
    error: null,
  });
  const { toast } = useToast();

  const requestPasswordReset = async (email: string, captchaToken?: string) => {
    setState({ loading: true, emailSent: false, error: null });
    
    try {
      secureLogger.security('password_reset_requested', { email });
      console.log('[PASSWORD RESET] Solicitando recuperação para:', email);
      
      // Configurar opções do reset incluindo captcha se disponível
      const resetOptions: any = {
        redirectTo: `${window.location.origin}/auth?mode=reset-form`,
      };

      // Incluir captcha token se fornecido
      if (captchaToken) {
        resetOptions.captchaToken = captchaToken;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, resetOptions);

      if (error) {
        console.error('[PASSWORD RESET] Erro do Supabase:', error);
        
        // Tratamento específico de erros
        if (error.message?.includes('Captcha verification failed') || 
            error.message?.includes('captcha')) {
          throw new Error('Verificação de captcha necessária. Tente novamente.');
        }
        
        throw error;
      }

      console.log('[PASSWORD RESET] Email enviado com sucesso');
      setState({ loading: false, emailSent: true, error: null });
      
      toast({
        title: "Email Enviado",
        description: "Verifique sua caixa de entrada para as instruções de recuperação.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('[PASSWORD RESET] Erro na solicitação:', error);
      secureLogger.error('Erro na solicitação de recuperação:', error);
      setState({ loading: false, emailSent: false, error: error.message });
      
      let errorMessage = "Erro ao enviar email de recuperação";
      if (error.message?.includes('User not found')) {
        errorMessage = "Email não encontrado em nossos registros";
      } else if (error.message?.includes('Email rate limit')) {
        errorMessage = "Muitas tentativas. Tente novamente em alguns minutos.";
      } else if (error.message?.includes('captcha') || error.message?.includes('Captcha')) {
        errorMessage = "Verificação de segurança necessária. Tente novamente.";
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (newPassword: string) => {
    setState({ loading: true, emailSent: false, error: null });
    
    try {
      secureLogger.security('password_reset_attempt');
      console.log('[PASSWORD RESET] Tentando alterar senha');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('[PASSWORD RESET] Erro ao alterar senha:', error);
        throw error;
      }

      setState({ loading: false, emailSent: false, error: null });
      toast({
        title: "Senha Alterada",
        description: "Sua senha foi alterada com sucesso.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('[PASSWORD RESET] Erro na alteração de senha:', error);
      secureLogger.error('Erro na alteração de senha:', error);
      setState({ loading: false, emailSent: false, error: error.message });
      
      let errorMessage = "Erro ao alterar senha";
      if (error.message?.includes('New password should be different')) {
        errorMessage = "A nova senha deve ser diferente da atual";
      } else if (error.message?.includes('Password should be')) {
        errorMessage = "Senha não atende aos critérios de segurança";
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    }
  };

  return {
    ...state,
    requestPasswordReset,
    resetPassword,
  };
};
