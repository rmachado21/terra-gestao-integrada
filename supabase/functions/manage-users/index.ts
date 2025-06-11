
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Verificar se o usuário é super_admin
    const { data: isSuperAdmin, error: roleError } = await supabase
      .rpc('is_super_admin')
    
    if (roleError || !isSuperAdmin) {
      throw new Error('Access denied: Super Admin required')
    }

    const { action, targetUserId, newRole, active } = await req.json()

    let result
    const logDetails: any = {}

    switch (action) {
      case 'list_users':
        // Buscar todos os profiles com suas roles (se existirem)
        const { data: users, error: listError } = await supabase
          .from('profiles')
          .select(`
            id,
            nome,
            email,
            ativo,
            created_at,
            user_roles(role)
          `)
          .order('created_at', { ascending: false })

        if (listError) {
          console.error('Error fetching users:', listError)
          throw listError
        }

        // Transformar os dados para garantir que sempre temos uma array de roles
        const transformedUsers = users.map(user => ({
          ...user,
          user_roles: user.user_roles.length > 0 ? user.user_roles : [{ role: 'user' }]
        }))

        console.log('Users fetched successfully:', transformedUsers.length)
        result = transformedUsers
        break

      case 'toggle_user_status':
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ ativo: active })
          .eq('id', targetUserId)

        if (updateError) throw updateError

        // Log da ação
        await supabase.from('admin_logs').insert({
          admin_user_id: user.id,
          target_user_id: targetUserId,
          action: active ? 'user_activated' : 'user_deactivated',
          details: { previous_status: !active, new_status: active }
        })

        result = { success: true }
        break

      case 'change_user_role':
        // Primeiro, remover role atual se existir
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', targetUserId)

        // Adicionar nova role
        const { error: roleUpdateError } = await supabase
          .from('user_roles')
          .insert({
            user_id: targetUserId,
            role: newRole,
            created_by: user.id
          })

        if (roleUpdateError) throw roleUpdateError

        // Log da ação
        await supabase.from('admin_logs').insert({
          admin_user_id: user.id,
          target_user_id: targetUserId,
          action: 'role_changed',
          details: { new_role: newRole }
        })

        result = { success: true }
        break

      case 'get_admin_logs':
        const { data: logs, error: logsError } = await supabase
          .from('admin_logs')
          .select(`
            *,
            admin_profile:profiles!admin_user_id(nome),
            target_profile:profiles!target_user_id(nome)
          `)
          .order('created_at', { ascending: false })
          .limit(100)

        if (logsError) throw logsError
        result = logs
        break

      default:
        throw new Error('Invalid action')
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in manage-users function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message.includes('Unauthorized') || error.message.includes('Access denied') ? 403 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
