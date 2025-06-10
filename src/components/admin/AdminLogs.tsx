
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Shield, UserCheck, UserX, Key } from 'lucide-react';
import { format } from 'date-fns';

interface AdminLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
  admin_profile: { nome: string };
  target_profile: { nome: string } | null;
}

interface AdminLogsProps {
  logs: AdminLog[];
  onRefresh: () => void;
}

const AdminLogs = ({ logs, onRefresh }: AdminLogsProps) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'user_activated':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'user_deactivated':
        return <UserX className="h-4 w-4 text-red-600" />;
      case 'role_changed':
        return <Key className="h-4 w-4 text-blue-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'user_activated':
        return 'Usuário Ativado';
      case 'user_deactivated':
        return 'Usuário Desativado';
      case 'role_changed':
        return 'Role Alterada';
      default:
        return action;
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'user_activated':
        return 'default';
      case 'user_deactivated':
        return 'destructive';
      case 'role_changed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Logs de Auditoria</span>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum log de auditoria encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActionIcon(log.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {getActionLabel(log.action)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700">
                      <strong>{log.admin_profile.nome}</strong>
                      {log.target_profile && (
                        <>
                          {' '}realizou ação em{' '}
                          <strong>{log.target_profile.nome}</strong>
                        </>
                      )}
                    </p>
                    
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border">
                        <strong>Detalhes:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogs;
