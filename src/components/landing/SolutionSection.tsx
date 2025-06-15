import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
const SolutionSection = () => {
  const benefits = ["Controle total da sua produção em tempo real", "Relatórios automáticos e análises detalhadas", "Gestão integrada de estoque e vendas", "Controle financeiro completo", "Acesso de qualquer lugar pelo celular", "Suporte especializado em agricultura"];
  return <section id="solucao" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                A solução completa que você estava procurando
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                O Gestor Raiz foi desenvolvido especificamente para produtores rurais 
                que querem ter controle total de suas operações e maximizar seus resultados.
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => <div key={index} className="flex items-start space-x-3">
                  <div className="bg-green-100 rounded-full p-1 mt-1">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>)}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Começar Agora Grátis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Plantio de Milho - Área 3</h4>
                  <span className="bg-green-100 text-green-800 py-1 rounded-full px-[9px] text-left mx-0 text-xs font-normal">Crescendo</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Área:</span>
                    <span className="ml-2 font-medium">25 hectares</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Plantio:</span>
                    <span className="ml-2 font-medium">15/11/2024</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Previsão:</span>
                    <span className="ml-2 font-medium">180 sacas/ha</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Colheita:</span>
                    <span className="ml-2 font-medium">15/03/2025</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="text-2xl font-bold text-blue-600">R$ 45.890</div>
                  <div className="text-sm text-gray-600">Receita Projetada</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="text-2xl font-bold text-green-600">68%</div>
                  <div className="text-sm text-gray-600">Margem Esperada</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default SolutionSection;