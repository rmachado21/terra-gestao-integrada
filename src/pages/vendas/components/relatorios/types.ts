
export interface DadosVendas {
  resumo: {
    totalVendas: number;
    totalPedidos: number;
    pedidosEntregues: number;
    ticketMedio: number;
    taxaEntrega: number;
  };
  vendasPorDia: { data: string; valor: number }[];
  topClientes: { nome: string; valor: number }[];
  topProdutos: { nome: string; valor: number }[];
  vendasPorCategoria: { categoria: string; valor: number }[];
}
