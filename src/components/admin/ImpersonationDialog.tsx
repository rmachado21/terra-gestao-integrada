
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Eye, AlertTriangle } from 'lucide-react';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImpersonationDialogProps {
  user: {
    id: string;
    nome: string;
    email: string;
    empresa_nome?: string;
  };
}

const ImpersonationDialog = ({ user }: ImpersonationDialogProps) => {
  const [open, setOpen] = useState(false);
  const { startImpersonation } = useImpersonation();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const handleImpersonate = () => {
    if (!currentUser) return;

    // Create a user object for impersonation
    const impersonatedUserData = {
      id: user.id,
      email: user.email,
      nome: user.nome,
      empresa_nome: user.empresa_nome,
      // Add other user properties as needed
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };

    startImpersonation(impersonatedUserData as any, currentUser);
    setOpen(false);
    navigate('/dashboard');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Visualizar como
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visualizar Sistema como Usuário
          </DialogTitle>
          <DialogDescription>
            Você está prestes a acessar o sistema como{' '}
            <strong>{user.nome}</strong> ({user.email}).
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> Ao visualizar como este usuário, você terá acesso
            a todos os dados e funcionalidades disponíveis para ele. Use esta função
            com responsabilidade.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p><strong>Nome:</strong> {user.nome}</p>
          <p><strong>Email:</strong> {user.email}</p>
          {user.empresa_nome && (
            <p><strong>Empresa:</strong> {user.empresa_nome}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleImpersonate}>
            Visualizar como Usuário
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImpersonationDialog;
