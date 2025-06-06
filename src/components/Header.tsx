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
                <svg width="44" height="44" viewBox="0 0 44 44" className="drop-shadow-md">
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
