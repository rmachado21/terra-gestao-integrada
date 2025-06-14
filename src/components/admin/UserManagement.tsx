import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Users, Crown, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { UserRole } from '@/hooks/useUserRoles';
import { TipoPlano } from '@/hooks/useAdminUsers';
import PlanEditDialog from './PlanEditDialog';
interface AdminUser {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cargo?: string;
  ativo: boolean;
  created_at: string;
  user_roles: {
    role: UserRole;
  }[];
  user_plan?: {
    tipo_plano: TipoPlano;
    data_inicio: string;
    data_fim: string;
    ativo: boolean;
  } | null;
}
interface UserManagementProps {
  users: AdminUser[];
  loading: boolean;
  onToggleStatus: (userId: string, active: boolean) => Promise<boolean>;
  onChangeRole: (userId: string, newRole: UserRole) => Promise<boolean>;
  onUpdatePlan: (userId: string, planData: {
    tipo_plano: TipoPlano;
    data_inicio?: string;
  }) => Promise<boolean>;
  onRefresh: () => void;
  calculateRemainingDays: (dataFim: string) => number;
}
const UserManagement = ({
  users,
  loading,
  onToggleStatus,
  onChangeRole,
  onUpdatePlan,
  onRefresh,
  calculateRemainingDays
}: UserManagementProps) => {
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setUpdatingUsers(prev => new Set(prev).add(userId));
    try {
      await onToggleStatus(userId, !currentStatus);
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingUsers(prev => new Set(prev).add(userId));
    try {
      await onChangeRole(userId, newRole);
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      default:
        return 'secondary';
    }
  };
  const getPlanBadgeVariant = (tipoPlan: TipoPlano) => {
    switch (tipoPlan) {
      case 'anual':
        return 'default';
      case 'teste':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  const getPlanLabel = (tipoPlan: TipoPlano) => {
    switch (tipoPlan) {
      case 'teste':
        return 'Free (7 dias)';
      case 'mensal':
        return 'Mensal';
      case 'anual':
        return 'Anual';
      default:
        return tipoPlan;
    }
  };
  const isSuperAdmin = (userRoles: {
    role: UserRole;
  }[]) => {
    return userRoles.some(role => role.role === 'super_admin');
  };
  if (loading) {
    return <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
      </div>;
  }
  return <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Gerenciamento de Usuários ({users.length})</span>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? <div className="text-center py-8 text-gray-500">
              Nenhum usuário encontrado.
            </div> : <div className="space-y-4">
              {users.map(user => {
            const isUserSuperAdmin = isSuperAdmin(user.user_roles);
            const remainingDays = user.user_plan ? calculateRemainingDays(user.user_plan.data_fim) : 0;
            return <div key={user.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{user.nome}</h3>
                          {isUserSuperAdmin && <Crown className="h-4 w-4 text-yellow-500" />}
                        </div>
                        
                        {/* Cargo */}
                        {user.cargo && <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {user.cargo}
                            </Badge>
                          </div>}
                        
                        <p className="text-gray-600 mb-1">{user.email}</p>
                        
                        {/* Telefone */}
                        {user.telefone && <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              📞 {user.telefone}
                            </span>
                          </div>}
                        
                        <p className="text-sm text-gray-500">
                          Criado em: {format(new Date(user.created_at), 'dd/MM/yyyy')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Ativo:</span>
                        <Switch checked={user.ativo} onCheckedChange={() => handleToggleStatus(user.id, user.ativo)} disabled={updatingUsers.has(user.id)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Role Management */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <div className="flex items-center gap-2">
                          <Badge variant={getRoleBadgeVariant(user.user_roles[0]?.role || 'user')}>
                            {user.user_roles[0]?.role || 'user'}
                          </Badge>
                          <Select value={user.user_roles[0]?.role || 'user'} onValueChange={(value: UserRole) => handleRoleChange(user.id, value)} disabled={updatingUsers.has(user.id)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Plan Information */}
                      {!isUserSuperAdmin && <div className="space-y-2 bg-zinc-100 ">
                          <label className="text-sm font-medium">Plano</label>
                          {user.user_plan ? <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={getPlanBadgeVariant(user.user_plan.tipo_plano)}>
                                  {getPlanLabel(user.user_plan.tipo_plano)}
                                </Badge>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {remainingDays} dias restantes
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(user.user_plan.data_inicio), 'dd/MM/yyyy')} - {format(new Date(user.user_plan.data_fim), 'dd/MM/yyyy')}
                                </div>
                              </div>
                            </div> : <div className="text-sm text-gray-500">Sem plano ativo</div>}
                        </div>}

                      {/* Plan Management */}
                      {!isUserSuperAdmin && <div className="space-y-2">
                          <label className="text-sm font-medium">Gerenciar Plano</label>
                          <PlanEditDialog userId={user.id} currentPlan={user.user_plan} onUpdatePlan={onUpdatePlan} />
                        </div>}
                    </div>

                    {remainingDays <= 7 && remainingDays > 0 && !isUserSuperAdmin && <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Plano expira em {remainingDays} dias
                        </p>
                      </div>}

                    {remainingDays <= 0 && !isUserSuperAdmin && user.user_plan && <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">
                          🚨 Plano expirado há {Math.abs(remainingDays)} dias
                        </p>
                      </div>}
                  </div>;
          })}
            </div>}
        </CardContent>
      </Card>
    </div>;
};
export default UserManagement;