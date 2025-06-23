
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

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
  captchaToken: string | null;
  setCaptchaToken: (token: string | null) => void;
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
  captchaToken,
  setCaptchaToken,
  onSubmit,
  onForgotPassword,
  onModeChange
}: AuthTabsProps) => {
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
              captchaToken={captchaToken}
              setCaptchaToken={setCaptchaToken}
              onSubmit={onSubmit}
              onForgotPassword={onForgotPassword}
            />
          </TabsContent>
          
          <TabsContent value="register" className="pt-4">
            <CardDescription className="text-center pb-4">
              Crie sua conta. Grátis por 7 dias!
            </CardDescription>
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
              captchaToken={captchaToken}
              setCaptchaToken={setCaptchaToken}
              onSubmit={onSubmit}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
