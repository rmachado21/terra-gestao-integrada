
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
      console.log('Fetching users...');
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'list_users' }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Users fetched successfully:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários. Verifique se você tem permissões de Super Admin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const toggleUserStatus = useCallback(async (userId: string, active: boolean) => {
    try {
      console.log(`Toggling user ${userId} status to ${active}`);
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
      console.log(`Changing user ${userId} role to ${newRole}`);
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
      console.log('Fetching admin logs...');
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'get_admin_logs' }
      });

      if (error) throw error;
      console.log('Admin logs fetched successfully:', data);
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
