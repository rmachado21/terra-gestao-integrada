import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive"
          });
        } else {
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, nome);
        if (error) {
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Cadastro realizado",
            description: "Verifique seu email para confirmar a conta"
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {/* Nova Logo SVG */}
            <svg width="60" height="60" viewBox="0 0 44 44" className="drop-shadow-lg">
              {/* Engrenagem externa */}
              <g transform="translate(22,22)">
                {/* Dentes da engrenagem */}
                <path
                  d="M0,-18 L3,-16 L3,-14 L6,-12 L4,-9 L6,-6 L9,-4 L12,-6 L14,-3 L16,-3 L18,0 L16,3 L14,3 L12,6 L9,4 L6,6 L4,9 L6,12 L3,14 L3,16 L0,18 L-3,16 L-3,14 L-6,12 L-4,9 L-6,6 L-9,4 L-12,6 L-14,3 L-16,3 L-18,0 L-16,-3 L-14,-3 L-12,-6 L-9,-4 L-6,-6 L-4,-9 L-6,-12 L-3,-14 L-3,-16 L0,-18Z"
                  fill="#6B7280"
                  className="opacity-90"
                />
                
                {/* Círculo interno da engrenagem */}
                <circle cx="0" cy="0" r="12" fill="#16A34A" />
                
                {/* Folha principal - lado esquerdo */}
                <path
                  d="M-8,-2 Q-12,-6 -8,-10 Q-4,-6 -4,-2 Q-8,2 -8,-2Z"
                  fill="#22C55E"
                />
                
                {/* Folha secundária - lado direito */}
                <path
                  d="M4,-2 Q8,-6 12,-2 Q8,2 4,2 Q4,-2 4,-2Z"
                  fill="#22C55E"
                />
                
                {/* Haste central */}
                <rect x="-1" y="-2" width="2" height="8" fill="#15803D" />
                
                {/* Detalhes das folhas - nervuras */}
                <path d="M-8,-2 L-6,0" stroke="#15803D" strokeWidth="0.8" fill="none" />
                <path d="M-8,-4 L-6,-2" stroke="#15803D" strokeWidth="0.8" fill="none" />
                <path d="M8,-2 L6,0" stroke="#15803D" strokeWidth="0.8" fill="none" />
                <path d="M8,-4 L6,-2" stroke="#15803D" strokeWidth="0.8" fill="none" />
                
                {/* Centro da engrenagem */}
                <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
              </g>
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">
            <span className="text-green-600">GESTOR</span>
            <span className="text-gray-700 ml-1">RAIZ</span>
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Faça login em sua conta' : 'Crie sua conta de administrador'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input 
                  id="nome" 
                  type="text" 
                  placeholder="Digite seu nome" 
                  value={nome} 
                  onChange={e => setNome(e.target.value)} 
                  required 
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Digite seu email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Digite sua senha" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={loading}
            >
              {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-green-600 hover:text-green-700 text-sm underline"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
