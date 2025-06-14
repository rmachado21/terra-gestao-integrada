
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Printer, Loader2 } from 'lucide-react';
import { usePedidoImpressao } from '../hooks/usePedidoImpressao';
import PedidoPDF from './PedidoPDF';

interface PedidoImpressaoButtonProps {
  pedidoId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showText?: boolean;
}

const PedidoImpressaoButton = ({ 
  pedidoId, 
  variant = 'outline', 
  size = 'sm',
  showText = true 
}: PedidoImpressaoButtonProps) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = usePedidoImpressao(pedidoId);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Pedido-${pedidoId.slice(-8)}`,
  });

  const handleClick = () => {
    if (data && !isLoading) {
      handlePrint();
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isLoading || !data}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Printer className="h-4 w-4" />
        )}
        {showText && (isLoading ? 'Carregando...' : 'Imprimir')}
      </Button>

      {/* Componente oculto para impressão */}
      {data && (
        <div style={{ display: 'none' }}>
          <PedidoPDF
            ref={componentRef}
            pedido={data.pedido}
            itens={data.itens}
            empresa={data.empresa}
          />
        </div>
      )}
    </>
  );
};

export default PedidoImpressaoButton;
