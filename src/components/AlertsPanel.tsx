
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

const AlertsPanel = () => {
  const alerts = [
    {
      title: "Estoque Crítico",
      message: "Mandioca embalada 2kg - apenas 45 unidades",
      priority: "high",
      icon: AlertTriangle,
      time: "Agora"
    },
    {
      title: "Colheita Pronta",
      message: "Setor A está pronto para colheita",
      priority: "medium",
      icon: Clock,
      time: "1h atrás"
    },
    {
      title: "Produtos Vencendo",
      message: "3 produtos vencem nos próximos 5 dias",
      priority: "medium",
      icon: Clock,
      time: "2h atrás"
    },
    {
      title: "Manutenção Agendada",
      message: "Equipamento de processamento - 30/05",
      priority: "low",
      icon: CheckCircle,
      time: "1 dia atrás"
    },
    {
      title: "Pagamento Pendente",
      message: "Padaria São José - R$ 280,00",
      priority: "medium",
      icon: Clock,
      time: "2 dias atrás"
    }
  ];

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "text-red-600 bg-red-50 border-red-200",
      medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
      low: "text-green-600 bg-green-50 border-green-200"
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      high: { label: "Urgente", variant: "destructive" as const },
      medium: { label: "Médio", variant: "secondary" as const },
      low: { label: "Baixo", variant: "outline" as const }
    };
    return badges[priority as keyof typeof badges] || badges.medium;
  };

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
          {alerts.map((alert, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg border ${getPriorityColor(alert.priority)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <alert.icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{alert.title}</span>
                </div>
                <Badge variant={getPriorityBadge(alert.priority).variant} className="text-xs">
                  {getPriorityBadge(alert.priority).label}
                </Badge>
              </div>
              <p className="text-sm opacity-90">{alert.message}</p>
              <p className="text-xs opacity-70 mt-1">{alert.time}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;
