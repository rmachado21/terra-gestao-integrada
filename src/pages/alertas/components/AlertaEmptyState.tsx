
import { Card, CardContent } from '@/components/ui/card';
import { Bell } from 'lucide-react';

const AlertaEmptyState = () => {
  return (
    <Card>
      <CardContent className="text-center py-8">
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhum alerta encontrado
        </h3>
        <p className="text-gray-600">
          Não há alertas que correspondam aos filtros selecionados.
        </p>
      </CardContent>
    </Card>
  );
};

export default AlertaEmptyState;
