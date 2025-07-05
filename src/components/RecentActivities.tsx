import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Package, ShoppingCart, Sprout, DollarSign, Clock, ChevronRight } from "lucide-react";
const RecentActivities = () => {
  const navigate = useNavigate();
  const {
    data: dashboardData,
    isLoading
  } = useDashboardData();

  const getTypeConfig = (type: string) => {
    const configs = {
      production: {
        label: "Produção",
        icon: Package,
        className: "bg-orange-100 text-orange-700 border-orange-200",
        iconColor: "text-orange-600"
      },
      sale: {
        label: "Venda",
        icon: ShoppingCart,
        className: "bg-purple-100 text-purple-700 border-purple-200",
        iconColor: "text-purple-600"
      },
      stock: {
        label: "Estoque",
        icon: Package,
        className: "bg-blue-100 text-blue-700 border-blue-200",
        iconColor: "text-blue-600"
      },
      planting: {
        label: "Plantio",
        icon: Sprout,
        className: "bg-green-100 text-green-700 border-green-200",
        iconColor: "text-green-600"
      },
      financial: {
        label: "Financeiro",
        icon: DollarSign,
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
        iconColor: "text-yellow-600"
      }
    };
    return configs[type as keyof typeof configs] || configs.production;
  };

  if (isLoading) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const activities = dashboardData?.atividadesRecentes || [];

  if (activities.length === 0) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-2">Nenhuma atividade recente</p>
            <p className="text-sm text-gray-500">
              Comece registrando plantios, colheitas ou vendas para ver as atividades aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {activities.map((activity, index) => {
          const config = getTypeConfig(activity.type);
          const IconComponent = config.icon;
          
          return (
            <div
              key={index}
              className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200"
              onClick={() => navigate(activity.route)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.className.replace('text-', 'bg-').replace('border-', '').replace('bg-', 'bg-')}`}>
                <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {activity.action}
                  </p>
                  <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className={`text-xs font-medium ${config.className}`}>
                    {config.label}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-1 truncate">
                  {activity.details}
                </p>
                
                <p className="text-xs text-gray-500">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
export default RecentActivities;