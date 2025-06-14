
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const authenticateAndAuthorize = async (
  supabaseClient: SupabaseClient,
  authHeader: string | null
) => {
  if (!authHeader) {
    console.error('No authorization header provided');
    throw new Error('No authorization header');
  }

  // Verify the user has admin role
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
  
  if (authError || !user) {
    console.error('Authentication failed:', authError);
    throw new Error('Invalid token');
  }

  console.log('User authenticated:', user.id);

  // Check if user has admin or super_admin role
  const { data: userRoles, error: roleError } = await supabaseClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);
  
  if (roleError) {
    console.error('Error checking user roles:', roleError);
    throw new Error('Error checking user roles');
  }

  console.log('User roles:', userRoles);

  const hasAdminRole = userRoles?.some(r => r.role === 'admin' || r.role === 'super_admin');
  if (!hasAdminRole) {
    console.error('User does not have admin role. User roles:', userRoles);
    throw new Error('Insufficient permissions');
  }

  return user;
};
