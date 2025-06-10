
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { UserCheck, UserX, Shield, User, Crown, RefreshCw, Search } from 'lucide-react';
import { UserRole } from '@/hooks/useUserRoles';
import { format } from 'date-fns';

interface AdminUser {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  created_at: string;
  user_roles: { role: UserRole }[];
}

interface UserManagementProps {
  users: AdminUser[];
  loading: boolean;
  onToggleStatus: (userId: string, active: boolean) => Promise<boolean>;
  onChangeRole: (userId: string, newRole: UserRole) => Promise<boolean>;
  onRefresh: () => void;
}

const UserManagement = ({ users, loading, onToggleStatus, onChangeRole, onRefresh }: UserManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const userRole = user.user_roles[0]?.role || 'user';
    const matchesRole = roleFilter === 'all' || userRole === roleFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.ativo) ||
                         (statusFilter === 'inactive' && !user.ativo);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
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

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      default:
        return 'Usuário';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filtros</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando usuários...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Nenhum usuário encontrado com os filtros aplicados.
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => {
            const userRole = user.user_roles[0]?.role || 'user';
            
            return (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{user.nome}</h3>
                        <Badge 
                          variant={getRoleBadgeVariant(userRole)}
                          className="flex items-center gap-1"
                        >
                          {getRoleIcon(userRole)}
                          {getRoleLabel(userRole)}
                        </Badge>
                        <Badge variant={user.ativo ? 'default' : 'secondary'}>
                          {user.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-1">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        Criado em: {format(new Date(user.created_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <Select
                        value={userRole}
                        onValueChange={(newRole: UserRole) => onChangeRole(user.id, newRole)}
                        disabled={userRole === 'super_admin'}
                      >
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant={user.ativo ? "destructive" : "default"}
                        size="sm"
                        onClick={() => onToggleStatus(user.id, !user.ativo)}
                        disabled={userRole === 'super_admin'}
                        className="flex items-center gap-2"
                      >
                        {user.ativo ? (
                          <>
                            <UserX className="h-4 w-4" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4" />
                            Ativar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserManagement;
