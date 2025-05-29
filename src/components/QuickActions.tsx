
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, AlertTriangle, Calendar } from "lucide-react";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Novo Plantio",
      description: "Registrar nova área de plantio",
      icon: Plus,
      color: "bg-green-600 hover:bg-green-700",
      onClick: () => navigate("/plantios")
    },
    {
      title: "Registrar Colheita",
      description: "Lançar produção do dia",
      icon: FileText,
      color: "bg-orange-600 hover:bg-orange-700",
      onClick: () => navigate("/colheitas")
    },
    {
      title: "Ver Alertas",
      description: "Verificar pendências",
      icon: AlertTriangle,
      color: "bg-red-600 hover:bg-red-700",
      onClick: () => navigate("/alertas")
    },
    {
      title: "Cronograma",
      description: "Planejar atividades",
      icon: Calendar,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => navigate("/plantios")
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              className={`h-20 flex flex-col items-center justify-center space-y-2 ${action.color} text-white`}
            >
              <action.icon className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold text-sm">{action.title}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
