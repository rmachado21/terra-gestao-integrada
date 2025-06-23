
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TurnstileWidget } from '@/components/TurnstileWidget';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  errors: Record<string, string>;
  loading: boolean;
  isBlocked: boolean;
  captchaToken: string | null;
  setCaptchaToken: (token: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

export const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  errors,
  loading,
  isBlocked,
  captchaToken,
  setCaptchaToken,
  onSubmit,
  onForgotPassword
}: LoginFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email-login">Email</Label>
        <Input
          id="email-login"
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={loading || isBlocked}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password-login">Senha</Label>
        <Input
          id="password-login"
          type="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={loading || isBlocked}
        />
        {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
      </div>

      <TurnstileWidget
        onSuccess={(token) => setCaptchaToken(token)}
        onError={() => setCaptchaToken(null)}
        onExpire={() => setCaptchaToken(null)}
        disabled={loading || isBlocked}
      />
      {errors.captcha && <p className="text-sm text-red-600">{errors.captcha}</p>}

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={loading || isBlocked || !captchaToken}
      >
        {loading ? 'Carregando...' : 'Entrar'}
      </Button>
      
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-green-600 hover:text-green-700 text-sm underline"
          disabled={loading || isBlocked}
        >
          Esqueci minha senha
        </button>
      </div>
    </form>
  );
};
