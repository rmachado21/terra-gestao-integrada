
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { TurnstileWidget } from '@/components/TurnstileWidget';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

type AuthMode = 'login' | 'register';

interface AuthTabsProps {
  mode: AuthMode;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  nome: string;
  setNome: (nome: string) => void;
  errors: Record<string, string>;
  loading: boolean;
  isBlocked: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  onModeChange: (value: string) => void;
}

export const AuthTabs = ({
  mode,
  email,
  setEmail,
  password,
  setPassword,
  nome,
  setNome,
  errors,
  loading,
  isBlocked,
  onSubmit,
  onForgotPassword,
  onModeChange
}: AuthTabsProps) => {
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [showCaptchaForRegister, setShowCaptchaForRegister] = useState(false);

  const handleSubmitWithCaptcha = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Para registro, verificar se precisa de captcha
    if (mode === 'register' && !captchaToken && !showCaptchaForRegister) {
      // Tentar primeiro sem captcha
      onSubmit(e);
      return;
    }
    
    onSubmit(e);
  };

  return (
    <Card className="w-full rounded-xl">
      <CardContent className="p-6">
        <Tabs defaultValue={mode} className="w-full" onValueChange={onModeChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Registro</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="pt-4">
            <CardDescription className="text-center pb-4">
              Faça login em sua conta
            </CardDescription>
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              errors={errors}
              loading={loading}
              isBlocked={isBlocked}
              onSubmit={onSubmit}
              onForgotPassword={onForgotPassword}
            />
          </TabsContent>
          
          <TabsContent value="register" className="pt-4">
            <CardDescription className="text-center pb-4">
              Crie sua conta. Grátis por 7 dias!
            </CardDescription>
            
            <form onSubmit={handleSubmitWithCaptcha} className="space-y-4">
              <RegisterForm
                nome={nome}
                setNome={setNome}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                errors={errors}
                loading={loading}
                isBlocked={isBlocked}
                onSubmit={handleSubmitWithCaptcha}
              />

              {showCaptchaForRegister && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Verificação de segurança necessária para criar conta
                    </span>
                  </div>
                  
                  <div className="flex justify-center">
                    <TurnstileWidget
                      onVerify={(token) => {
                        setCaptchaToken(token);
                        setShowCaptchaForRegister(false);
                      }}
                      onError={() => setShowCaptchaForRegister(true)}
                    />
                  </div>
                </div>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
