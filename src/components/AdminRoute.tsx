
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';

interface AdminRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

const AdminRoute = ({ children, requireSuperAdmin = false }: AdminRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isSuperAdmin, isAdmin, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();

  const loading = authLoading || rolesLoading;
  const hasAccess = requireSuperAdmin ? isSuperAdmin : isAdmin;

  useEffect(() => {
    if (!loading && (!user || !hasAccess)) {
      navigate('/');
    }
  }, [user, hasAccess, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasAccess) {
    return null;
  }

  return <>{children}</>;
};

export default AdminRoute;
