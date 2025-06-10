
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Shield, ShieldCheck, UserX, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { UserRole } from '@/hooks/useUserRoles';
import UserManagement from '@/components/admin/UserManagement';
import AdminLogs from '@/components/admin/AdminLogs';

const UsersPage = () => {
  const navigate = useNavigate();
  const { users, logs, loading, fetchUsers, toggleUserStatus, changeUserRole, fetchAdminLogs } = useAdminUsers();
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');

  useEffect(() => {
    fetchUsers();
    fetchAdminLogs();
  }, [fetchUsers, fetchAdminLogs]);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              Administração de Usuários
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Gerencie usuários e permissões do sistema
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="h-4 w-4" />
          Usuários
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'logs'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Logs de Auditoria
        </button>
      </div>

      {/* Content */}
      {activeTab === 'users' ? (
        <UserManagement
          users={users}
          loading={loading}
          onToggleStatus={toggleUserStatus}
          onChangeRole={changeUserRole}
          onRefresh={fetchUsers}
        />
      ) : (
        <AdminLogs logs={logs} onRefresh={fetchAdminLogs} />
      )}
    </div>
  );
};

export default UsersPage;
