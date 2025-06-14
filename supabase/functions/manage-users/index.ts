import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserData {
  nome: string;
  email: string;
  ativo?: boolean;
}

interface PlanData {
  tipo_plano: 'mensal' | 'anual' | 'teste';
  data_inicio?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user has admin role
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid token')
    }

    // Check if user has admin or super_admin role
    const { data: userRoles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
    
    if (roleError) {
      throw new Error('Error checking user roles')
    }

    const hasAdminRole = userRoles?.some(r => r.role === 'admin' || r.role === 'super_admin')
    if (!hasAdminRole) {
      throw new Error('Insufficient permissions')
    }

    const { action, userData, userId, planData, targetUserId, active, newRole } = await req.json()

    switch (action) {
      case 'list_users': {
        console.log('Listing users...')
        
        // Get all users with their profiles, roles, and plans
        const { data: profiles, error: profilesError } = await supabaseClient
          .from('profiles')
          .select(`
            id,
            nome,
            email,
            ativo,
            created_at,
            user_roles (role),
            user_plans!inner (
              tipo_plano,
              data_inicio,
              data_fim,
              ativo
            )
          `)
          .eq('user_plans.ativo', true)

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError)
          throw profilesError
        }

        console.log('Users fetched successfully:', profiles?.length)
        return new Response(
          JSON.stringify(profiles || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'toggle_user_status': {
        console.log(`Toggling user ${targetUserId} status to ${active}`)
        
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ ativo: active })
          .eq('id', targetUserId)

        if (updateError) {
          throw updateError
        }

        // Log admin action
        await supabaseClient
          .from('admin_logs')
          .insert({
            admin_user_id: user.id,
            action: 'toggle_user_status',
            target_user_id: targetUserId,
            details: { ativo: active }
          })

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'change_user_role': {
        console.log(`Changing user ${targetUserId} role to ${newRole}`)
        
        // First, delete existing role
        await supabaseClient
          .from('user_roles')
          .delete()
          .eq('user_id', targetUserId)

        // Then insert new role
        const { error: roleError } = await supabaseClient
          .from('user_roles')
          .insert({
            user_id: targetUserId,
            role: newRole,
            created_by: user.id
          })

        if (roleError) {
          throw roleError
        }

        // Log admin action
        await supabaseClient
          .from('admin_logs')
          .insert({
            admin_user_id: user.id,
            action: 'change_user_role',
            target_user_id: targetUserId,
            details: { role: newRole }
          })

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_user_plan': {
        console.log('Updating user plan:', { targetUserId, planData })
        
        // First, deactivate existing plans
        await supabaseClient
          .from('user_plans')
          .update({ ativo: false })
          .eq('user_id', targetUserId)

        // Create new plan
        const { error: planError } = await supabaseClient
          .from('user_plans')
          .insert({
            user_id: targetUserId,
            tipo_plano: planData.tipo_plano,
            data_inicio: planData.data_inicio || new Date().toISOString().split('T')[0],
            ativo: true
          })

        if (planError) {
          console.error('Error updating user plan:', planError)
          throw planError
        }

        // Log admin action
        await supabaseClient
          .from('admin_logs')
          .insert({
            admin_user_id: user.id,
            action: 'update_user_plan',
            target_user_id: targetUserId,
            details: { tipo_plano: planData.tipo_plano, data_inicio: planData.data_inicio }
          })

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_admin_logs': {
        console.log('Fetching admin logs...')
        
        const { data: logs, error: logsError } = await supabaseClient
          .from('admin_logs')
          .select(`
            id,
            action,
            details,
            created_at,
            admin_profile:profiles!admin_user_id (nome),
            target_profile:profiles!target_user_id (nome)
          `)
          .order('created_at', { ascending: false })
          .limit(100)

        if (logsError) {
          throw logsError
        }

        return new Response(
          JSON.stringify(logs || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'create_user': {
        console.log('Creating user with data:', userData)
        
        // Create user in auth
        const { data: authData, error: createError } = await supabaseClient.auth.admin.createUser({
          email: userData.email,
          password: 'temp123456',
          email_confirm: true,
          user_metadata: {
            nome: userData.nome
          }
        })

        if (createError) {
          console.error('Error creating user:', createError)
          throw createError
        }

        if (!authData.user) {
          throw new Error('User creation failed')
        }

        console.log('Auth user created:', authData.user.id)

        // Create profile
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .insert({
            id: authData.user.id,
            nome: userData.nome,
            email: userData.email,
            ativo: userData.ativo ?? true
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
          throw profileError
        }

        // Create initial user role
        const { error: roleError2 } = await supabaseClient
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'user',
            created_by: user.id
          })

        if (roleError2) {
          console.error('Error creating user role:', roleError2)
        }

        // Create teste plan for new users (default 7 days)
        const { error: planError } = await supabaseClient
          .from('user_plans')
          .insert({
            user_id: authData.user.id,
            tipo_plano: 'teste',
            data_inicio: new Date().toISOString().split('T')[0]
          })

        if (planError) {
          console.error('Error creating user plan:', planError)
        }

        // Log admin action
        await supabaseClient
          .from('admin_logs')
          .insert({
            admin_user_id: user.id,
            action: 'create_user',
            target_user_id: authData.user.id,
            details: { email: userData.email, nome: userData.nome }
          })

        return new Response(
          JSON.stringify({ success: true, user: authData.user }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_user_status': {
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ ativo: userData.ativo })
          .eq('id', userId)

        if (updateError) {
          throw updateError
        }

        // Log admin action
        await supabaseClient
          .from('admin_logs')
          .insert({
            admin_user_id: user.id,
            action: 'update_user_status',
            target_user_id: userId,
            details: { ativo: userData.ativo }
          })

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_user_role': {
        // First, delete existing role
        await supabaseClient
          .from('user_roles')
          .delete()
          .eq('user_id', userId)

        // Then insert new role
        const { error: roleError3 } = await supabaseClient
          .from('user_roles')
          .insert({
            user_id: userId,
            role: userData.role,
            created_by: user.id
          })

        if (roleError3) {
          throw roleError3
        }

        // Log admin action
        await supabaseClient
          .from('admin_logs')
          .insert({
            admin_user_id: user.id,
            action: 'update_user_role',
            target_user_id: userId,
            details: { role: userData.role }
          })

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_user_plan': {
        console.log('Updating user plan:', { userId, planData })
        
        // First, deactivate existing plans
        await supabaseClient
          .from('user_plans')
          .update({ ativo: false })
          .eq('user_id', userId)

        // Create new plan
        const { error: planError2 } = await supabaseClient
          .from('user_plans')
          .insert({
            user_id: userId,
            tipo_plano: planData.tipo_plano,
            data_inicio: planData.data_inicio || new Date().toISOString().split('T')[0],
            ativo: true
          })

        if (planError2) {
          console.error('Error updating user plan:', planError2)
          throw planError2
        }

        // Log admin action
        await supabaseClient
          .from('admin_logs')
          .insert({
            admin_user_id: user.id,
            action: 'update_user_plan',
            target_user_id: userId,
            details: { tipo_plano: planData.tipo_plano, data_inicio: planData.data_inicio }
          })

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Error in manage-users function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
