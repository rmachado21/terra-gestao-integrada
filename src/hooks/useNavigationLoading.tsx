
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '@/contexts/LoadingContext';

export const useNavigationLoading = () => {
  const { startNavigation } = useLoading();
  const location = useLocation();

  useEffect(() => {
    // Start navigation loading on route change
    startNavigation();
  }, [location.pathname, startNavigation]);

  return null;
};
