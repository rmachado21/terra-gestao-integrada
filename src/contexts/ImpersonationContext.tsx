
import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';

interface ImpersonatedUser extends User {
  nome?: string;
  empresa_nome?: string;
}

interface ImpersonationContextType {
  impersonatedUser: ImpersonatedUser | null;
  originalUser: User | null;
  isImpersonating: boolean;
  startImpersonation: (user: ImpersonatedUser, original: User) => void;
  stopImpersonation: () => void;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

export const ImpersonationProvider = ({ children }: { children: ReactNode }) => {
  const [impersonatedUser, setImpersonatedUser] = useState<ImpersonatedUser | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);

  const startImpersonation = (user: ImpersonatedUser, original: User) => {
    setImpersonatedUser(user);
    setOriginalUser(original);
  };

  const stopImpersonation = () => {
    setImpersonatedUser(null);
    setOriginalUser(null);
  };

  return (
    <ImpersonationContext.Provider
      value={{
        impersonatedUser,
        originalUser,
        isImpersonating: !!impersonatedUser,
        startImpersonation,
        stopImpersonation,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
};

export const useImpersonation = () => {
  const context = useContext(ImpersonationContext);
  if (context === undefined) {
    throw new Error('useImpersonation must be used within an ImpersonationProvider');
  }
  return context;
};
