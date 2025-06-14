
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserPlan } from '@/hooks/useUserPlan';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Calendar, Clock, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PlanInfo = () => {
  const { plan, loading, calculateDaysRemaining } = useUserPlan();
  const { isSuperAdmin } = useUserRoles();

  // Não mostrar para Super Admins
  if (isSuperAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="ml-2">Carregando informações do plano...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-green-600" />
            <CardTitle>Plano Atual</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Nenhum plano ativo encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  const daysRemaining = calculateDaysRemaining(plan.data_fim);
  const isExpiring = daysRemaining <= 30 && daysRemaining > 0;
  const isExpired = daysRemaining <= 0;

  const getPlanTitle = () => {
    switch (plan.tipo_plano) {
      case 'teste':
        return 'Plano Free';
      case 'mensal':
        return 'Plano Mensal';
      case 'anual':
        return 'Plano Anual';
      default:
        return 'Plano Atual';
    }
  };

  const getPlanBadge = () => {
    switch (plan.tipo_plano) {
      case 'teste':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Free (7 dias)</Badge>;
      case 'mensal':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Mensal</Badge>;
      case 'anual':
        return <Badge variant="default" className="bg-green-100 text-green-800">Anual</Badge>;
      default:
        return <Badge variant="secondary">{plan.tipo_plano}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <CreditCard className="h-6 w-6 text-green-600" />
          <CardTitle>{getPlanTitle()}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Tipo do Plano:</span>
          {getPlanBadge()}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Data de Criação:</span>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">
              {format(new Date(plan.created_at), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Data de Início:</span>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">
              {format(new Date(plan.data_inicio), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            {plan.tipo_plano === 'teste' ? 'Expira em:' : 'Renovação:'}
          </span>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">
              {format(new Date(plan.data_fim), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Dias Restantes:</span>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <Badge 
              variant={isExpired ? "destructive" : isExpiring ? "secondary" : "default"}
              className={
                isExpired 
                  ? "bg-red-100 text-red-800" 
                  : isExpiring 
                    ? "bg-yellow-100 text-yellow-800" 
                    : "bg-green-100 text-green-800"
              }
            >
              {isExpired ? 'Expirado' : `${daysRemaining} dias`}
            </Badge>
          </div>
        </div>

        {plan.tipo_plano === 'teste' && !isExpired && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              🎯 Você está no período free gratuito de 7 dias. Entre em contato para adquirir um plano completo.
            </p>
          </div>
        )}

        {isExpiring && !isExpired && plan.tipo_plano !== 'teste' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              ⚠️ Seu plano expira em breve. Entre em contato para renovar.
            </p>
          </div>
        )}

        {isExpired && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              {plan.tipo_plano === 'teste' 
                ? '⏰ Seu período free expirou. Entre em contato para adquirir um plano.' 
                : '❌ Seu plano expirou. Entre em contato para renovar o acesso.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanInfo;
