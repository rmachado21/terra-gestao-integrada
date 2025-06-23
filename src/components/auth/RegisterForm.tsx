
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TurnstileWidget } from '@/components/TurnstileWidget';

interface RegisterFormProps {
  nome: string;
  setNome: (nome: string) => void;
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
}

export const RegisterForm = ({
  nome,
  setNome,
  email,
  setEmail,
  password,
  setPassword,
  errors,
  loading,
  isBlocked,
  captchaToken,
  setCaptchaToken,
  onSubmit
}: RegisterFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome-register">Nome</Label>
        <Input
          id="nome-register"
          type="text"
          placeholder="Digite seu nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
          disabled={loading || isBlocked}
        />
        {errors.nome && <p className="text-sm text-red-600">{errors.nome}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email-register">Email</Label>
        <Input
          id="email-register"
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
        <Label htmlFor="password-register">Senha</Label>
        <Input
          id="password-register"
          type="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={loading || isBlocked}
        />
        {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
        <p className="text-xs text-gray-600 mt-1">
          Senha deve conter: 8+ caracteres, maiúscula, minúscula, número e símbolo
        </p>
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
        {loading ? 'Carregando...' : 'Cadastrar'}
      </Button>
    </form>
  );
};
