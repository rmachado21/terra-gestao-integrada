
-- Remover tabela de tokens customizada já que vamos usar o sistema nativo do Supabase
DROP TABLE IF EXISTS public.password_reset_tokens;

-- Remover função de limpeza de tokens expirados
DROP FUNCTION IF EXISTS public.cleanup_expired_password_reset_tokens();
