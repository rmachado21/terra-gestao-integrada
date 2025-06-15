
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-green-600 to-green-700">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Pronto para revolucionar sua gestão agrícola?
          </h2>
          
          <p className="text-xl mb-8 opacity-90">
            Junte-se a centenas de produtores que já estão aumentando sua produtividade e lucratividade
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-50 text-lg px-8 py-6">
                Começar Grátis por 30 Dias
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-6">
              Agendar Demonstração
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>30 dias grátis</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Suporte especializado</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
