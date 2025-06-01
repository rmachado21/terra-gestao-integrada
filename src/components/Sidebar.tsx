
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sprout, 
  Package2, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  MapPin,
  Menu,
  X,
  Home
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
  title: string;
  icon: any;
  path: string;
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: Home,
    path: '/'
  },
  {
    title: 'Áreas',
    icon: MapPin,
    path: '/areas'
  },
  {
    title: 'Plantios',
    icon: Sprout,
    path: '/plantios'
  },
  {
    title: 'Colheitas',
    icon: Package2,
    path: '/colheitas'
  },
  {
    title: 'Produção',
    icon: Package,
    path: '/processamento'
  },
  {
    title: 'Estoque',
    icon: Package,
    path: '/estoque'
  },
  {
    title: 'Vendas',
    icon: ShoppingCart,
    path: '/vendas'
  },
  {
    title: 'Financeiro',
    icon: TrendingUp,
    path: '/financeiro'
  }
];

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileOpen(false); // Fechar menu mobile após navegação
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden fixed top-20 left-4 z-50 bg-white shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:transform-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <ScrollArea className="h-full px-3 py-4">
          <div className="space-y-2">
            {menuItems.map(item => (
              <Button
                key={item.title}
                variant="ghost"
                className={cn(
                  "w-full justify-start mb-1 h-auto py-2 font-medium",
                  isActive(item.path) && "bg-green-100 text-green-800"
                )}
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left truncate">{item.title}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default Sidebar;
