
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { emailSchema } from '@/lib/security';
import { z } from 'zod';
import { ArrowLeft, Mail, Sprout, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading';
import { TurnstileWidget } from '@/components/TurnstileWidget';

interface PasswordResetRequestProps {
  onBack: () => void;
  onEmailSent: (email: string) => void;
}

const PasswordResetRequest = ({ onBack, onEmailSent }: PasswordResetRequestProps) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [showCaptchaError, setShowCaptchaError] = useState(false);
  const { loading, requestPasswordReset } = usePasswordReset();

  const validateEmail = (email: string): boolean => {
    try {
      emailSchema.parse(email);
      setEmailError('');
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    // Tentar primeiro sem captcha
    let result = await requestPasswordReset(email);
    
    // Se falhar por captcha, mostrar captcha e tentar novamente
    if (!result.success && result.error?.includes('captcha')) {
      setShowCaptchaError(true);
      return;
    }

    if (result.success) {
      onEmailSent(email);
    }
  };

  const handleCaptchaSubmit = async () => {
    if (!captchaToken) {
      setShowCaptchaError(true);
      return;
    }

    const result = await requestPasswordReset(email, captchaToken);
    if (result.success) {
      onEmailSent(email);
    }
  };

  return (
    <Card className="w-full max-w-md animate-scale-in">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center space-x-2 mb-4">
          <Sprout className="h-8 w-8 text-green-600" />
          <span className="text-2xl font-bold text-gray-900">Gestor Raiz</span>
        </div>
        <CardTitle className="flex items-center gap-2 justify-center">
          <Mail className="h-5 w-5" />
          Recuperar Senha
        </CardTitle>
        <CardDescription>
          Digite seu email para receber instruções de recuperação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="transition-all duration-200 focus:scale-105"
            />
            {emailError && <p className="text-sm text-red-600 animate-fade-in">{emailError}</p>}
          </div>

          {showCaptchaError && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Verificação de segurança necessária
                </span>
              </div>
              
              <div className="flex justify-center">
                <TurnstileWidget
                  onVerify={(token) => {
                    setCaptchaToken(token);
                    setShowCaptchaError(false);
                  }}
                  onError={() => setShowCaptchaError(true)}
                />
              </div>

              {captchaToken && (
                <Button 
                  type="button"
                  onClick={handleCaptchaSubmit}
                  className="w-full bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Enviando...
                    </div>
                  ) : (
                    'Enviar Código de Recuperação'
                  )}
                </Button>
              )}
            </div>
          )}

          {!showCaptchaError && (
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Enviando...
                </div>
              ) : (
                'Enviar Código de Recuperação'
              )}
            </Button>
          )}
        </form>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-green-600 hover:text-green-700 text-sm underline flex items-center gap-1 mx-auto transition-all duration-200 hover:scale-105"
            disabled={loading}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordResetRequest;
