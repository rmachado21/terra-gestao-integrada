import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { toast } from '@/components/ui/use-toast';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkSubscription } = useStripeSubscription();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        toast({
          title: "Erro",
          description: "Sessão de pagamento não encontrada.",
          variant: "destructive",
        });
        navigate('/subscription');
        return;
      }

      try {
        // Aguardar um pouco para o Stripe processar
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar status da assinatura
        await checkSubscription();
        
        setVerified(true);
        toast({
          title: "Pagamento confirmado!",
          description: "Sua assinatura foi ativada com sucesso.",
        });
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        toast({
          title: "Erro na verificação",
          description: "Não foi possível verificar o pagamento. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, checkSubscription, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            {isVerifying ? (
              <Loader2 className="h-16 w-16 text-green-600 animate-spin" />
            ) : verified ? (
              <CheckCircle className="h-16 w-16 text-green-600" />
            ) : (
              <CheckCircle className="h-16 w-16 text-gray-400" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isVerifying ? 'Verificando pagamento...' : 'Pagamento realizado!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            {isVerifying 
              ? 'Aguarde enquanto confirmamos seu pagamento.'
              : 'Obrigado! Sua assinatura foi ativada com sucesso. Você já pode acessar todos os recursos do sistema.'
            }
          </p>
          
          {!isVerifying && (
            <div className="space-y-3 pt-4">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Ir para Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/subscription')}
                className="w-full"
              >
                Gerenciar Assinatura
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutSuccess;