
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
            <div className="flex items-center space-x-3">
              {/* Nova Logo SVG */}
              <div className="relative">
                <svg width="40" height="40" viewBox="0 0 40 40" className="drop-shadow-sm">
                  {/* Engrenagem de fundo */}
                  <path
                    d="M20 4L22.5 9.5L28.5 8L28 14L34 16L30.5 21.5L35 26L29 28L28.5 34L22.5 32L20 37.5L17.5 32L11.5 34L12 28L6 26L9.5 21.5L5 16L11 14L11.5 8L17.5 9.5L20 4Z"
                    fill="#4B5563"
                    className="opacity-90"
                  />
                  {/* Círculo central */}
                  <circle cx="20" cy="20" r="10" fill="#16A34A" />
                  {/* Folhas/Planta */}
                  <path
                    d="M16 16C16 18 18 20 20 20C22 20 24 18 24 16C24 14 22 12 20 12C18 12 16 14 16 16Z"
                    fill="#FFFFFF"
                  />
                  <path
                    d="M18 18L20 20L22 18"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 20L20 24"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              
              {/* Texto da Logo */}
              <div className="flex flex-col justify-center">
                <h1 className="text-xl font-bold leading-none">
                  <span className="text-green-600">GESTOR</span>
                  <span className="text-gray-700 ml-1">RAIZ</span>
                </h1>
                <span className="text-xs text-gray-500 font-medium leading-none mt-0.5 hidden sm:block">
                  Sistema de Gestão Agrícola
                </span>
              </div>
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
