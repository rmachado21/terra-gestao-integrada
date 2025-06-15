
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useDataExport } from '@/hooks/useDataExport';

const DataBackupCard = () => {
  const { exportData, loading } = useDataExport();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Download className="h-6 w-6 text-green-600" />
          <CardTitle>Backup de Dados</CardTitle>
        </div>
        <CardDescription>
          Exporte todos os seus dados cadastrados na plataforma em uma planilha Excel.
          Isso inclui seu perfil, clientes, pedidos, produtos e muito mais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={exportData} disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Gerando Backup...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar Todos os Dados
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataBackupCard;
