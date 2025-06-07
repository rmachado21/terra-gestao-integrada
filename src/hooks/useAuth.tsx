
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/lib/security';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, nome: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função para limpar estado de autenticação
const cleanupAuthState = () => {
  try {
    // Remove tokens do localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove tokens do sessionStorage se existir
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    secureLogger.error('Erro ao limpar estado de autenticação:', error);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Configurar listener de estado de autenticação primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        secureLogger.info('Auth state change:', { event, email: session?.user?.email });

        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (event === 'SIGNED_OUT') {
            cleanupAuthState();
            secureLogger.security('user_signed_out');
          }
        }

        if (event === 'SIGNED_IN') {
          secureLogger.security('user_signed_in', { 
            userId: session?.user?.id,
            email: session?.user?.email 
          });
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Verificar sessão existente
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          secureLogger.error('Erro ao obter sessão:', error);
          cleanupAuthState();
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          if (session) {
            secureLogger.security('session_restored', { userId: session.user.id });
          }
        }
      } catch (error) {
        secureLogger.error('Erro na inicialização da autenticação:', error);
        cleanupAuthState();
        setSession(null);
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Limpar estado antes de fazer login
      cleanupAuthState();
      
      // Tentar logout global primeiro
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continuar mesmo se o logout falhar
        secureLogger.info('Logout preventivo falhou, continuando...');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        secureLogger.security('signin_failed', { email, error: error.message });
        return { error };
      }

      // Forçar atualização da página para garantir estado limpo
      if (data.user) {
        secureLogger.security('signin_success', { userId: data.user.id, email });
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }

      return { error: null };
    } catch (error) {
      secureLogger.error('Erro no signIn:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, nome: string) => {
    try {
      cleanupAuthState();
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        secureLogger.security('signup_failed', { email, error: error.message });
      } else {
        secureLogger.security('signup_success', { email });
      }

      return { error };
    } catch (error) {
      secureLogger.error('Erro no signUp:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      secureLogger.security('signout_initiated');
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        secureLogger.info('Erro no logout, continuando...');
      }
      
      // Forçar redirecionamento
      window.location.href = '/auth';
    } catch (error) {
      secureLogger.error('Erro no signOut:', error);
      // Mesmo com erro, redirecionar
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
