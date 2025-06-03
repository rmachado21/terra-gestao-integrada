import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardStats from "@/components/DashboardStats";
import RecentActivities from "@/components/RecentActivities";
import AlertsPanel from "@/components/AlertsPanel";
import { Sprout, Package, TrendingUp, Users, DollarSign, BarChart3, ShoppingCart } from "lucide-react";
const Index = () => {
  const navigate = useNavigate();
  const modules = [{
    id: "sales",
    title: "Vendas",
    icon: ShoppingCart,
    color: "bg-purple-500",
    description: "Clientes e pedidos",
    route: "/vendas?tab=pedidos"
  }, {
    id: "stock",
    title: "Estoque",
    icon: Package,
    color: "bg-blue-500",
    description: "Gestão de produtos e lotes",
    route: "/estoque?tab=estoque"
  }, {
    id: "production",
    title: "Produção",
    icon: Package,
    color: "bg-orange-500",
    description: "Processamento e rastreabilidade",
    route: "/processamento"
  }, {
    id: "financial",
    title: "Financeiro",
    icon: DollarSign,
    color: "bg-yellow-500",
    description: "Controle de receitas e despesas",
    route: "/financeiro?tab=lancamentos"
  }];
  return <div className="space-y-4 sm:space-y-6">
      {/* Header padronizado */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate sm:text-2xl">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Visão geral do sistema de gestão integrado</p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Módulos do Sistema */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Módulos do Sistema</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {modules.map(module => <Card key={module.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1" onClick={() => navigate(module.route)}>
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 sm:p-3 rounded-lg ${module.color} text-white flex-shrink-0`}>
                    <module.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg truncate">{module.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm sm:text-base text-gray-600">{module.description}</p>
              </CardContent>
            </Card>)}
        </div>
      </div>

      {/* Atividades Recentes e Alertas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        <RecentActivities />
        <AlertsPanel />
      </div>
    </div>;
};
export default Index;