
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { LogOut, User, Home, Settings, Sprout, Gear } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center h-16 px-4">
        {/* Logo alinhado com o sidebar */}
        <div className="w-64 flex items-center">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg p-1 -m-1"
          >
            <div className="relative flex items-center justify-center">
              <div className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded-lg shadow-md">
                <Gear className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <Sprout className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500 absolute -top-0.5 -right-0.5 bg-white rounded-full p-0.5" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent leading-none text-left">
                GESTOR RAIZ
              </h1>
              <span className="text-xs text-green-600 font-medium leading-none mt-0.5 text-left hidden sm:block">
                Sistema de Gestão
              </span>
            </div>
          </button>
        </div>
        
        {user && (
          <div className="flex items-center space-x-2 sm:space-x-3 pr-2 sm:pr-4">
            {!isHome && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/')} 
                className="lg:hidden flex items-center justify-center p-2"
              >
                <Home className="h-4 w-4" />
              </Button>
            )}
            
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-md">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium max-w-32 lg:max-w-none truncate">
                {profile?.nome || user.email}
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/profile')} 
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => signOut()} 
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Sair</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
