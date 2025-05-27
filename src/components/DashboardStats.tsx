
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Package, TrendingUp, DollarSign } from "lucide-react";

const DashboardStats = () => {
  const stats = [
    {
      title: "Área Plantada",
      value: "7.3 ha",
      subtitle: "3 setores ativos",
      icon: Sprout,
      color: "text-green-600",
      bg: "bg-green-100"
    },
    {
      title: "Produção Mensal",
      value: "2.950 kg",
      subtitle: "↑ 15% vs mês anterior",
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-100"
    },
    {
      title: "Vendas do Mês",
      value: "R$ 12.450",
      subtitle: "38 pedidos entregues",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-100"
    },
    {
      title: "Lucro Líquido",
      value: "R$ 7.170",
      subtitle: "Margem de 57.6%",
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
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
