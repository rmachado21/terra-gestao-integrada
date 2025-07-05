-- Adicionar role super_admin para o usuário atual (geraldo@email.com)
INSERT INTO public.user_roles (user_id, role, created_by)
SELECT 
    id, 
    'super_admin'::app_role,
    id
FROM auth.users 
WHERE email = 'geraldo@email.com'
ON CONFLICT (user_id, role) DO NOTHING;