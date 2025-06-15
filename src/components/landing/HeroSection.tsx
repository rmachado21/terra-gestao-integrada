import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
const HeroSection = () => {
  return <section className="relative bg-gradient-to-br from-green-50 to-blue-50 py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge variant="outline" className="w-fit bg-green-100 text-green-800 border-green-200">
              ✨ Sistema completo de gestão agrícola
            </Badge>
            
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Gerencie sua
                <span className="text-green-600 block">produção agrícola</span>
                de forma inteligente
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Sistema integrado para pequenos e médios produtores. 
                Controle plantios, estoque, vendas e finanças em um só lugar.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6">
                  Começar Grátis por 30 Dias
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
            </div>

            <div className="flex items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Suporte em português</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 border">
              <div className="flex items-center space-x-3 mb-4">
                <Sprout className="h-6 w-6 text-green-600" />
                <span className="font-semibold text-gray-900">Dashboard - Gestor Raiz</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">150ha</div>
                  <div className="text-sm text-gray-600">Área Total</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-600">Cultivos Ativos</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">R$ 89k</div>
                  <div className="text-sm text-gray-600">Receita Mensal</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">95%</div>
                  <div className="text-sm text-gray-600">Eficiência</div>
                </div>
              </div>
              
              <div className="h-32 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Gráfico de Produtividade</span>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full animate-bounce">
              <Sprout className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;