
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sprout, 
  Package, 
  DollarSign, 
  BarChart3, 
  MapPin,
  Calendar,
  Users,
  Smartphone 
} from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: MapPin,
      title: "Gestão de Áreas",
      description: "Mapeie e controle todas as suas áreas produtivas",
      details: ["Cadastro de propriedades", "Histórico por área", "Geolocalização"]
    },
    {
      icon: Sprout,
      title: "Controle de Plantios",
      description: "Acompanhe todo o ciclo produtivo",
      details: ["Planejamento de safra", "Cronograma de atividades", "Controle de insumos"]
    },
    {
      icon: Calendar,
      title: "Gestão de Colheitas", 
      description: "Registre e analise seus resultados",
      details: ["Registro de produção", "Análise de produtividade", "Comparativo de safras"]
    },
    {
      icon: Package,
      title: "Controle de Estoque",
      description: "Gerencie insumos e produtos",
      details: ["Controle de entrada/saída", "Alertas de estoque baixo", "Gestão de validades"]
    },
    {
      icon: DollarSign,
      title: "Vendas e Clientes",
      description: "Controle completo das suas vendas",
      details: ["Cadastro de clientes", "Controle de pedidos", "Gestão de entregas"]
    },
    {
      icon: BarChart3,
      title: "Relatórios Financeiros",
      description: "Análise completa dos seus resultados",
      details: ["Fluxo de caixa", "Relatório de lucros", "Análise de custos"]
    },
    {
      icon: Smartphone,
      title: "Acesso Mobile",
      description: "Use em qualquer lugar",
      details: ["App responsivo", "Funciona offline", "Sincronização automática"]
    },
    {
      icon: Users,
      title: "Gestão de Equipe",
      description: "Controle de funcionários e atividades",
      details: ["Cadastro de funcionários", "Controle de atividades", "Relatórios de produtividade"]
    }
  ];

  return (
    <section id="funcionalidades" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tudo que você precisa em um só sistema
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Módulos integrados que trabalham juntos para dar total controle da sua produção
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 bg-white">
                <CardContent className="p-6">
                  <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-green-600" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-1">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="text-xs text-gray-500 flex items-center">
                        <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
