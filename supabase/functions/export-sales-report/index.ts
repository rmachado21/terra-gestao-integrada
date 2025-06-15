
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// Usando esm.sh para obter jspdf e jspdf-autotable em ambientes Deno
import jsPDF from 'https://esm.sh/jspdf@2.5.1';
import autoTable from 'https://esm.sh/jspdf-autotable@3.8.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { dadosVendas, periodoLabel } = await req.json()

    if (!dadosVendas) {
      throw new Error("Dados de vendas não fornecidos.");
    }

    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(18);
    doc.text('Relatório de Vendas', 14, 22);
    doc.setFontSize(11);
    doc.text(`Período: ${periodoLabel}`, 14, 29);
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    let currentY = 40;

    // Resumo
    doc.setFontSize(14);
    doc.text('Resumo Geral', 14, currentY);
    currentY += 8;

    const resumoData = [
      ['Total de Vendas', `R$ ${dadosVendas.resumo.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Total de Pedidos', dadosVendas.resumo.totalPedidos.toString()],
      ['Ticket Médio', `R$ ${dadosVendas.resumo.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Pedidos Entregues', dadosVendas.resumo.pedidosEntregues.toString()],
      ['Taxa de Entrega', `${dadosVendas.resumo.taxaEntrega.toFixed(1)}%`],
    ];
    
    (autoTable as any)(doc, {
      startY: currentY,
      head: [['Métrica', 'Valor']],
      body: resumoData,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] }, // Cor verde
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;

    // Top Clientes
    if (dadosVendas.topClientes && dadosVendas.topClientes.length > 0) {
      doc.setFontSize(14);
      doc.text('Top 5 Clientes', 14, currentY);
      currentY += 8;

      (autoTable as any)(doc, {
        startY: currentY,
        head: [['Cliente', 'Total Gasto (R$)']],
        body: dadosVendas.topClientes.slice(0, 5).map((c: { nome: string; valor: number; }) => [
          c.nome, 
          c.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        ]),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }, // Cor azul
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Top Produtos
    if (dadosVendas.topProdutos && dadosVendas.topProdutos.length > 0) {
      doc.setFontSize(14);
      doc.text('Top 5 Produtos', 14, currentY);
      currentY += 8;

      (autoTable as any)(doc, {
        startY: currentY,
        head: [['Produto', 'Total Vendas (R$)']],
        body: dadosVendas.topProdutos.slice(0, 5).map((p: { nome: string; valor: number; }) => [
          p.nome, 
          p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        ]),
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] }, // Cor roxa
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }
    
    // Vendas por Categoria
    if (dadosVendas.vendasPorCategoria && dadosVendas.vendasPorCategoria.length > 0) {
      doc.setFontSize(14);
      doc.text('Vendas por Categoria', 14, currentY);
      currentY += 8;

      (autoTable as any)(doc, {
        startY: currentY,
        head: [['Categoria', 'Total Vendas (R$)']],
        body: dadosVendas.vendasPorCategoria.map((cat: { categoria: string; valor: number; }) => [
          cat.categoria, 
          cat.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        ]),
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] }, // Cor âmbar
      });
    }

    // Rodapé
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() / 2, 287, { align: 'center' });
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 287);
    }

    const pdfOutput = doc.output('datauristring');
    
    return new Response(JSON.stringify({ pdf: pdfOutput }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Erro na função export-sales-report:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
