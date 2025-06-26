
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { passwordSchema } from '@/lib/security';
import { z } from 'zod';
import { ArrowLeft, Key, Eye, EyeOff, Sprout } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading';

interface PasswordResetFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const PasswordResetForm = ({ onBack, onSuccess }: PasswordResetFormProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { loading, resetPassword } = usePasswordReset();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Verificar se há um token de recuperação na URL
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      console.log('[RESET FORM] Tokens não encontrados na URL, redirecionando');
      onBack();
    }
  }, [searchParams, onBack]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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

    const result = await resetPassword(password);
    if (result.success) {
      onSuccess();
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
          <Key className="h-5 w-5" />
          Nova Senha
        </CardTitle>
        <CardDescription>
          Digite sua nova senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
