
import SubscriptionManagement from '@/components/SubscriptionManagement';
import StripeIntegrationValidator from '@/components/StripeIntegrationValidator';

const SubscriptionPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Assinatura</h1>
          <p className="text-gray-600">
            Gerencie seu plano, visualize informações de cobrança e faça upgrade quando necessário.
          </p>
        </div>
        
        <div className="space-y-6">
          <SubscriptionManagement />
          <StripeIntegrationValidator />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
