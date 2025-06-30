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
import PasswordResetDialog from './PasswordResetDialog';
import ImpersonationDialog from './ImpersonationDialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';

interface AdminUser {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cargo?: string;
  empresa_nome?: string;
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
  resetUserPassword: (userId: string, newPassword: string) => Promise<boolean>;
}

const UserManagement = ({
  users,
  loading,
  onToggleStatus,
  onChangeRole,
  onUpdatePlan,
  onRefresh,
  calculateRemainingDays,
  resetUserPassword
}: UserManagementProps) => {
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredUsers = users.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.empresa_nome && user.empresa_nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
      </div>;
  }

  return <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Gerenciamento de Usuários ({users.length})</span>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh} className="flex-shrink-0">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Buscar por nome, email ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {filteredUsers.length === 0 ? <div className="text-center py-8 text-gray-500">
              {users.length > 0 ? 'Nenhum usuário encontrado com o termo buscado.' : 'Nenhum usuário encontrado.'}
            </div> : (
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="min-w-[150px]">Role</TableHead>
                      <TableHead className="min-w-[220px]">Plano</TableHead>
                      <TableHead className="min-w-[200px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(user => {
                      const isUserSuperAdmin = isSuperAdmin(user.user_roles);
                      const remainingDays = user.user_plan ? calculateRemainingDays(user.user_plan.data_fim) : 0;
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="font-medium flex items-center gap-2">
                              <Link 
                                to={`/admin/users/${user.id}/edit`}
                                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                              >
                                {user.nome}
                              </Link>
                              {isUserSuperAdmin && <Crown className="h-4 w-4 text-yellow-500" />}
                            </div>
                            {user.empresa_nome && <div className="text-sm text-muted-foreground">{user.empresa_nome}</div>}
                            {user.telefone && <div className="text-sm text-muted-foreground">{user.telefone}</div>}
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={user.ativo} 
                                onCheckedChange={() => handleToggleStatus(user.id, user.ativo)} 
                                disabled={updatingUsers.has(user.id)} 
                              />
                              <span className="text-sm">{user.ativo ? 'Ativo' : 'Inativo'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
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
                          </TableCell>
                          <TableCell>
                            {!isUserSuperAdmin ? (
                              user.user_plan ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={getPlanBadgeVariant(user.user_plan.tipo_plano)}>
                                      {getPlanLabel(user.user_plan.tipo_plano)}
                                    </Badge>
                                    <span className={`text-xs flex items-center gap-1 ${remainingDays <= 7 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                                      <Clock className="h-3 w-3" />
                                      {remainingDays} dias restantes
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {format(new Date(user.user_plan.data_inicio), 'dd/MM/yy')} - {format(new Date(user.user_plan.data_fim), 'dd/MM/yy')}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">Sem plano</div>
                              )
                            ) : (
                              <Badge variant="secondary">N/A</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {!isUserSuperAdmin && (
                                <>
                                  <PlanEditDialog userId={user.id} currentPlan={user.user_plan} onUpdatePlan={onUpdatePlan} />
                                  <ImpersonationDialog 
                                    user={{
                                      id: user.id,
                                      nome: user.nome,
                                      email: user.email,
                                      empresa_nome: user.empresa_nome
                                    }}
                                  />
                                </>
                              )}
                              <PasswordResetDialog
                                userId={user.id}
                                userName={user.nome}
                                onResetPassword={resetUserPassword}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )
          }
        </CardContent>
      </Card>
    </div>;
};

export default UserManagement;
