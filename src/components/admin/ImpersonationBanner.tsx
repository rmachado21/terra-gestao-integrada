
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { useEffectiveProfile } from '@/hooks/useEffectiveProfile';

const ImpersonationBanner = () => {
  const { isImpersonating, stopImpersonation, isTransitioning } = useImpersonation();
  const { profile, loading } = useEffectiveProfile();

  if (!isImpersonating) {
    return null;
  }

  return (
    <Card className="bg-orange-50 border-orange-200 mx-4 mt-4 mb-2">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isTransitioning || loading ? (
              <Loader2 className="h-4 w-4 text-orange-600 animate-spin" />
            ) : (
              <Eye className="h-4 w-4 text-orange-600" />
            )}
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            {isTransitioning ? (
              <p className="text-sm font-medium text-orange-900">
                Alterando visualização...
              </p>
            ) : loading ? (
              <p className="text-sm font-medium text-orange-900">
                Carregando dados do usuário...
              </p>
            ) : (
              <p className="text-sm font-medium text-orange-900">
                Visualizando como: <strong>{profile?.nome || 'Usuário'}</strong>
              </p>
            )}
            <p className="text-xs text-orange-700">
              {isTransitioning || loading 
                ? 'Aguarde enquanto os dados são carregados'
                : 'Você está vendo o sistema da perspectiva deste usuário'
              }
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={stopImpersonation}
          disabled={isTransitioning}
          className="border-orange-300 text-orange-700 hover:bg-orange-100 disabled:opacity-50"
        >
          {isTransitioning ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <X className="h-4 w-4 mr-1" />
          )}
          Sair da Impersonação
        </Button>
      </div>
    </Card>
  );
};

export default ImpersonationBanner;
