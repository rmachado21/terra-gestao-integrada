
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, AlertTriangle, Loader2 } from 'lucide-react';
import { useImpersonation } from '@/contexts/ImpersonationContext';

interface ImpersonationDialogProps {
  userId: string;
  userName: string;
}

const ImpersonationDialog = ({ userId, userName }: ImpersonationDialogProps) => {
  const [open, setOpen] = useState(false);
  const { startImpersonation, canImpersonate, isTransitioning } = useImpersonation();

  const handleConfirm = async () => {
    await startImpersonation(userId);
    setOpen(false);
  };

  if (!canImpersonate) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Ver como</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Confirmar Impersonação
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              Você está prestes a visualizar o sistema como <strong>{userName}</strong>.
            </p>
            <div className="bg-orange-50 p-3 rounded-md border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>Aviso:</strong> Esta ação será registrada nos logs de auditoria. 
                Você verá todos os dados deste usuário e poderá navegar pelo sistema 
                como se fosse ele.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isTransitioning}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isTransitioning}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
          >
            {isTransitioning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Iniciando...
              </>
            ) : (
              'Confirmar Impersonação'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImpersonationDialog;
