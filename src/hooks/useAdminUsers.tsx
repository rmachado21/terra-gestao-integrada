
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from './useUserRoles';

interface AdminUser {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  created_at: string;
  user_roles: { role: UserRole }[];
}

interface AdminLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
  admin_profile: { nome: string };
  target_profile: { nome: string } | null;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'list_users' }
      });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const toggleUserStatus = useCallback(async (userId: string, active: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { 
          action: 'toggle_user_status',
          targetUserId: userId,
          active
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Usuário ${active ? 'ativado' : 'desativado'} com sucesso`,
      });

      // Atualizar lista local
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ativo: active } : user
      ));

      return true;
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do usuário",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const changeUserRole = useCallback(async (userId: string, newRole: UserRole) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { 
          action: 'change_user_role',
          targetUserId: userId,
          newRole
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Role do usuário alterada com sucesso",
      });

      // Atualizar lista local
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, user_roles: [{ role: newRole }] }
          : user
      ));

      return true;
    } catch (error) {
      console.error('Error changing user role:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar role do usuário",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const fetchAdminLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'get_admin_logs' }
      });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar logs de auditoria",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    users,
    logs,
    loading,
    fetchUsers,
    toggleUserStatus,
    changeUserRole,
    fetchAdminLogs,
  };
};
