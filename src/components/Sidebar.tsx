import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sprout, Package2, Package, ShoppingCart, TrendingUp, MapPin, Menu, X, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
interface MenuItem {
  title: string;
  icon: any;
  path: string;
  color: string;
}
const menuItems: MenuItem[] = [{
  title: 'Dashboard',
  icon: Home,
  path: '/dashboard',
  color: 'text-gray-600'
}, {
  title: 'Áreas',
  icon: MapPin,
  path: '/areas',
  color: 'text-emerald-500'
}, {
  title: 'Plantios',
  icon: Sprout,
  path: '/plantios',
  color: 'text-green-600'
}, {
  title: 'Colheitas',
  icon: Package2,
  path: '/colheitas',
  color: 'text-green-700'
}, {
  title: 'Produção',
  icon: Package,
  path: '/processamento',
  color: 'text-orange-500'
}, {
  title: 'Estoque',
  icon: Package,
  path: '/estoque',
  color: 'text-blue-500'
}, {
  title: 'Vendas',
  icon: ShoppingCart,
  path: '/vendas',
  color: 'text-purple-500'
}, {
  title: 'Financeiro',
  icon: TrendingUp,
  path: '/financeiro',
  color: 'text-yellow-600'
}];
const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileOpen(false); // Fechar menu mobile após navegação
  };

  // Fechar menu mobile quando a rota mudar
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Fechar menu mobile ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return <>
      {/* Mobile Menu Button */}
      <Button variant="outline" size="sm" className="lg:hidden fixed top-20 left-4 z-50 bg-white shadow-md hover:bg-gray-50" onClick={() => setIsMobileOpen(!isMobileOpen)}>
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileOpen(false)} />}

      {/* Sidebar */}
      <div className={cn("fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:transform-none lg:translate-x-0", isMobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <ScrollArea className="h-full px-3 py-4 bg-gray-900">
          {/* Mobile Header - só aparece no mobile */}
          <div className="lg:hidden mb-6 pt-2 border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsMobileOpen(false)} className="p-1">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            {menuItems.map(item => <Button key={item.title} variant="ghost" className={cn("w-full justify-start mb-1 h-auto py-3 px-3 font-medium text-left", "hover:bg-gray-100 transition-colors duration-200", isActive(item.path) && "bg-green-100 text-green-800 hover:bg-green-100")} onClick={() => handleNavigation(item.path)}>
                <item.icon className={cn("mr-3 h-4 w-4 flex-shrink-0", item.color)} />
                <span className="flex-1 truncate text-white">{item.title}</span>
              </Button>)}
          </div>
        </ScrollArea>
      </div>
    </>;
};
export default Sidebar;