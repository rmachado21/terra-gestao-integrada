
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
  Bell,
  ChevronDown,
  ChevronRight,
  MapPin,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
  title: string;
  icon: any;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Planejamento & Plantio',
    icon: Sprout,
    children: [
      { title: 'Áreas', icon: MapPin, path: '/areas' },
      { title: 'Plantios', icon: Sprout, path: '/plantios' },
      { title: 'Cronograma', icon: Calendar, path: '/cronograma' }
    ]
  },
  {
    title: 'Produção',
    icon: Package2,
    children: [
      { title: 'Colheitas', icon: Package2, path: '/colheitas' },
      { title: 'Processamento', icon: Package, path: '/processamento' }
    ]
  },
  {
    title: 'Estoque',
    icon: Package,
    children: [
      { title: 'Produtos', icon: Package, path: '/produtos' },
      { title: 'Estoque', icon: BarChart3, path: '/estoque' }
    ]
  },
  {
    title: 'Vendas',
    icon: ShoppingCart,
    children: [
      { title: 'Vendas', icon: ShoppingCart, path: '/vendas' },
      { title: 'Clientes', icon: ShoppingCart, path: '/clientes' },
      { title: 'Pedidos', icon: ShoppingCart, path: '/pedidos' }
    ]
  },
  {
    title: 'Financeiro',
    icon: TrendingUp,
    children: [
      { title: 'Movimentações', icon: TrendingUp, path: '/financeiro' },
      { title: 'Relatórios', icon: BarChart3, path: '/relatorios' }
    ]
  },
  {
    title: 'Alertas',
    icon: Bell,
    path: '/alertas'
  }
];

const Sidebar = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['Planejamento & Plantio']);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.title}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start mb-1 h-auto py-2",
            level === 0 ? "font-medium" : "text-sm",
            level > 0 && "ml-4",
            item.path && isActive(item.path) && "bg-green-100 text-green-800"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.title);
            } else if (item.path) {
              navigate(item.path);
            }
          }}
        >
          <item.icon className="mr-2 h-4 w-4" />
          <span className="flex-1 text-left">{item.title}</span>
          {hasChildren && (
            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <ScrollArea className="h-full px-3 py-4">
        <div className="space-y-2">
          {menuItems.map(item => renderMenuItem(item))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
