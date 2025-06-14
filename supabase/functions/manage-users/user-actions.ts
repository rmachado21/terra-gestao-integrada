
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { UserData, PlanData } from './types.ts';

export const listUsers = async (supabaseClient: SupabaseClient) => {
  console.log('Listing users...');
  
  // Get all users with their profiles and roles (LEFT JOIN to include users without plans)
  const { data: profiles, error: profilesError } = await supabaseClient
    .from('profiles')
    .select(`
      id,
      nome,
      email,
      ativo,
      created_at,
      user_roles (role),
      user_plans (
        tipo_plano,
        data_inicio,
        data_fim,
        ativo
      )
    `);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    throw profilesError;
  }

  // Filter to only show active plans for each user (if they have any)
  const processedUsers = profiles?.map(profile => ({
    ...profile,
    user_plan: profile.user_plans?.find(plan => plan.ativo) || null
  })) || [];

  console.log('Users fetched successfully:', processedUsers?.length);
  return processedUsers;
};

export const toggleUserStatus = async (
  supabaseClient: SupabaseClient,
  targetUserId: string,
  active: boolean,
  adminUserId: string
) => {
  console.log(`Toggling user ${targetUserId} status to ${active}`);
  
  const { error: updateError } = await supabaseClient
    .from('profiles')
    .update({ ativo: active })
    .eq('id', targetUserId);

  if (updateError) {
    throw updateError;
  }

  // Log admin action
  await supabaseClient
    .from('admin_logs')
    .insert({
      admin_user_id: adminUserId,
      action: 'toggle_user_status',
      target_user_id: targetUserId,
      details: { ativo: active }
    });

  return { success: true };
};

export const changeUserRole = async (
  supabaseClient: SupabaseClient,
  targetUserId: string,
  newRole: string,
  adminUserId: string
) => {
  console.log(`Changing user ${targetUserId} role to ${newRole}`);
  
  // First, delete existing role
  await supabaseClient
    .from('user_roles')
    .delete()
    .eq('user_id', targetUserId);

  // Then insert new role
  const { error: roleError } = await supabaseClient
    .from('user_roles')
    .insert({
      user_id: targetUserId,
      role: newRole,
      created_by: adminUserId
    });

  if (roleError) {
    throw roleError;
  }

  // Log admin action
  await supabaseClient
    .from('admin_logs')
    .insert({
      admin_user_id: adminUserId,
      action: 'change_user_role',
      target_user_id: targetUserId,
      details: { role: newRole }
    });

  return { success: true };
};

export const updateUserPlan = async (
  supabaseClient: SupabaseClient,
  targetUserId: string,
  planData: PlanData,
  adminUserId: string
) => {
  console.log('Updating user plan:', { targetUserId, planData });
  
  // First, deactivate existing plans
  await supabaseClient
    .from('user_plans')
    .update({ ativo: false })
    .eq('user_id', targetUserId);

  // Create new plan
  const { error: planError } = await supabaseClient
    .from('user_plans')
    .insert({
      user_id: targetUserId,
      tipo_plano: planData.tipo_plano,
      data_inicio: planData.data_inicio || new Date().toISOString().split('T')[0],
      ativo: true
    });

  if (planError) {
    console.error('Error updating user plan:', planError);
    throw planError;
  }

  // Log admin action
  await supabaseClient
    .from('admin_logs')
    .insert({
      admin_user_id: adminUserId,
      action: 'update_user_plan',
      target_user_id: targetUserId,
      details: { tipo_plano: planData.tipo_plano, data_inicio: planData.data_inicio }
    });

  return { success: true };
};

export const createUser = async (
  supabaseClient: SupabaseClient,
  userData: UserData,
  adminUserId: string
) => {
  console.log('Creating user with data:', userData);
  
  // Create user in auth
  const { data: authData, error: createError } = await supabaseClient.auth.admin.createUser({
    email: userData.email,
    password: 'temp123456',
    email_confirm: true,
    user_metadata: {
      nome: userData.nome
    }
  });

  if (createError) {
    console.error('Error creating user:', createError);
    throw createError;
  }

  if (!authData.user) {
    throw new Error('User creation failed');
  }

  console.log('Auth user created:', authData.user.id);

  // Create profile
  const { error: profileError } = await supabaseClient
    .from('profiles')
    .insert({
      id: authData.user.id,
      nome: userData.nome,
      email: userData.email,
      ativo: userData.ativo ?? true
    });

  if (profileError) {
    console.error('Error creating profile:', profileError);
    throw profileError;
  }

  // Create initial user role
  const { error: roleError2 } = await supabaseClient
    .from('user_roles')
    .insert({
      user_id: authData.user.id,
      role: 'user',
      created_by: adminUserId
    });

  if (roleError2) {
    console.error('Error creating user role:', roleError2);
  }

  // Create teste plan for new users (default 7 days)
  const { error: planError } = await supabaseClient
    .from('user_plans')
    .insert({
      user_id: authData.user.id,
      tipo_plano: 'teste',
      data_inicio: new Date().toISOString().split('T')[0]
    });

  if (planError) {
    console.error('Error creating user plan:', planError);
  }

  // Log admin action
  await supabaseClient
    .from('admin_logs')
    .insert({
      admin_user_id: adminUserId,
      action: 'create_user',
      target_user_id: authData.user.id,
      details: { email: userData.email, nome: userData.nome }
    });

  return { success: true, user: authData.user };
};

export const getAdminLogs = async (supabaseClient: SupabaseClient) => {
  console.log('Fetching admin logs...');
  
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
    .limit(100);

  if (logsError) {
    throw logsError;
  }

  return logs || [];
};

export const updateUserStatus = async (
  supabaseClient: SupabaseClient,
  userId: string,
  userData: UserData,
  adminUserId: string
) => {
  const { error: updateError } = await supabaseClient
    .from('profiles')
    .update({ ativo: userData.ativo })
    .eq('id', userId);

  if (updateError) {
    throw updateError;
  }

  // Log admin action
  await supabaseClient
    .from('admin_logs')
    .insert({
      admin_user_id: adminUserId,
      action: 'update_user_status',
      target_user_id: userId,
      details: { ativo: userData.ativo }
    });

  return { success: true };
};

export const updateUserRole = async (
  supabaseClient: SupabaseClient,
  userId: string,
  userData: UserData & { role: string },
  adminUserId: string
) => {
  // First, delete existing role
  await supabaseClient
    .from('user_roles')
    .delete()
    .eq('user_id', userId);

  // Then insert new role
  const { error: roleError3 } = await supabaseClient
    .from('user_roles')
    .insert({
      user_id: userId,
      role: userData.role,
      created_by: adminUserId
    });

  if (roleError3) {
    throw roleError3;
  }

  // Log admin action
  await supabaseClient
    .from('admin_logs')
    .insert({
      admin_user_id: adminUserId,
      action: 'update_user_role',
      target_user_id: userId,
      details: { role: userData.role }
    });

  return { success: true };
};

export const updateUserPlanById = async (
  supabaseClient: SupabaseClient,
  userId: string,
  planData: PlanData,
  adminUserId: string
) => {
  console.log('Updating user plan:', { userId, planData });
  
  // First, deactivate existing plans
  await supabaseClient
    .from('user_plans')
    .update({ ativo: false })
    .eq('user_id', userId);

  // Create new plan
  const { error: planError2 } = await supabaseClient
    .from('user_plans')
    .insert({
      user_id: userId,
      tipo_plano: planData.tipo_plano,
      data_inicio: planData.data_inicio || new Date().toISOString().split('T')[0],
      ativo: true
    });

  if (planError2) {
    console.error('Error updating user plan:', planError2);
    throw planError2;
  }

  // Log admin action
  await supabaseClient
    .from('admin_logs')
    .insert({
      admin_user_id: adminUserId,
      action: 'update_user_plan',
      target_user_id: userId,
      details: { tipo_plano: planData.tipo_plano, data_inicio: planData.data_inicio }
    });

  return { success: true };
};
