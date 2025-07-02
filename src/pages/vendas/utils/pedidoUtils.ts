import { useToast } from '@/hooks/use-toast';
import { Pedido } from '../types/pedido';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pendente': return 'bg-yellow-100 text-yellow-800';
    case 'processando': return 'bg-blue-100 text-blue-800';
    case 'entregue': return 'bg-green-100 text-green-800';
    case 'cancelado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pendente': return 'Pendente';
    case 'processando': return 'Processando';
    case 'entregue': return 'Entregue';
    case 'cancelado': return 'Cancelado';
    default: return status;
  }
};

export const useWhatsAppHandler = () => {
  const { toast } = useToast();

  const handleWhatsApp = (pedido: Pedido) => {
    if (!pedido.cliente?.telefone) {
      toast({
        title: 'Telefone não encontrado',
        description: 'Este cliente não possui telefone cadastrado.',
        variant: 'destructive'
      });
      return;
    }

    const phone = pedido.cliente.telefone.replace(/\D/g, ''); // Remove caracteres não numéricos
    const message = `Olá ${pedido.cliente.nome}, tudo bem? Estou entrando em contato sobre o pedido #${pedido.id.slice(-8)} no valor de R$ ${pedido.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/55${phone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return { handleWhatsApp };
};