
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/lib/security';
import { AuthContext } from './auth/authContext';
import { useAuthContext } from './auth/authContext';
import { cleanupAuthState, checkSubscription } from './auth/authUtils';
import { checkUserPlanStatus } from './auth/planStatusChecker';
import { signIn as authSignIn, signUp as authSignUp, signOut as authSignOut } from './auth/authActions';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const handleCheckSubscription = async () => {
    await checkSubscription(session);
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
                await checkSubscription(session);
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
                await checkSubscription(session);
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

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn: authSignIn,
      signUp: authSignUp,
      signOut: authSignOut,
      checkSubscription: handleCheckSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = useAuthContext;
