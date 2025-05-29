
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardStats from "@/components/DashboardStats";
import QuickActions from "@/components/QuickActions";
import RecentActivities from "@/components/RecentActivities";
import AlertsPanel from "@/components/AlertsPanel";
import { Sprout, Package, TrendingUp, Users, DollarSign, Bell, BarChart3 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: "planting",
      title: "Planejamento e Plantio",
      icon: Sprout,
      color: "bg-green-500",
      description: "Controle de plantios e cronograma",
      route: "/plantios"
    },
    {
      id: "production",
      title: "Produção",
      icon: Package,
      color: "bg-orange-500",
      description: "Monitoramento de colheitas",
      route: "/colheitas"
    },
    {
      id: "stock",
      title: "Estoque",
      icon: Package,
      color: "bg-blue-500",
      description: "Gestão de produtos e lotes",
      route: "/estoque"
    },
    {
      id: "sales",
      title: "Vendas",
      icon: TrendingUp,
      color: "bg-purple-500",
      description: "Clientes e pedidos",
      route: "/vendas"
    },
    {
      id: "financial",
      title: "Financeiro",
      icon: DollarSign,
      color: "bg-yellow-500",
      description: "Controle de receitas e despesas",
      route: "/financeiro"
    },
    {
      id: "alerts",
      title: "Alertas",
      icon: Bell,
      color: "bg-red-500",
      description: "Lembretes e tarefas",
      route: "/alertas"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header padronizado */}
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema de gestão integrado</p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Quick Actions */}
      <QuickActions />

      {/* Módulos do Sistema */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Módulos do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card 
              key={module.id}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              onClick={() => navigate(module.route)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${module.color} text-white`}>
                    <module.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{module.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Atividades Recentes e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentActivities />
        <AlertsPanel />
      </div>
    </div>
  );
};

export default Index;
