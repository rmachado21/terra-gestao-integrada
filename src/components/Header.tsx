import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
const Header = () => {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  return <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg sm:text-xl font-semibold text-green-800">
              Sistema Bem da Terra
            </h1>
            {!isHome}
          </div>
          
          {user && <div className="flex items-center space-x-2 sm:space-x-4">
              {!isHome && <Button variant="outline" size="sm" onClick={() => navigate('/')} className="sm:hidden flex items-center">
                  <Home className="h-4 w-4" />
                </Button>}
              <div className="hidden sm:flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 truncate max-w-32 lg:max-w-none">
                  {user.email}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => signOut()} className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>}
        </div>
      </div>
    </header>;
};
export default Header;