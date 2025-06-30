
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardData } from "@/hooks/useDashboardData";

const RecentActivities = () => {
  const navigate = useNavigate();
  const { recentActivities, loading } = useDashboardData();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTypeBadge = (type: string) => {
    const badges = {
      plantio: {
        label: "Plantio",
        className: "bg-green-500 text-white border-green-500 hover:bg-green-600"
      },
      colheita: {
        label: "Colheita",
        className: "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
      },
      venda: {
        label: "Venda",
        className: "bg-purple-500 text-white border-purple-500 hover:bg-purple-600"
      },
      estoque: {
        label: "Estoque",
        className: "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
      }
    };
    return badges[type as keyof typeof badges] || badges.plantio;
  };

  if (recentActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma atividade recente encontrada.</p>
            <p className="text-sm mt-2">Comece registrando plantios, colheitas ou vendas!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div 
              key={activity.id} 
              className="flex items-start space-x-3 pb-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="font-medium text-sm">{activity.description}</p>
                  <Badge className={getTypeBadge(activity.type).className}>
                    {getTypeBadge(activity.type).label}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(activity.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
