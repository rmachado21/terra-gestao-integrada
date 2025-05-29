
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";

const AlertsPanel = () => {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span>Alertas e Lembretes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse p-3 rounded-lg border">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const alerts = dashboardData?.alertas || [];

  const getPriorityColor = (priority: string) => {
    const colors = {
      alta: "text-red-600 bg-red-50 border-red-200",
      critica: "text-red-600 bg-red-50 border-red-200",
      media: "text-yellow-600 bg-yellow-50 border-yellow-200",
      baixa: "text-green-600 bg-green-50 border-green-200"
    };
    return colors[priority as keyof typeof colors] || colors.media;
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      alta: { label: "Urgente", variant: "destructive" as const },
      critica: { label: "Crítico", variant: "destructive" as const },
      media: { label: "Médio", variant: "secondary" as const },
      baixa: { label: "Baixo", variant: "outline" as const }
    };
    return badges[priority as keyof typeof badges] || badges.media;
  };

  const getAlertIcon = (type: string) => {
    const icons = {
      estoque: AlertTriangle,
      validade: Clock,
      colheita: CheckCircle,
      financeiro: Clock,
      manutencao: CheckCircle
    };
    return icons[type as keyof typeof icons] || AlertTriangle;
  };

  const handleAlertClick = (alert: any) => {
    if (alert.route) {
      navigate(alert.route);
    } else {
      // Navegar baseado no tipo do alerta
      switch (alert.tipo) {
        case 'estoque':
          navigate('/estoque');
          break;
        case 'validade':
          navigate('/estoque');
          break;
        case 'colheita':
          navigate('/colheitas');
          break;
        case 'financeiro':
          navigate('/financeiro');
          break;
        case 'plantio':
          navigate('/plantios');
          break;
        default:
          navigate('/alertas');
      }
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Alertas e Lembretes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="font-medium">Tudo certo!</p>
            <p className="text-sm mt-2">Não há alertas pendentes no momento.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <span>Alertas e Lembretes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const IconComponent = getAlertIcon(alert.tipo);
            const priority = alert.prioridade;
            const title = alert.titulo;
            const message = alert.mensagem;
            const time = getTimeAgo(alert.created_at) || 'Recente';
            
            return (
              <div 
                key={alert.id || index} 
                className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${getPriorityColor(priority)}`}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4" />
                    <span className="font-medium text-sm">{title}</span>
                  </div>
                  <Badge variant={getPriorityBadge(priority).variant} className="text-xs">
                    {getPriorityBadge(priority).label}
                  </Badge>
                </div>
                <p className="text-sm opacity-90">{message}</p>
                <p className="text-xs opacity-70 mt-1">{time}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Função auxiliar para calcular tempo relativo
function getTimeAgo(dateString: string): string {
  const agora = new Date();
  const data = new Date(dateString);
  const diffMs = agora.getTime() - data.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
  } else if (diffHours > 0) {
    return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
  } else {
    return 'Agora';
  }
}

export default AlertsPanel;
