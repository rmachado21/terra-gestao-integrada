
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Package, TrendingUp, DollarSign } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";

const DashboardStats = () => {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Área Plantada",
      value: dashboardData?.stats.areaPlantada.value || "0 ha",
      subtitle: dashboardData?.stats.areaPlantada.subtitle || "Nenhuma área ativa",
      icon: Sprout,
      color: "text-green-600",
      bg: "bg-green-100",
      route: "/plantios"
    },
    {
      title: "Produção Mensal",
      value: dashboardData?.stats.producaoMensal.value || "0 kg",
      subtitle: dashboardData?.stats.producaoMensal.subtitle || "0% vs mês anterior",
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-100",
      route: "/colheitas"
    },
    {
      title: "Vendas do Mês",
      value: dashboardData?.stats.vendasMes.value || "R$ 0,00",
      subtitle: dashboardData?.stats.vendasMes.subtitle || "0 pedidos entregues",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-100",
      route: "/vendas"
    },
    {
      title: "Lucro Líquido",
      value: dashboardData?.stats.lucroLiquido.value || "R$ 0,00",
      subtitle: dashboardData?.stats.lucroLiquido.subtitle || "Margem de 0%",
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-100",
      route: "/financeiro"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          onClick={() => navigate(stat.route)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <p className="text-xs text-gray-500">
              {stat.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
