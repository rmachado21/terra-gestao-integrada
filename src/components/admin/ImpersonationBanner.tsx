
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { UserX, User } from 'lucide-react';
import { useImpersonation } from '@/contexts/ImpersonationContext';

const ImpersonationBanner = () => {
  const { isImpersonating, impersonatedUser, stopImpersonation } = useImpersonation();

  if (!isImpersonating || !impersonatedUser) {
    return null;
  }

  return (
    <Alert className="bg-orange-50 border-orange-200 mb-4">
      <User className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-orange-800">
          <strong>Modo Super Admin:</strong> Você está visualizando o sistema como{' '}
          <strong>{impersonatedUser.nome || impersonatedUser.email}</strong>
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={stopImpersonation}
          className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
        >
          <UserX className="h-4 w-4 mr-2" />
          Sair da Visualização
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ImpersonationBanner;
