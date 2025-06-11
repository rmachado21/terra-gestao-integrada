
-- Primeiro, vamos ver os usuários existentes e suas roles atuais
-- Execute isso para ver os usuários disponíveis:
-- SELECT p.id, p.nome, p.email, ur.role 
-- FROM profiles p 
-- LEFT JOIN user_roles ur ON p.id = ur.user_id 
-- ORDER BY p.created_at;

-- Depois, substitua 'SEU_USER_ID_AQUI' pelo ID do usuário que você quer promover a Super Admin
-- Você pode pegar o ID do usuário logado atual ou de qualquer usuário da consulta acima

-- Exemplo: Para promover o usuário atual (você precisa substituir pelo ID real)
INSERT INTO public.user_roles (user_id, role, created_by) 
VALUES (
  -- Substitua pelo ID do usuário que você quer tornar Super Admin
  'bf20429c-e7ab-4339-badc-d54725c1ddc0', -- Este é o ID do renatomachado09@hotmail.com baseado nos logs
  'super_admin',
  'bf20429c-e7ab-4339-badc-d54725c1ddc0'
) 
ON CONFLICT (user_id, role) DO NOTHING;

-- Se você quiser promover outro usuário, use este formato:
-- INSERT INTO public.user_roles (user_id, role, created_by) 
-- VALUES ('ID_DO_USUARIO_AQUI', 'super_admin', 'ID_DO_USUARIO_ATUAL') 
-- ON CONFLICT (user_id, role) DO NOTHING;
