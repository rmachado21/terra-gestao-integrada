
import { Button } from "@/components/ui/button";
import { Sprout, Home, Package, TrendingUp, DollarSign, Bell, Menu } from "lucide-react";
import { useState } from "react";

interface NavigationProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

const Navigation = ({ activeModule, setActiveModule }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "planting", label: "Plantio", icon: Sprout },
    { id: "production", label: "Produção", icon: Package },
    { id: "stock", label: "Estoque", icon: Package },
    { id: "sales", label: "Vendas", icon: TrendingUp },
    { id: "financial", label: "Financeiro", icon: DollarSign },
    { id: "alerts", label: "Alertas", icon: Bell }
  ];

  return (
    <nav className="bg-white shadow-lg border-b-2 border-green-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-green-800">Bem da Terra</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeModule === item.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveModule(item.id)}
                className={`flex items-center space-x-2 ${
                  activeModule === item.id 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeModule === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setActiveModule(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 ${
                    activeModule === item.id 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "text-gray-600 hover:text-green-600"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
