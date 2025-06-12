
-- Criar enum para tipos de plano
CREATE TYPE public.tipo_plano AS ENUM ('mensal', 'anual');

-- Criar tabela de planos de usuário
CREATE TABLE public.user_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_plano tipo_plano NOT NULL DEFAULT 'mensal',
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, ativo) -- Garante que só há um plano ativo por usuário
);

-- Habilitar RLS
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios planos
CREATE POLICY "Users can view their own plans" 
  ON public.user_plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para super admins gerenciarem todos os planos
CREATE POLICY "Super admins can manage all plans" 
  ON public.user_plans 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Função para calcular data de fim do plano
CREATE OR REPLACE FUNCTION public.calcular_data_fim_plano(data_inicio DATE, tipo tipo_plano)
RETURNS DATE
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN tipo = 'mensal' THEN data_inicio + INTERVAL '1 month'
    WHEN tipo = 'anual' THEN data_inicio + INTERVAL '1 year'
  END::DATE;
$$;

-- Trigger para calcular automaticamente a data_fim
CREATE OR REPLACE FUNCTION public.update_data_fim_plano()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.data_fim := public.calcular_data_fim_plano(NEW.data_inicio, NEW.tipo_plano);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_data_fim_plano
  BEFORE INSERT OR UPDATE ON public.user_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_data_fim_plano();

-- Inserir planos padrão para usuários existentes (exceto super_admin)
INSERT INTO public.user_plans (user_id, tipo_plano, data_inicio)
SELECT 
  p.id,
  'mensal'::tipo_plano,
  p.created_at::DATE
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id AND ur.role = 'super_admin'
WHERE ur.user_id IS NULL; -- Excluir super admins
