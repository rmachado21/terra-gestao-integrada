
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { CreditCard, ExternalLink, Zap, Calendar, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SubscriptionManagement = () => {
  const { subscriptionData, loading, createCheckout, openCustomerPortal } = useStripeSubscription();

  const getPlanName = (tier?: string) => {
    return tier || 'Nenhum plano ativo';
  };

  const getPlanPrice = (tier?: string) => {
    if (!tier) return '';
    return tier.includes('mensal') || tier.toLowerCase().includes('month') ? 'R$ 24,90/mês' : 'R$ 249,00/ano';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="ml-2">Carregando informações da assinatura...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const planName = getPlanName(subscriptionData?.subscription_tier);
  const planPrice = getPlanPrice(subscriptionData?.subscription_tier);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <CreditCard className="h-6 w-6 text-green-600" />
          <CardTitle>Gerenciar Assinatura</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {subscriptionData?.subscribed ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Plano Atual:</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {planName}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Preço:</span>
              <span className="text-sm font-semibold">{planPrice}</span>
            </div>

            {subscriptionData.subscription_end && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Próxima Renovação:</span>
                <span className="text-sm">
                  {format(new Date(subscriptionData.subscription_end), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button 
                onClick={openCustomerPortal}
                variant="outline" 
                className="w-full"
                disabled={loading}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Gerenciar Assinatura no Stripe
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Cancele, altere o método de pagamento ou faça upgrade do seu plano
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-4">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma Assinatura Ativa</h3>
              <p className="text-gray-600 mb-6">
                Faça upgrade para um plano pago e tenha acesso a todos os recursos do sistema.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Plano Mensal</h4>
                  <Badge variant="outline">R$ 24,90/mês</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Perfeito para começar. Pagamento mensal.
                </p>
                <Button 
                  onClick={() => createCheckout('mensal')}
                  className="w-full"
                  disabled={loading}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Assinar Mensal
                </Button>
              </div>

              <div className="border rounded-lg p-4 border-green-200 bg-green-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Plano Anual</h4>
                  <div className="text-right">
                    <Badge variant="default" className="bg-green-100 text-green-800 mb-1">
                      2 meses grátis
                    </Badge>
                    <div className="text-sm">
                      <span className="line-through text-gray-500">R$ 298,80</span>
                      <span className="font-semibold text-green-600 ml-2">R$ 249,00/ano</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Economize 2 meses de assinatura.
                </p>
                <Button 
                  onClick={() => createCheckout('anual')}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Assinar Anual
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagement;
