
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUser } from './useEffectiveUser';

interface DashboardStats {
  totalAreas: number;
  totalPlantios: number;
  totalColheitas: number;
  totalEstoque: number;
}

interface RecentActivity {
  id: string;
  type: 'plantio' | 'colheita' | 'venda' | 'estoque';
  description: string;
  date: string;
}

export const useDashboardData = () => {
  const { user } = useEffectiveUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalAreas: 0,
    totalPlantios: 0,
    totalColheitas: 0,
    totalEstoque: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch stats
        const [areasResponse, plantiosResponse, colheitasResponse, estoqueResponse] = await Promise.all([
          supabase.from('areas').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('plantios').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('colheitas').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('estoque').select('id', { count: 'exact' }).eq('user_id', user.id),
        ]);

        setStats({
          totalAreas: areasResponse.count || 0,
          totalPlantios: plantiosResponse.count || 0,
          totalColheitas: colheitasResponse.count || 0,
          totalEstoque: estoqueResponse.count || 0,
        });

        // Fetch recent activities (simplified version)
        const activities: RecentActivity[] = [
          {
            id: '1',
            type: 'plantio',
            description: 'Novo plantio de tomates na Área Norte',
            date: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'colheita',
            description: 'Colheita de 150kg de batatas',
            date: new Date(Date.now() - 86400000).toISOString(),
          },
        ];

        setRecentActivities(activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  return {
    stats,
    recentActivities,
    loading,
  };
};
