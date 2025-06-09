
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/lib/security';
import { cleanupAuthState } from '@/lib/authUtils';

export const useAuthState = () => {
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

  return { user, session, loading, setUser, setSession, setLoading };
};
