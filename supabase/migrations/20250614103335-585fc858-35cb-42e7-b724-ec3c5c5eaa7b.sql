
-- Corrigir avisos de segurança remanescentes: search_path mutável
-- Recriar todas as funções com problemas de search_path

-- 1. Corrigir função handle_new_user (SECURITY DEFINER sem search_path fixo)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', 'Admin'), NEW.email);
  RETURN NEW;
END;
$$;

-- 2. Corrigir função cleanup_expired_password_reset_tokens (SECURITY DEFINER sem search_path fixo)
CREATE OR REPLACE FUNCTION public.cleanup_expired_password_reset_tokens()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.password_reset_tokens 
  WHERE expires_at < now() OR used = true;
END;
$$;

-- 3. Recriar função update_updated_at_column (remover SECURITY DEFINER desnecessário)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 4. Recriar função verificar_estoque_baixo (remover SECURITY DEFINER desnecessário)
CREATE OR REPLACE FUNCTION public.verificar_estoque_baixo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.quantidade <= NEW.quantidade_minima AND NEW.quantidade_minima > 0 THEN
        INSERT INTO public.alertas (titulo, mensagem, tipo, prioridade, user_id)
        SELECT 
            'Estoque Baixo',
            'O produto ' || p.nome || ' está com estoque baixo (' || NEW.quantidade || ' ' || p.unidade_medida || ')',
            'estoque',
            CASE 
                WHEN NEW.quantidade = 0 THEN 'critica'::prioridade_alerta
                WHEN NEW.quantidade <= NEW.quantidade_minima * 0.5 THEN 'alta'::prioridade_alerta
                ELSE 'media'::prioridade_alerta
            END,
            NEW.user_id
        FROM public.produtos p 
        WHERE p.id = NEW.produto_id;
    END IF;
    
    RETURN NEW;
END;
$$;
