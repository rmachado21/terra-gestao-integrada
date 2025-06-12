
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

    console.log('Authenticated user:', user.id, user.email)

    // Verificar se o usuário é super_admin diretamente na tabela user_roles
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .single()
    
    if (roleError || !userRoles) {
      console.log('User is not super admin:', user.email)
      throw new Error('Access denied: Super Admin required')
    }

    console.log('Super admin verified:', user.email)

    const { action, targetUserId, newRole, active } = await req.json()

    let result
    const logDetails: any = {}

    switch (action) {
      case 'list_users':
        console.log('Fetching all users...')
        
        // Buscar todos os profiles primeiro
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nome, email, ativo, created_at')
          .order('created_at', { ascending: false })

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError)
          throw profilesError
        }

        console.log('Profiles fetched:', profiles?.length || 0)

        // Buscar todas as roles dos usuários
        const { data: allRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role')

        if (rolesError) {
          console.error('Error fetching roles:', rolesError)
          throw rolesError
        }

        console.log('Roles fetched:', allRoles?.length || 0)

        // Combinar os dados
        const transformedUsers = profiles.map(profile => {
          const userRoles = allRoles?.filter(role => role.user_id === profile.id) || []
          return {
            ...profile,
            user_roles: userRoles.length > 0 ? userRoles.map(r => ({ role: r.role })) : [{ role: 'user' }]
          }
        })

        console.log('Users transformed successfully:', transformedUsers.length)
        result = transformedUsers
        break

      case 'toggle_user_status':
        console.log(`Toggling user ${targetUserId} status to ${active}`)
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
        console.log(`Changing user ${targetUserId} role to ${newRole}`)
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
        console.log('Fetching admin logs...')
        
        // Buscar logs primeiro
        const { data: logs, error: logsError } = await supabase
          .from('admin_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)

        if (logsError) throw logsError

        // Buscar profiles para os logs
        const adminIds = [...new Set(logs.map(log => log.admin_user_id).filter(Boolean))]
        const targetIds = [...new Set(logs.map(log => log.target_user_id).filter(Boolean))]
        const allIds = [...new Set([...adminIds, ...targetIds])]

        const { data: logProfiles, error: logProfilesError } = await supabase
          .from('profiles')
          .select('id, nome')
          .in('id', allIds)

        if (logProfilesError) throw logProfilesError

        // Combinar dados dos logs com profiles
        const enrichedLogs = logs.map(log => ({
          ...log,
          admin_profile: logProfiles.find(p => p.id === log.admin_user_id) ? { nome: logProfiles.find(p => p.id === log.admin_user_id)?.nome } : null,
          target_profile: logProfiles.find(p => p.id === log.target_user_id) ? { nome: logProfiles.find(p => p.id === log.target_user_id)?.nome } : null
        }))

        result = enrichedLogs
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
