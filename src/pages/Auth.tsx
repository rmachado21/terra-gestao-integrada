
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSafeSecurity } from '@/components/SecurityProvider';
import { emailSchema, passwordSchema, nameSchema, secureLogger } from '@/lib/security';
import { z } from 'zod';
import PasswordResetRequest from '@/components/PasswordResetRequest';
import PasswordResetForm from '@/components/PasswordResetForm';

type AuthMode = 'login' | 'register' | 'reset-request' | 'reset-form';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const {
    signIn,
    signUp
  } = useAuth();
  const {
    toast
  } = useToast();
  const {
    checkRateLimit,
    recordLoginAttempt,
    isBlocked
  } = useSafeSecurity();
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

    // Verificar rate limiting
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
        secureLogger.security('login_attempt', {
          email
        });
        const {
          error
        } = await signIn(email, password);
        recordLoginAttempt(email, !error);
        if (error) {
          let errorMessage = "Erro no login";
          
          // Verificar se é erro de usuário inativo
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
          navigate('/');
        }
      } else if (mode === 'register') {
        secureLogger.security('signup_attempt', {
          email
        });
        const {
          error
        } = await signUp(email, password, nome);
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
      description: "Sua senha foi alterada com sucesso. Faça login com a nova senha.",
    });
    setMode('login');
    setEmail('');
    setPassword('');
  };

  if (mode === 'reset-request') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <PasswordResetRequest
          onBack={() => setMode('login')}
          onEmailSent={(email) => {
            setResetEmail(email);
            setMode('reset-form');
          }}
        />
      </div>
    );
  }

  if (mode === 'reset-form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <PasswordResetForm
          email={resetEmail}
          onBack={() => setMode('reset-request')}
          onSuccess={handleResetSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/lovable-uploads/2f18bf3d-c0fa-4004-bc9f-2bd5e0785b49.png" alt="Gestor Raiz Logo" className="h-12 w-auto object-contain" />
          </div>
          
          <CardDescription>
            {mode === 'login' ? 'Faça login em sua conta' : 'Crie sua conta de administrador'}
          </CardDescription>
          {isBlocked && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-2">
              Acesso temporariamente bloqueado por segurança
            </div>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" type="text" placeholder="Digite seu nome" value={nome} onChange={e => setNome(e.target.value)} required disabled={loading || isBlocked} />
                {errors.nome && <p className="text-sm text-red-600">{errors.nome}</p>}
              </div>}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Digite seu email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading || isBlocked} />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="Digite sua senha" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading || isBlocked} />
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              {mode === 'register' && <p className="text-xs text-gray-600 mt-1">
                  Senha deve conter: 8+ caracteres, maiúscula, minúscula, número e símbolo
                </p>}
            </div>
            
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading || isBlocked}>
              {loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>
          
          <div className="mt-4 text-center space-y-2">
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setMode('reset-request')}
                className="text-green-600 hover:text-green-700 text-sm underline block mx-auto"
                disabled={loading || isBlocked}
              >
                Esqueci minha senha
              </button>
            )}
            
            <button 
              type="button" 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
              className="text-green-600 hover:text-green-700 text-sm underline" 
              disabled={loading || isBlocked}
            >
              {mode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
