
import { 
  Package, 
  Droplets, 
  DollarSign,
  CheckCircle
} from 'lucide-react';

export const alertasMockData = [
  {
    id: 1,
    titulo: 'Estoque Baixo - Tomates',
    descricao: 'Estoque de tomates abaixo do limite mínimo (5kg restantes)',
    tipo: 'estoque',
    prioridade: 'alta',
    dataHora: '2024-01-15 08:30',
    modulo: 'Estoque',
    status: 'ativo',
    icon: Package
  },
  {
    id: 2,
    titulo: 'Irrigação Programada',
    descricao: 'Próxima irrigação da Área A programada para hoje às 14:00',
    tipo: 'irrigacao',
    prioridade: 'media',
    dataHora: '2024-01-15 07:00',
    modulo: 'Plantios',
    status: 'ativo',
    icon: Droplets
  },
  {
    id: 3,
    titulo: 'Pagamento Vencido',
    descricao: 'Fatura de fertilizantes venceu há 3 dias (R$ 850,00)',
    tipo: 'financeiro',
    prioridade: 'critica',
    dataHora: '2024-01-12 16:45',
    modulo: 'Financeiro',
    status: 'ativo',
    icon: DollarSign
  },
  {
    id: 4,
    titulo: 'Colheita Concluída',
    descricao: 'Colheita de alface da Área B foi finalizada com sucesso',
    tipo: 'producao',
    prioridade: 'baixa',
    dataHora: '2024-01-14 11:20',
    modulo: 'Colheitas',
    status: 'resolvido',
    icon: CheckCircle
  }
];
