
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface PedidoPDFProps {
  pedido: {
    id: string;
    data_pedido: string;
    data_entrega: string | null;
    valor_total: number;
    status: string;
    observacoes: string | null;
    cliente: {
      id: string;
      nome: string;
      telefone?: string;
      endereco?: string;
      cidade?: string;
      estado?: string;
      cep?: string;
    } | null;
  };
  itens: Array<{
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
    produtos: {
      nome: string;
      unidade_medida: string;
    } | null;
  }>;
  empresa?: {
    nome?: string;
    cnpj?: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    logo_url?: string;
  };
}

const PedidoPDF = React.forwardRef<HTMLDivElement, PedidoPDFProps>(
  ({ pedido, itens, empresa }, ref) => {
    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'pendente': return 'Pendente';
        case 'processando': return 'Processando';
        case 'entregue': return 'Entregue';
        case 'cancelado': return 'Cancelado';
        default: return status;
      }
    };

    return (
      <div ref={ref} className="p-8 bg-white text-black print-document">
        <style>{`
          @media print {
            .print-document {
              width: 100%;
              margin: 0;
              padding: 20px;
              font-size: 12px;
            }
            @page {
              margin: 1cm;
              size: A4;
            }
          }
        `}</style>

        {/* Header da Empresa */}
        <div className="border-b-2 border-gray-300 pb-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {empresa?.logo_url && (
                <img 
                  src={empresa.logo_url} 
                  alt="Logo da empresa" 
                  className="h-16 w-auto mb-4"
                />
              )}
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {empresa?.nome || 'Empresa'}
              </h1>
              {empresa?.cnpj && (
                <p className="text-gray-600">CNPJ: {empresa.cnpj}</p>
              )}
              {empresa?.telefone && (
                <p className="text-gray-600">Telefone: {empresa.telefone}</p>
              )}
              {empresa?.email && (
                <p className="text-gray-600">Email: {empresa.email}</p>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-800">PEDIDO DE VENDA</h2>
              <p className="text-lg font-semibold">#{pedido.id.slice(-8)}</p>
              <p className="text-gray-600">
                Data: {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {/* Informações do Cliente e Pedido */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-gray-800">DADOS DO CLIENTE</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p><strong>Nome:</strong> {pedido.cliente?.nome || 'Cliente não informado'}</p>
                {pedido.cliente?.telefone && (
                  <p><strong>Telefone:</strong> {pedido.cliente.telefone}</p>
                )}
                {pedido.cliente?.endereco && (
                  <p><strong>Endereço:</strong> {pedido.cliente.endereco}</p>
                )}
                {pedido.cliente?.cidade && (
                  <p><strong>Cidade:</strong> {pedido.cliente.cidade} - {pedido.cliente.estado}</p>
                )}
                {pedido.cliente?.cep && (
                  <p><strong>CEP:</strong> {pedido.cliente.cep}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-gray-800">DADOS DO PEDIDO</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p><strong>Status:</strong> {getStatusLabel(pedido.status)}</p>
                <p><strong>Data do Pedido:</strong> {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</p>
                {pedido.data_entrega && (
                  <p><strong>Data de Entrega:</strong> {new Date(pedido.data_entrega).toLocaleDateString('pt-BR')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Itens */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">ITENS DO PEDIDO</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Produto</th>
                <th className="border border-gray-300 p-2 text-center">Unidade</th>
                <th className="border border-gray-300 p-2 text-center">Quantidade</th>
                <th className="border border-gray-300 p-2 text-center">Preço Unit.</th>
                <th className="border border-gray-300 p-2 text-center">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {itens?.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">
                    {item.produtos?.nome || 'Produto não encontrado'}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {item.produtos?.unidade_medida}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {item.quantidade}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    R$ {item.preco_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    R$ {item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totais */}
        <div className="flex justify-end mb-6">
          <div className="w-64">
            <div className="border-t-2 border-gray-300 pt-2">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>TOTAL GERAL:</span>
                <span>R$ {pedido.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Observações */}
        {pedido.observacoes && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-2">OBSERVAÇÕES</h3>
            <div className="border border-gray-300 p-3 bg-gray-50">
              <p>{pedido.observacoes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-300 pt-4 text-center text-sm text-gray-600">
          <p>Documento gerado em {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    );
  }
);

PedidoPDF.displayName = 'PedidoPDF';

export default PedidoPDF;
