
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { passwordSchema } from '@/lib/security';
import { z } from 'zod';
import { ArrowLeft, Key, Eye, EyeOff } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading';

interface PasswordResetFormProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

const PasswordResetForm = ({ email, onBack, onSuccess }: PasswordResetFormProps) => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { loading, resetPassword } = usePasswordReset();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!token || token.length !== 6) {
      newErrors.token = 'Código deve ter 6 dígitos';
    }

    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.password = error.errors[0].message;
      }
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await resetPassword(token, password);
    if (result.success) {
      onSuccess();
    }
  };

  return (
    <Card className="w-full max-w-md animate-scale-in">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <img 
            src="/lovable-uploads/3a6201d1-e46d-452f-bb15-83e1e6fe48a6.png" 
            alt="Gestor Raiz Logo" 
            className="h-12 w-auto object-contain" 
          />
        </div>
        <CardTitle className="flex items-center gap-2 justify-center">
          <Key className="h-5 w-5" />
          Nova Senha
        </CardTitle>
        <CardDescription>
          Digite o código enviado para {email} e sua nova senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Código de Verificação</Label>
            <Input
              id="token"
              type="text"
              placeholder="Digite o código de 6 dígitos"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
              disabled={loading}
              className="text-center text-lg tracking-widest transition-all duration-200 focus:scale-105"
            />
            {errors.token && <p className="text-sm text-red-600 animate-fade-in">{errors.token}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="transition-all duration-200 focus:scale-105"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-600 animate-fade-in">{errors.password}</p>}
            <p className="text-xs text-gray-600">
              Senha deve conter: 8+ caracteres, maiúscula, minúscula, número e símbolo
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme sua nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="transition-all duration-200 focus:scale-105"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-600 animate-fade-in">{errors.confirmPassword}</p>}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Alterando Senha...
              </div>
            ) : (
              'Alterar Senha'
            )}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-green-600 hover:text-green-700 text-sm underline flex items-center gap-1 mx-auto transition-all duration-200 hover:scale-105"
            disabled={loading}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordResetForm;
