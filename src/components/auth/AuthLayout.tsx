import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sprout } from 'lucide-react';
interface AuthLayoutProps {
  children: React.ReactNode;
  isBlocked?: boolean;
}
export const AuthLayout = ({
  children,
  isBlocked
}: AuthLayoutProps) => {
  return <div className="relative min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Link to="/" className="absolute top-4 left-4 md:top-8 md:left-8 z-10" aria-label="Voltar para a página inicial">
        <Button variant="ghost" size="icon" className="rounded-full text-white bg-emerald-300 hover:bg-emerald-200">
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </Button>
      </Link>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Sprout className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-slate-50">Gestor Raiz</span>
          </div>
          {isBlocked && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-2">
              Acesso temporariamente bloqueado por segurança
            </div>}
        </div>
        {children}
      </div>
    </div>;
};