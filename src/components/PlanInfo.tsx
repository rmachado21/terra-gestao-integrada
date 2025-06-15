import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserPlan } from '@/hooks/useUserPlan';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { Calendar, Clock, CreditCard, ExternalLink, Loader2, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PlanInfo = () => {
  const { plan, loading, calculateDaysRemaining } = useUserPlan();
  const { isSuperAdmin } = useUserRoles();
  const { subscriptionData, loading: stripeLoading, createCheckout, openCustomerPortal } = useStripeSubscription();

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

        {/* Stripe subscription info if available */}
        {subscriptionData?.subscribed && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-800">
                ✅ Assinatura Stripe ativa: {subscriptionData.subscription_tier}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={openCustomerPortal}
                className="text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Gerenciar
              </Button>
            </div>
          </div>
        )}

        {plan.tipo_plano === 'teste' && !isExpired && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 mb-3">
              🎯 Você está no período free gratuito de 7 dias. Faça upgrade para um plano completo.
            </p>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => createCheckout('mensal')}
                className="flex-1"
                disabled={stripeLoading}
              >
                {stripeLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processando...</>
                ) : (
                  <><Zap className="h-3 w-3 mr-1" /> Mensal R$ 7,99</>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => createCheckout('anual')}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={stripeLoading}
              >
                {stripeLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processando...</>
                ) : (
                  <><CreditCard className="h-3 w-3 mr-1" /> Anual R$ 79,90</>
                )}
              </Button>
            </div>
          </div>
        )}

        {isExpiring && !isExpired && plan.tipo_plano !== 'teste' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 mb-3">
              ⚠️ Seu plano expira em breve. Renove para continuar usando o sistema.
            </p>
            {subscriptionData?.subscribed ? (
              <Button
                size="sm"
                variant="outline"
                onClick={openCustomerPortal}
                className="w-full"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Gerenciar no Stripe
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => createCheckout('mensal')}
                  className="flex-1"
                  disabled={stripeLoading}
                >
                  {stripeLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processando...</>
                  ) : (
                    'Renovar Mensal'
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => createCheckout('anual')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={stripeLoading}
                >
                  {stripeLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processando...</>
                  ) : (
                    'Renovar Anual'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {isExpired && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 mb-3">
              {plan.tipo_plano === 'teste' 
                ? '⏰ Seu período free expirou. Faça upgrade para continuar usando o sistema.' 
                : '❌ Seu plano expirou. Renove para continuar o acesso.'
              }
            </p>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => createCheckout('mensal')}
                className="flex-1"
                disabled={stripeLoading}
              >
                {stripeLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processando...</>
                ) : (
                  <><Zap className="h-3 w-3 mr-1" /> Plano Mensal</>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => createCheckout('anual')}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={stripeLoading}
              >
                {stripeLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processando...</>
                ) : (
                  <><CreditCard className="h-3 w-3 mr-1" /> Plano Anual (Melhor valor)</>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanInfo;
