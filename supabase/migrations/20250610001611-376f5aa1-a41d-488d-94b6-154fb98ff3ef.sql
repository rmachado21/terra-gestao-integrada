
-- Criar enum para roles do sistema
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'user');

-- Criar tabela para associar usuários a roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Adicionar campo ativo na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar se um usuário tem uma role específica (Security Definer para evitar recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Função para verificar se o usuário atual é super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin');
$$;

-- Função para verificar se o usuário atual está ativo
CREATE OR REPLACE FUNCTION public.is_user_active(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT ativo FROM public.profiles WHERE id = _user_id),
    false
  );
$$;

-- Políticas RLS para user_roles
CREATE POLICY "Super admins can view all user roles"
  ON public.user_roles FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "Super admins can manage user roles"
  ON public.user_roles FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Atualizar políticas da tabela profiles para incluir verificação de usuário ativo
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Active users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id AND public.is_user_active());

CREATE POLICY "Active users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id AND public.is_user_active());

CREATE POLICY "Super admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "Super admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_super_admin());

-- Trigger para criar role padrão quando um usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir role padrão de 'user' para novos usuários
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Criar trigger para automaticamente atribuir role 'user' a novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Tabela para logs de auditoria
CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view admin logs"
  ON public.admin_logs FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "Super admins can create admin logs"
  ON public.admin_logs FOR INSERT
  WITH CHECK (public.is_super_admin());
