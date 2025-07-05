import { Card, CardContent } from '@/components/ui/card';
import { PedidoFormProps } from './pedidoForm/types';
import { PedidoFormHeader } from './pedidoForm/PedidoFormHeader';
import { PedidoBasicFields } from './pedidoForm/PedidoBasicFields';
import { PedidoItemsList } from './pedidoForm/PedidoItemsList';
import { PedidoObservacoes } from './pedidoForm/PedidoObservacoes';
import { PedidoFormActions } from './pedidoForm/PedidoFormActions';
import { usePedidoForm } from './pedidoForm/hooks/usePedidoForm';

const PedidoForm = ({ pedido, onClose }: PedidoFormProps) => {
  const {
    formData,
    itens,
    clientes,
    produtos,
    valorTotal,
    isLoading,
    handleFormDataChange,
    handleItemChange,
    adicionarItem,
    removerItem,
    handleSubmit
  } = usePedidoForm(pedido, onClose);

  return (
    <Card className="fixed inset-0 z-50 bg-white shadow-xl overflow-auto animate-scale-in">
      <PedidoFormHeader isEditing={!!pedido} onClose={onClose} />
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <PedidoBasicFields
            formData={formData}
            clientes={clientes}
            onFormDataChange={handleFormDataChange}
          />

          <PedidoItemsList
            itens={itens}
            produtos={produtos}
            valorTotal={valorTotal}
            onItemChange={handleItemChange}
            onAddItem={adicionarItem}
            onRemoveItem={removerItem}
          />

          <PedidoObservacoes
            value={formData.observacoes}
            onChange={(value) => handleFormDataChange({ observacoes: value })}
          />
          
          <PedidoFormActions
            isEditing={!!pedido}
            isLoading={isLoading}
            onCancel={onClose}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default PedidoForm;
