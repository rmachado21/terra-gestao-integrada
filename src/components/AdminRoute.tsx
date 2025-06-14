
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { LoadingSpinner } from '@/components/ui/loading';

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
      <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4 text-green-600" />
          <p className="text-gray-600 mt-2">Verificando permissões...</p>
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
