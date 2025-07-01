
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useEffectiveProfile } from '@/hooks/useEffectiveProfile';
import { LogOut, User, Home, Settings, Shield, Sprout, Eye } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserRoles } from '@/hooks/useUserRoles';

const Header = () => {
  const { user, signOut } = useAuth();
  const { profile, loading, isImpersonating } = useEffectiveProfile();
  const { isSuperAdmin } = useUserRoles();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center h-16 px-4">
        {/* Logo alinhado com o sidebar */}
        <div className="w-64 flex items-center">
          <button 
            onClick={() => navigate(user ? '/dashboard' : '/')} 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg p-1 -m-1"
          >
            <div className="flex items-center space-x-2">
              <Sprout className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">Gestor Raiz</span>
            </div>
          </button>
        </div>
        
        {user && (
          <div className="flex items-center space-x-2 sm:space-x-3 pr-2 sm:pr-4">
            {!isDashboard && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard')} 
                className="lg:hidden flex items-center justify-center p-2"
              >
                <Home className="h-4 w-4" />
              </Button>
            )}
            
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-md">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4 text-gray-500" />
                {isImpersonating && <Eye className="h-4 w-4 text-orange-600" />}
              </div>
              {loading ? (
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <span className="text-sm text-gray-600 font-medium max-w-32 lg:max-w-none truncate">
                  {profile?.nome || user.email}
                </span>
              )}
              {isSuperAdmin && !isImpersonating && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-medium">
                  Super Admin
                </span>
              )}
              {isImpersonating && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-medium">
                  Impersonando
                </span>
              )}
            </div>
            
            {isSuperAdmin && !isImpersonating && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/admin/users')} 
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Admin</span>
              </Button>
            )}
            
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
