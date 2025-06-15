
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "João Silva",
      role: "Produtor de Soja - GO", 
      avatar: "JS",
      content: "Antes eu perdia muito tempo com planilhas. Agora tenho controle total da minha produção e consigo tomar decisões baseadas em dados reais.",
      rating: 5
    },
    {
      name: "Maria Santos",
      role: "Produtora de Milho - MT",
      avatar: "MS", 
      content: "O sistema me ajudou a aumentar minha produtividade em 15%. Os relatórios são muito claros e o suporte é excelente.",
      rating: 5
    },
    {
      name: "Carlos Oliveira", 
      role: "Produtor Misto - PR",
      avatar: "CO",
      content: "Finalmente encontrei um sistema feito para o produtor brasileiro. Simples de usar e com tudo que preciso para gerir minha propriedade.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Produtores de todo o Brasil já estão transformando suas propriedades
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <Quote className="h-8 w-8 text-green-200 mb-4" />
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-lg p-8 max-w-4xl mx-auto shadow-lg">
            <div className="flex items-center justify-center space-x-8 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">500+</div>
                <div className="text-sm text-gray-600">Produtores ativos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">50k+</div>
                <div className="text-sm text-gray-600">Hectares gerenciados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">4.9</div>
                <div className="text-sm text-gray-600">Nota média</div>
              </div>
            </div>
            <p className="text-gray-600">
              Junte-se aos produtores que já estão maximizando seus resultados
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
