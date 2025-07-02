-- Correções de segurança recomendadas pelo Security Advisor
-- Corrigir funções com search_path mutável para prevenir ataques de injeção

-- 1. Corrigir função calcular_data_fim_plano
CREATE OR REPLACE FUNCTION public.calcular_data_fim_plano(data_inicio date, tipo tipo_plano)
RETURNS date
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $function$
  SELECT CASE 
    WHEN tipo = 'mensal' THEN data_inicio + INTERVAL '1 month'
    WHEN tipo = 'anual' THEN data_inicio + INTERVAL '1 year'
  END::DATE;
$function$;

-- 2. Corrigir função update_data_fim_plano
CREATE OR REPLACE FUNCTION public.update_data_fim_plano()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.data_fim := public.calcular_data_fim_plano(NEW.data_inicio, NEW.tipo_plano);
  RETURN NEW;
END;
$function$;

-- 3. Corrigir função calcular_total_pedido
CREATE OR REPLACE FUNCTION public.calcular_total_pedido()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
    UPDATE public.pedidos 
    SET valor_total = (
        SELECT COALESCE(SUM(subtotal), 0) 
        FROM public.itens_pedido 
        WHERE pedido_id = COALESCE(NEW.pedido_id, OLD.pedido_id)
    )
    WHERE id = COALESCE(NEW.pedido_id, OLD.pedido_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 4. Corrigir função verificar_estoque_baixo
CREATE OR REPLACE FUNCTION public.verificar_estoque_baixo()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
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
$function$;

-- 5. Corrigir função update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$;