
-- Remover a política atual que causa conflito
DROP POLICY IF EXISTS "Super admins can manage all plans" ON public.user_plans;

-- Criar políticas específicas para super admins por operação
CREATE POLICY "Super admins can select all plans" 
  ON public.user_plans 
  FOR SELECT 
  USING (public.has_role((SELECT auth.uid()), 'super_admin'));

CREATE POLICY "Super admins can insert plans" 
  ON public.user_plans 
  FOR INSERT 
  WITH CHECK (public.has_role((SELECT auth.uid()), 'super_admin'));

CREATE POLICY "Super admins can update all plans" 
  ON public.user_plans 
  FOR UPDATE 
  USING (public.has_role((SELECT auth.uid()), 'super_admin'));

CREATE POLICY "Super admins can delete all plans" 
  ON public.user_plans 
  FOR DELETE 
  USING (public.has_role((SELECT auth.uid()), 'super_admin'));
