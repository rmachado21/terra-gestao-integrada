
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { getPrioridadeColor, getPrioridadeIcon } from '../utils/alertaUtils';

interface AlertaCardProps {
  alerta: {
    id: number;
    titulo: string;
    descricao: string;
    tipo: string;
    prioridade: string;
    dataHora: string;
    modulo: string;
    status: string;
    icon: React.ComponentType<{ className?: string }>;
  };
}

const AlertaCard = ({ alerta }: AlertaCardProps) => {
  const IconComponent = alerta.icon;
  
  return (
    <Card className={`border-l-4 ${
      alerta.prioridade === 'critica' ? 'border-l-red-500' :
      alerta.prioridade === 'alta' ? 'border-l-orange-500' :
      alerta.prioridade === 'media' ? 'border-l-yellow-500' :
      'border-l-blue-500'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <IconComponent className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{alerta.titulo}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {alerta.modulo}
                </Badge>
                <Badge className={`text-xs ${getPrioridadeColor(alerta.prioridade)}`}>
                  {getPrioridadeIcon(alerta.prioridade)}
                  <span className="ml-1 capitalize">{alerta.prioridade}</span>
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            {alerta.dataHora}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 mb-4">{alerta.descricao}</p>
        
        <div className="flex items-center justify-between">
          <Badge 
            variant={alerta.status === 'ativo' ? 'default' : 'secondary'}
            className="capitalize"
          >
            {alerta.status}
          </Badge>
          
          <div className="flex gap-2">
            {alerta.status === 'ativo' && (
              <>
                <Button variant="outline" size="sm">
                  Marcar como Lido
                </Button>
                <Button size="sm">
                  Resolver
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertaCard;
