
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateEmailSecurity, suggestEmailDomain } from '@/lib/security';
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

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
  onSubmit
}: RegisterFormProps) => {
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean;
    error?: string;
    suggestion?: string;
  } | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);

  // Validação em tempo real do email
  useEffect(() => {
    if (email && emailTouched) {
      const validation = validateEmailSecurity(email);
      setEmailValidation(validation);
    } else {
      setEmailValidation(null);
    }
  }, [email, emailTouched]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailTouched(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const suggestedEmail = suggestion.split(': ')[1]?.replace('?', '');
    if (suggestedEmail) {
      setEmail(suggestedEmail);
    }
  };

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
        <div className="relative">
          <Input
            id="email-register"
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={handleEmailChange}
            required
            disabled={loading || isBlocked}
            className={
              emailValidation 
                ? emailValidation.isValid 
                  ? 'border-green-500 focus:border-green-500' 
                  : 'border-red-500 focus:border-red-500'
                : ''
            }
          />
          {emailValidation && emailTouched && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {emailValidation.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </div>

        {/* Mostrar erro de validação em tempo real */}
        {emailValidation && !emailValidation.isValid && emailTouched && (
          <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600">{emailValidation.error}</p>
          </div>
        )}

        {/* Mostrar sugestão de correção */}
        {emailValidation?.suggestion && emailTouched && (
          <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-600 mb-1">{emailValidation.suggestion}</p>
              <button
                type="button"
                onClick={() => handleSuggestionClick(emailValidation.suggestion!)}
                className="text-xs text-blue-700 underline hover:no-underline"
              >
                Usar sugestão
              </button>
            </div>
          </div>
        )}

        {/* Mostrar erro do formulário */}
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

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={loading || isBlocked || (emailValidation && !emailValidation.isValid)}
      >
        {loading ? 'Carregando...' : 'Cadastrar'}
      </Button>
    </form>
  );
};
