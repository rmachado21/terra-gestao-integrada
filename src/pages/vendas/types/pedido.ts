
export interface Pedido {
  id: string;
  cliente_id?: string;
  data_pedido: string;
  status: 'pendente' | 'processando' | 'entregue' | 'cancelado';
  observacoes?: string;
  valor_total: number;
  data_entrega?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  cliente?: {
    id: string;
    nome: string;
    telefone?: string;
    endereco?: string;
  };
}
