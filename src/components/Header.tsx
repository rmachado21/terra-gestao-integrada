
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Settings, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState as useStateHook } from 'react';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';

const Header = () => {
  const { signOut } = useAuth();
  const { user, isImpersonating } = useEffectiveUser();
  const { impersonatedUser, stopImpersonation } = useImpersonation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useStateHook(false);

  const handleSignOut = async () => {
    if (isImpersonating) {
      stopImpersonation();
      navigate('/admin/users');
    } else {
      await signOut();
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMobileMenuOpen(false);
  };

  const displayUser = isImpersonating ? impersonatedUser : user;
  const userInitials = displayUser?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-green-600">
            GestorRaiz
          </h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={`${isImpersonating ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {isImpersonating ? `Visualizando: ${displayUser?.nome || displayUser?.email}` : displayUser?.email}
                  </p>
                  {isImpersonating && (
                    <p className="text-xs leading-none text-orange-600 font-medium">
                      Modo Super Admin
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isImpersonating ? 'Sair da Visualização' : 'Sair'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-2">
            <div className="flex items-center space-x-3 py-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className={`${isImpersonating ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {isImpersonating ? `Visualizando: ${displayUser?.nome || displayUser?.email}` : displayUser?.email}
                </p>
                {isImpersonating && (
                  <p className="text-xs text-orange-600 font-medium">
                    Modo Super Admin
                  </p>
                )}
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              size="sm"
              onClick={handleProfileClick}
            >
              <User className="mr-2 h-4 w-4" />
              Perfil
            </Button>
            
            <Button variant="ghost" className="w-full justify-start relative" size="sm">
              <Bell className="mr-2 h-4 w-4" />
              Notificações
              <span className="absolute right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isImpersonating ? 'Sair da Visualização' : 'Sair'}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
