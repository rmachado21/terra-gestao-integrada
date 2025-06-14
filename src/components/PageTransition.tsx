
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Start transition on route change
    setIsLoading(true);
    setIsVisible(false);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsVisible(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isLoading) {
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
