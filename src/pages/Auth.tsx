
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSafeSecurity } from '@/components/SecurityProvider';
import { emailSchema, passwordSchema, nameSchema, secureLogger } from '@/lib/security';
import { z } from 'zod';
import PasswordResetRequest from '@/components/PasswordResetRequest';
import PasswordResetForm from '@/components/PasswordResetForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthTabs } from '@/components/auth/AuthTabs';

type AuthMode = 'login' | 'register' | 'reset-request' | 'reset-form';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { checkRateLimit, recordLoginAttempt, isBlocked } = useSafeSecurity();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.email = error.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.password = error.errors[0].message;
      }
    }

    if (mode === 'register') {
      try {
        nameSchema.parse(nome);
      } catch (error) {
        if (error instanceof z.ZodError) {
          newErrors.nome = error.errors[0].message;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      toast({
        title: "Acesso Bloqueado",
        description: "Muitas tentativas de login. Tente novamente em 15 minutos.",
        variant: "destructive"
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (!checkRateLimit(email)) {
      toast({
        title: "Muitas tentativas",
        description: "Aguarde antes de tentar novamente.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      if (mode === 'login') {
        secureLogger.security('login_attempt', { email });
        
        const { error } = await signIn(email, password);
        recordLoginAttempt(email, !error);
        
        if (error) {
          let errorMessage = "Erro no login";
          
          if (error.code === 'INACTIVE_USER' || error.message === 'INACTIVE_USER') {
            errorMessage = "Seu acesso está inativo. Entre em contato com o suporte.";
          } else if (error.message?.includes('Invalid login credentials')) {
            errorMessage = "Email ou senha incorretos";
          } else if (error.message?.includes('Email not confirmed')) {
            errorMessage = "Verifique seu email para confirmar a conta";
          } else if (error.message?.includes('Too many requests')) {
            errorMessage = "Muitas tentativas. Tente novamente mais tarde.";
          }
          
          toast({
            title: "Erro no login",
            description: errorMessage,
            variant: "destructive"
          });
        } else {
          navigate('/dashboard');
        }
      } else if (mode === 'register') {
        secureLogger.security('signup_attempt', { email });
        
        const { error } = await signUp(email, password, nome);
        
        if (error) {
          let errorMessage = "Erro no cadastro";
          if (error.message?.includes('User already registered')) {
            errorMessage = "Este email já está cadastrado";
          } else if (error.message?.includes('Password should be')) {
            errorMessage = "Senha não atende aos critérios de segurança";
          }
          
          toast({
            title: "Erro no cadastro",
            description: errorMessage,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Cadastro realizado",
            description: "Verifique seu email para confirmar a conta"
          });
          setMode('login');
        }
      }
    } catch (error) {
      secureLogger.error('Erro inesperado na autenticação:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSuccess = () => {
    toast({
      title: "Senha Alterada",
      description: "Sua senha foi alterada com sucesso. Faça login com a nova senha."
    });
    setMode('login');
    setEmail('');
    setPassword('');
  };

  const handleModeChange = (value: string) => {
    setMode(value as AuthMode);
    setErrors({});
    setEmail('');
    setPassword('');
    setNome('');
  };

  const renderContent = () => {
    switch (mode) {
      case 'reset-request':
        return (
          <PasswordResetRequest
            onBack={() => setMode('login')}
            onEmailSent={email => {
              setResetEmail(email);
              setMode('reset-form');
            }}
          />
        );
      case 'reset-form':
        return (
          <PasswordResetForm
            email={resetEmail}
            onBack={() => setMode('reset-request')}
            onSuccess={handleResetSuccess}
          />
        );
      case 'login':
      case 'register':
      default:
        return (
          <AuthTabs
            mode={mode}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            nome={nome}
            setNome={setNome}
            errors={errors}
            loading={loading}
            isBlocked={isBlocked}
            onSubmit={handleSubmit}
            onForgotPassword={() => setMode('reset-request')}
            onModeChange={handleModeChange}
          />
        );
    }
  };

  return (
    <AuthLayout isBlocked={isBlocked}>
      {renderContent()}
    </AuthLayout>
  );
};

export default Auth;
