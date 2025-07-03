import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
const PricingSection = () => {
  const plans = [{
    name: "Gratuito",
    price: "R$ 0",
    period: "7 dias",
    description: "Perfeito para testar o sistema",
    features: ["Áreas ilimitadas", "Plantios", "Controle de Produção", "Controle de Estoque", "Clientes", "Vendas", "Relatórios avançados", "Suporte", "Backup", "Acesso mobile"],
    cta: "Começar Grátis",
    highlighted: false
  }, {
    name: "Mensal",
    price: "R$ 24,90",
    period: "por mês",
    description: "Ideal para pequenos produtores",
    features: ["Áreas ilimitadas", "Plantios", "Controle de Produção", "Controle de Estoque", "Clientes", "Vendas", "Relatórios avançados", "Suporte", "Backup", "Acesso mobile"],
    cta: "Assinar Mensal",
    highlighted: false
  }, {
    name: "Anual",
    price: "R$ 249,00",
    period: "por ano",
    originalPrice: "R$ 298,80",
    savings: "2 meses grátis",
    description: "",
    features: ["Áreas ilimitadas", "Plantios", "Controle de Produção", "Controle de Estoque", "Clientes", "Vendas", "Relatórios avançados", "Suporte", "Backup", "Acesso mobile"],
    cta: "Assinar Anual",
    highlighted: true
  }];
  return <section id="precos" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Planos que se adaptam ao seu tamanho
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comece grátis e faça upgrade quando precisar. Sem surpresas, sem taxas ocultas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => <Card key={index} className={`relative ${plan.highlighted ? 'border-green-500 border-2 shadow-lg scale-105' : 'border-gray-200'}`}>
              {plan.highlighted && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Melhor Opção
                </Badge>}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-center space-x-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-500">
                      {plan.period}
                    </span>
                  </div>
                  
                  {plan.originalPrice && <div className="flex items-center justify-center space-x-2">
                      <span className="line-through text-gray-400 text-sm">
                        {plan.originalPrice}
                      </span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {plan.savings}
                      </Badge>
                    </div>}
                </div>
                <p className="text-gray-600 text-sm">
                  {plan.description}
                </p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => <li key={idx} className="flex items-start space-x-3">
                      <div className="bg-green-100 rounded-full p-1 mt-0.5">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>)}
                </ul>
                
                <Link to="/auth" className="block">
                  <Button className={`w-full ${plan.highlighted ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-900 hover:bg-gray-800'}`} size="lg">
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>)}
        </div>

        <div className="text-center mt-12 space-y-4">
          <p className="text-gray-600">
            7 dias grátis para testar
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <span>✓ Sem cartão de crédito</span>
            <span>✓ Cancele quando quiser</span>
            <span>✓ Suporte especializado</span>
          </div>
        </div>
      </div>
    </section>;
};
export default PricingSection;