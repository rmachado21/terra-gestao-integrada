
-- Corrigir o aviso de segurança: Function public.is_super_admin has a role mutable search_path
-- Recriar todas as funções SECURITY DEFINER com search_path fixo

-- 1. Recriar função has_role com search_path seguro
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 2. Recriar função is_super_admin com search_path seguro
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin');
$$;

-- 3. Recriar função is_user_active com search_path seguro
CREATE OR REPLACE FUNCTION public.is_user_active(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT ativo FROM public.profiles WHERE id = _user_id),
    false
  );
$$;

-- 4. Recriar função handle_new_user_role com search_path seguro
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Inserir role padrão de 'user' para novos usuários
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;
