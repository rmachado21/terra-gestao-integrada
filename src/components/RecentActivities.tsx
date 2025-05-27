
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const RecentActivities = () => {
  const activities = [
    {
      action: "Colheita registrada",
      details: "Setor D - 1.200kg mandioca",
      time: "2 horas atrás",
      type: "production"
    },
    {
      action: "Venda realizada",
      details: "Mercado Central - R$ 450,00",
      time: "4 horas atrás",
      type: "sale"
    },
    {
      action: "Estoque atualizado",
      details: "Farinha 1kg - 150 unidades",
      time: "6 horas atrás",
      type: "stock"
    },
    {
      action: "Plantio iniciado",
      details: "Setor B - 3.0ha mandioca amarela",
      time: "1 dia atrás",
      type: "planting"
    },
    {
      action: "Pagamento recebido",
      details: "Padaria São José - R$ 280,00",
      time: "2 dias atrás",
      type: "financial"
    }
  ];

  const getTypeBadge = (type: string) => {
    const badges = {
      production: { label: "Produção", variant: "default" as const },
      sale: { label: "Venda", variant: "secondary" as const },
      stock: { label: "Estoque", variant: "outline" as const },
      planting: { label: "Plantio", variant: "default" as const },
      financial: { label: "Financeiro", variant: "secondary" as const }
    };
    return badges[type as keyof typeof badges] || badges.production;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-b-0">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <Badge variant={getTypeBadge(activity.type).variant} className="text-xs">
                    {getTypeBadge(activity.type).label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{activity.details}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
