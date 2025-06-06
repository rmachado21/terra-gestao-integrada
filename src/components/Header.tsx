
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { LogOut, User, Home, Settings } from 'lucide-react';
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
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg p-1 -m-1"
          >
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/87eeaac2-5e25-4e43-9454-c65b7ca3b6c6.png" 
                alt="Gestor Raiz Logo" 
                className="h-8 w-auto sm:h-10"
              />
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
