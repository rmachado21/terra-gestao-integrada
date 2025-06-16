
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQSection = () => {
  const faqs = [
    {
      question: "Como funciona o período grátis?",
      answer: "Você tem 7 dias para testar todas as funcionalidades do sistema gratuitamente. Não é necessário cartão de crédito e você pode cancelar a qualquer momento."
    },
    {
      question: "O sistema funciona offline?",
      answer: "Não, você pode acessar do computador, tablet ou celular, desde que conectado a internet."
    },
    {
      question: "Posso importar meus dados atuais?",
      answer: "Ainda não, nossa equipe está desenvolvendo a pção de importar seus dados através de planilhas."
    },
    {
      question: "Como funciona o suporte?",
      answer: "Oferecemos suporte via WhatsApp e email."
    },
    {
      question: "O sistema é adequado para pequenos produtores?",
      answer: "Absolutamente! O Gestor Raiz foi desenvolvido pensando nas necessidades de pequenos e médios produtores, com interface simples e funcionalidades práticas."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim, você pode cancelar sua assinatura a qualquer momento. Não há taxas de cancelamento e você continua tendo acesso até o final do período pago."
    },
    {
      question: "Os dados ficam seguros?",
      answer: "Sim, utilizamos criptografia de ponta e você pode fazer backups e baixar para o seu dispositivo a qualquer momento. Seus dados ficam armazenados em servidores seguros com certificação internacional."
    },
    {
      question: "Posso usar em vários dispositivos?",
      answer: "Sim, você pode acessar o sistema de qualquer computador, tablet ou smartphone. Os dados são sincronizados em tempo real entre todos os dispositivos."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tire suas dúvidas sobre o Gestor Raiz
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-gray-50 rounded-lg px-6 border-0"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Ainda tem dúvidas?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://wa.me/551151987533" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Falar no WhatsApp
            </a>
            <a 
              href="mailto:suporte@gestorraiz.com.br"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Enviar Email
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
