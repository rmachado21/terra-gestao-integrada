import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardData } from "@/hooks/useDashboardData";
const RecentActivities = () => {
  const navigate = useNavigate();
  const {
    data: dashboardData,
    isLoading
  } = useDashboardData();
  if (isLoading) {
    return <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>)}
          </div>
        </CardContent>
      </Card>;
  }
  const activities = dashboardData?.atividadesRecentes || [];
  const getTypeBadge = (type: string) => {
    const badges = {
      production: {
        label: "Produção",
        className: "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
      },
      sale: {
        label: "Venda",
        className: "bg-purple-500 text-white border-purple-500 hover:bg-purple-600"
      },
      stock: {
        label: "Estoque",
        className: "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
      },
      planting: {
        label: "Plantio",
        className: "bg-green-500 text-white border-green-500 hover:bg-green-600"
      },
      financial: {
        label: "Financeiro",
        className: "bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600"
      }
    };
    return badges[type as keyof typeof badges] || badges.production;
  };
  if (activities.length === 0) {
    return <Card>
        <CardHeader>
          <CardTitle className="text-lg">Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma atividade recente encontrada.</p>
            <p className="text-sm mt-2">Comece registrando plantios, colheitas ou vendas!</p>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader>
        <CardTitle className="text-lg">Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors" onClick={() => navigate(activity.route)}>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <Badge className={getTypeBadge(activity.type).className}>
                    {getTypeBadge(activity.type).label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{activity.details}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>)}
        </div>
      </CardContent>
    </Card>;
};
export default RecentActivities;