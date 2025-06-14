
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CalendarCheck, Edit } from 'lucide-react';
import { TipoPlano } from '@/hooks/useAdminUsers';

interface PlanEditDialogProps {
  userId: string;
  currentPlan?: {
    tipo_plano: TipoPlano;
    data_inicio: string;
    data_fim: string;
  } | null;
  onUpdatePlan: (userId: string, planData: { tipo_plano: TipoPlano; data_inicio?: string }) => Promise<boolean>;
}

const PlanEditDialog = ({ userId, currentPlan, onUpdatePlan }: PlanEditDialogProps) => {
  const [open, setOpen] = useState(false);
  const [tipoPlan, setTipoPlan] = useState<TipoPlano>(currentPlan?.tipo_plano || 'teste');
  const [dataInicio, setDataInicio] = useState(currentPlan?.data_inicio || new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const success = await onUpdatePlan(userId, {
        tipo_plano: tipoPlan,
        data_inicio: dataInicio
      });
      
      if (success) {
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="h-3 w-3" />
          Editar Plano
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Editar Plano do Usuário
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo do Plano</label>
            <Select value={tipoPlan} onValueChange={(value: TipoPlano) => setTipoPlan(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teste">Teste (7 dias)</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data de Início</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanEditDialog;
