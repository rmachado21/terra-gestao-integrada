
import { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isNavigating: boolean;
  setIsNavigating: (loading: boolean) => void;
  startNavigation: () => void;
  finishNavigation: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [isNavigating, setIsNavigating] = useState(false);

  const startNavigation = () => {
    setIsNavigating(true);
  };

  const finishNavigation = () => {
    // Add small delay to ensure smooth transition
    setTimeout(() => {
      setIsNavigating(false);
    }, 100);
  };

  return (
    <LoadingContext.Provider
      value={{
        isNavigating,
        setIsNavigating,
        startNavigation,
        finishNavigation,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};
