import { Pedido } from '../../types/pedido';

export interface PedidoFormProps {
  pedido?: Pedido | null;
  onClose: () => void;
}

export interface ItemPedido {
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface FormData {
  cliente_id: string;
  data_pedido: string;
  status: 'pendente' | 'processando' | 'entregue' | 'cancelado';
  observacoes: string;
}

export interface Cliente {
  id: string;
  nome: string;
}

export interface Produto {
  id: string;
  nome: string;
  preco_venda?: number;
  unidade_medida: string;
}