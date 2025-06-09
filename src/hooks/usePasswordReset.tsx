
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

  const requestPasswordReset = async (email: string) => {
    setState({ loading: true, emailSent: false, error: null });
    
    try {
      secureLogger.security('password_reset_requested', { email });
      
      // Chamar edge function para gerar token e enviar email
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { email }
      });

      if (error) {
        throw error;
      }

      setState({ loading: false, emailSent: true, error: null });
      toast({
        title: "Email Enviado",
        description: "Verifique sua caixa de entrada para as instruções de recuperação.",
      });

      return { success: true };
    } catch (error: any) {
      secureLogger.error('Erro na solicitação de recuperação:', error);
      setState({ loading: false, emailSent: false, error: error.message });
      
      let errorMessage = "Erro ao enviar email de recuperação";
      if (error.message?.includes('User not found')) {
        errorMessage = "Email não encontrado em nossos registros";
      } else if (error.message?.includes('Rate limit')) {
        errorMessage = "Muitas tentativas. Tente novamente em alguns minutos.";
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setState({ loading: true, emailSent: false, error: null });
    
    try {
      secureLogger.security('password_reset_attempt', { token: token.substring(0, 2) + '****' });
      
      // Chamar edge function para validar token e alterar senha
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { token, newPassword }
      });

      if (error) {
        throw error;
      }

      setState({ loading: false, emailSent: false, error: null });
      toast({
        title: "Senha Alterada",
        description: "Sua senha foi alterada com sucesso. Faça login com a nova senha.",
      });

      return { success: true };
    } catch (error: any) {
      secureLogger.error('Erro na redefinição de senha:', error);
      setState({ loading: false, emailSent: false, error: error.message });
      
      let errorMessage = "Erro ao redefinir senha";
      if (error.message?.includes('Token invalid')) {
        errorMessage = "Código inválido ou expirado";
      } else if (error.message?.includes('Token expired')) {
        errorMessage = "Código expirado. Solicite um novo código.";
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
