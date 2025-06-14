
export interface Cliente {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpf_cnpj: string | null;
  cep: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
  observacoes: string | null;
}

export interface ClienteFormData {
  nome: string;
  email: string;
  telefone: string;
  cpf_cnpj: string;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  observacoes: string;
  ativo: boolean;
  documentType: 'cpf' | 'cnpj';
}
