
import { AlertTriangle, Clock, FileText, Calculator } from 'lucide-react';

const ProblemsSection = () => {
  const problems = [
    {
      icon: FileText,
      title: "Controle Manual",
      description: "Planilhas desorganizadas e dados perdidos"
    },
    {
      icon: Clock,
      title: "Perda de Tempo",
      description: "Horas perdidas com controles manuais"
    },
    {
      icon: Calculator,
      title: "Falta de Análise",
      description: "Dificuldade para analisar resultados"
    },
    {
      icon: AlertTriangle,
      title: "Decisões no Escuro",
      description: "Falta de dados para tomar decisões"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Os problemas que todo produtor enfrenta
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Você não está sozinho. Milhares de produtores enfrentam os mesmos desafios diariamente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {problems.map((problem, index) => {
            const IconComponent = problem.icon;
            return (
              <div key={index} className="text-center group">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                  <IconComponent className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {problem.title}
                </h3>
                <p className="text-gray-600">
                  {problem.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              "Como sei se estou tendo lucro? Meus controles são uma bagunça..."
            </h3>
            <p className="text-gray-600">
              - João Silva, Produtor Rural de Goiás
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemsSection;
