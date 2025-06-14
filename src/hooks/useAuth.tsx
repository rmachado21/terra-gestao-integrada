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
  checkSubscription: () => Promise<void>;
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

// Helper function to check if user should be redirected to subscription
const checkUserPlanStatus = async (userId: string) => {
  try {
    // Check if user has super admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'super_admin')
      .single();
    
    if (roleData) {
      return { shouldRedirect: false, isBlocked: false };
    }

    // Get user profile status
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('ativo')
      .eq('id', userId)
      .single();

    if (profileError) {
      return { shouldRedirect: false, isBlocked: true, reason: 'Erro ao verificar dados do usuário' };
    }

    // Get user plan status
    const { data: planData } = await supabase
      .from('user_plans')
      .select('tipo_plano, data_fim, ativo')
      .eq('user_id', userId)
      .eq('ativo', true)
      .single();

    const hasActivePlan = planData && new Date(planData.data_fim) > new Date();

    // If user is inactive in profile
    if (!profileData?.ativo) {
      // If user has no active plan or expired plan, redirect to subscription
      if (!hasActivePlan) {
        return { shouldRedirect: true, isBlocked: false };
      }
      // If user has active plan but is inactive, they are admin-disabled
      return { shouldRedirect: false, isBlocked: true, reason: 'Seu acesso está inativo. Entre em contato com o suporte.' };
    }

    // User is active in profile
    return { shouldRedirect: false, isBlocked: false };
  } catch (error) {
    secureLogger.error('Error checking user plan status:', error);
    return { shouldRedirect: false, isBlocked: true, reason: 'Erro ao verificar status do usuário' };
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!session) return;
    
    try {
      await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    } catch (error) {
      secureLogger.error('Error checking subscription:', error);
    }
  };

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
          
          // Verificar status do usuário e plano
          if (session?.user) {
            setTimeout(async () => {
              try {
                const planStatus = await checkUserPlanStatus(session.user.id);
                
                if (planStatus.isBlocked) {
                  secureLogger.security('user_blocked', { userId: session.user.id, reason: planStatus.reason });
                  await supabase.auth.signOut();
                  return;
                }

                if (planStatus.shouldRedirect) {
                  secureLogger.security('user_redirected_to_subscription', { userId: session.user.id });
                  setTimeout(() => {
                    window.location.href = '/subscription';
                  }, 100);
                  return;
                }

                // Check subscription after successful login
                await supabase.functions.invoke('check-subscription', {
                  headers: {
                    Authorization: `Bearer ${session.access_token}`,
                  },
                });
              } catch (error) {
                secureLogger.error('Error checking user status:', error);
              }
            }, 0);
          }
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
            
            // Verificar status do usuário e plano
            try {
              const planStatus = await checkUserPlanStatus(session.user.id);
              
              if (planStatus.isBlocked) {
                secureLogger.security('user_blocked_on_restore', { userId: session.user.id });
                await supabase.auth.signOut();
                setSession(null);
                setUser(null);
              } else if (planStatus.shouldRedirect) {
                secureLogger.security('user_redirected_to_subscription_on_restore', { userId: session.user.id });
                setTimeout(() => {
                  window.location.href = '/subscription';
                }, 100);
              } else {
                // Check subscription on session restore
                await supabase.functions.invoke('check-subscription', {
                  headers: {
                    Authorization: `Bearer ${session.access_token}`,
                  },
                });
              }
            } catch (error) {
              secureLogger.error('Error checking user status:', error);
            }
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

      // Verificar status do usuário e plano ANTES de completar o login
      if (data.user) {
        try {
          const planStatus = await checkUserPlanStatus(data.user.id);
          
          if (planStatus.isBlocked) {
            secureLogger.security('user_blocked_on_signin', { userId: data.user.id });
            await supabase.auth.signOut();
            return { error: { message: planStatus.reason || 'Acesso negado', code: 'USER_BLOCKED' } };
          }
          
          if (planStatus.shouldRedirect) {
            secureLogger.security('user_should_redirect_on_signin', { userId: data.user.id });
            setTimeout(() => {
              window.location.href = '/subscription';
            }, 100);
            return { error: null };
          }
        } catch (error) {
          secureLogger.error('Error checking user status on signin:', error);
          await supabase.auth.signOut();
          return { error: { message: 'Erro ao verificar status do usuário' } };
        }

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
      checkSubscription,
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
