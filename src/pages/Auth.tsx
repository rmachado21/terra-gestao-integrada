import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import TurnstileWidget from '@/components/TurnstileWidget';
import { Sprout, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
type AuthMode = 'login' | 'register' | 'reset-request' | 'reset-form';
const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileError, setTurnstileError] = useState('');
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

    // Verificar Turnstile
    if (!turnstileToken) {
      newErrors.turnstile = 'Complete a verificação de segurança';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleTurnstileVerified = (token: string) => {
    setTurnstileToken(token);
    setTurnstileError('');
    // Limpar erro do Turnstile se existir
    setErrors(prev => {
      const newErrors = {
        ...prev
      };
      delete newErrors.turnstile;
      return newErrors;
    });
  };
  const handleTurnstileError = (error: string) => {
    setTurnstileError(error);
    setTurnstileToken('');
    setErrors(prev => ({
      ...prev,
      turnstile: error
    }));
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
        secureLogger.security('login_attempt_with_turnstile', {
          email,
          turnstileVerified: !!turnstileToken
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
          navigate('/dashboard');
        }
      } else if (mode === 'register') {
        secureLogger.security('signup_attempt_with_turnstile', {
          email,
          turnstileVerified: !!turnstileToken
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
    setTurnstileToken('');
    setTurnstileError('');
  };
  const renderContent = () => {
    switch (mode) {
      case 'reset-request':
        return <PasswordResetRequest onBack={() => setMode('login')} onEmailSent={email => {
          setResetEmail(email);
          setMode('reset-form');
        }} />;
      case 'reset-form':
        return <PasswordResetForm email={resetEmail} onBack={() => setMode('reset-request')} onSuccess={handleResetSuccess} />;
      case 'login':
      case 'register':
      default:
        return <Card className="w-full max-w-md rounded-md">
            <CardHeader className="text-center">
              <div className="flex justify-center items-center space-x-2 mb-4">
                <Sprout className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">Gestor Raiz</span>
              </div>
              {isBlocked && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-2">
                  Acesso temporariamente bloqueado por segurança
                </div>}
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={mode} className="w-full" onValueChange={handleModeChange}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Registro</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="pt-4">
                  <CardDescription className="text-center pb-4">
                    Faça login em sua conta
                  </CardDescription>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-login">Email</Label>
                      <Input id="email-login" type="email" placeholder="Digite seu email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading || isBlocked} />
                      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-login">Senha</Label>
                      <Input id="password-login" type="password" placeholder="Digite sua senha" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading || isBlocked} />
                      {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    </div>
                    
                    {/* Turnstile Widget */}
                    <div className="space-y-2">
                      <Label>Verificação de Segurança</Label>
                      <TurnstileWidget onVerified={handleTurnstileVerified} onError={handleTurnstileError} className="flex justify-center" />
                      {errors.turnstile && <p className="text-sm text-red-600">{errors.turnstile}</p>}
                    </div>

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading || isBlocked || !turnstileToken}>
                      {loading ? 'Carregando...' : 'Entrar'}
                    </Button>
                  </form>
                  <div className="mt-4 text-center">
                    <button type="button" onClick={() => setMode('reset-request')} className="text-green-600 hover:text-green-700 text-sm underline" disabled={loading || isBlocked}>
                      Esqueci minha senha
                    </button>
                  </div>
                </TabsContent>
                <TabsContent value="register" className="pt-4">
                  <CardDescription className="text-center pb-4">Crie sua conta. Grátis por 7 dias!</CardDescription>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome-register">Nome</Label>
                      <Input id="nome-register" type="text" placeholder="Digite seu nome" value={nome} onChange={e => setNome(e.target.value)} required disabled={loading || isBlocked} />
                      {errors.nome && <p className="text-sm text-red-600">{errors.nome}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-register">Email</Label>
                      <Input id="email-register" type="email" placeholder="Digite seu email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading || isBlocked} />
                      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-register">Senha</Label>
                      <Input id="password-register" type="password" placeholder="Digite sua senha" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading || isBlocked} />
                      {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                       <p className="text-xs text-gray-600 mt-1">
                          Senha deve conter: 8+ caracteres, maiúscula, minúscula, número e símbolo
                        </p>
                    </div>

                    {/* Turnstile Widget */}
                    <div className="space-y-2">
                      <Label>Verificação de Segurança</Label>
                      <TurnstileWidget onVerified={handleTurnstileVerified} onError={handleTurnstileError} className="flex justify-center" />
                      {errors.turnstile && <p className="text-sm text-red-600">{errors.turnstile}</p>}
                    </div>

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading || isBlocked || !turnstileToken}>
                      {loading ? 'Carregando...' : 'Cadastrar'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>;
    }
  };
  return <div className="relative min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Link to="/" className="absolute top-4 left-4 md:top-8 md:left-8 z-10" aria-label="Voltar para a página inicial">
        <Button variant="ghost" size="icon" className="rounded-full text-white bg-emerald-300 hover:bg-emerald-200">
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </Button>
      </Link>
      {renderContent()}
    </div>;
};
export default Auth;