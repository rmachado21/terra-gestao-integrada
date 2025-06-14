
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '@/contexts/LoadingContext';
import { LoadingSpinner } from '@/components/ui/loading';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const { isNavigating, finishNavigation } = useLoading();
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Reset visibility on route change
    setIsVisible(false);
    
    // Small delay to allow exit animation, then show new content
    const timer = setTimeout(() => {
      setIsVisible(true);
      finishNavigation();
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname, finishNavigation]);

  if (isNavigating) {
    return (
      <div className="min-h-[400px] flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Carregando página...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-300 ${
        isVisible 
          ? 'animate-page-enter opacity-100' 
          : 'opacity-0'
      }`}
    >
      {children}
    </div>
  );
};

export default PageTransition;
