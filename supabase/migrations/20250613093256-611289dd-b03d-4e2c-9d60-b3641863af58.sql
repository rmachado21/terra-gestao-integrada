
-- Remover as políticas existentes que causam problemas de performance
DROP POLICY IF EXISTS "Users can view their own plans" ON public.user_plans;
DROP POLICY IF EXISTS "Super admins can manage all plans" ON public.user_plans;

-- Criar as políticas otimizadas com melhor performance
CREATE POLICY "Users can view their own plans" 
  ON public.user_plans 
  FOR SELECT 
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Super admins can manage all plans" 
  ON public.user_plans 
  FOR ALL 
  USING (public.has_role((SELECT auth.uid()), 'super_admin'));
