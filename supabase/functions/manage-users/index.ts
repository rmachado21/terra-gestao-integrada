import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { authenticateAndAuthorize } from './auth.ts'
import { RequestBody } from './types.ts'
import {
  listUsers,
  toggleUserStatus,
  changeUserRole,
  updateUserPlan,
  createUser,
  getAdminLogs,
  updateUserStatus,
  updateUserRole,
  updateUserPlanById,
  resetUserPassword
} from './user-actions.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const user = await authenticateAndAuthorize(supabaseClient, authHeader)

    const { action, userData, userId, planData, targetUserId, active, newRole, newPassword }: RequestBody = await req.json()

    console.log('Processing action:', action)

    switch (action) {
      case 'list_users': {
        const users = await listUsers(supabaseClient)
        return new Response(
          JSON.stringify(users),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'toggle_user_status': {
        if (!targetUserId || active === undefined) {
          throw new Error('Missing required parameters')
        }
        const result = await toggleUserStatus(supabaseClient, targetUserId, active, user.id)
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'change_user_role': {
        if (!targetUserId || !newRole) {
          throw new Error('Missing required parameters')
        }
        const result = await changeUserRole(supabaseClient, targetUserId, newRole, user.id)
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_user_plan': {
        if (!targetUserId || !planData) {
          throw new Error('Missing required parameters')
        }
        const result = await updateUserPlan(supabaseClient, targetUserId, planData, user.id)
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_admin_logs': {
        const logs = await getAdminLogs(supabaseClient)
        return new Response(
          JSON.stringify(logs),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'create_user': {
        if (!userData) {
          throw new Error('Missing user data')
        }
        const result = await createUser(supabaseClient, userData, user.id)
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_user_status': {
        if (!userId || !userData) {
          throw new Error('Missing required parameters')
        }
        const result = await updateUserStatus(supabaseClient, userId, userData, user.id)
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_user_role': {
        if (!userId || !userData) {
          throw new Error('Missing required parameters')
        }
        const result = await updateUserRole(supabaseClient, userId, userData as any, user.id)
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'reset_user_password': {
        if (!targetUserId || !newPassword) {
          throw new Error('Missing required parameters')
        }
        const result = await resetUserPassword(supabaseClient, targetUserId, newPassword, user.id)
        return new Response(
          JSON.stringify(result),
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
