import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { UserData, PlanData } from './types.ts';

export const listUsers = async (supabaseClient: SupabaseClient) => {
  console.log('Listing users...');
  
  try {
    // Get all profiles first
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      console.log('No profiles found');
      return [];
    }

    console.log('Found profiles:', profiles.length);

    // Get user roles for all users
    const { data: userRoles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      throw rolesError;
    }

    console.log('Found user roles:', userRoles?.length || 0);

    // Get user plans for all users
    const { data: userPlans, error: plansError } = await supabaseClient
      .from('user_plans')
      .select('user_id, tipo_plano, data_inicio, data_fim, ativo')
      .eq('ativo', true);

    if (plansError) {
      console.error('Error fetching user plans:', plansError);
      throw plansError;
    }

    console.log('Found active user plans:', userPlans?.length || 0);

    // Combine the data manually
    const processedUsers = profiles.map(profile => {
      // Find roles for this user
      const roles = userRoles?.filter(role => role.user_id === profile.id) || [];
      
      // Find active plan for this user
      const activePlan = userPlans?.find(plan => plan.user_id === profile.id) || null;

      return {
        ...profile,
        user_roles: roles.map(role => ({ role: role.role })),
        user_plan: activePlan
      };
    });

    console.log('Users processed successfully:', processedUsers.length);
    return processedUsers;

  } catch (error) {
    console.error('Error in listUsers:', error);
    throw error;
  }
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
  
  // Map 'teste' to 'mensal' since 'teste' doesn't exist in the database enum
  const mappedPlanType = planData.tipo_plano === 'teste' ? 'mensal' : planData.tipo_plano;
  
  try {
    // First, delete all existing plans for this user to avoid unique constraint issues
    const { error: deleteError } = await supabaseClient
      .from('user_plans')
      .delete()
      .eq('user_id', targetUserId);

    if (deleteError) {
      console.error('Error deleting existing plans:', deleteError);
      throw deleteError;
    }

    console.log('Successfully deleted existing plans for user:', targetUserId);

    // Calculate end date based on plan type
    const startDate = planData.data_inicio || new Date().toISOString().split('T')[0];
    let endDate: string;
    
    if (planData.tipo_plano === 'teste') {
      // For teste plans, add 7 days
      const start = new Date(startDate);
      start.setDate(start.getDate() + 7);
      endDate = start.toISOString().split('T')[0];
    } else if (mappedPlanType === 'mensal') {
      // For monthly plans, add 1 month
      const start = new Date(startDate);
      start.setMonth(start.getMonth() + 1);
      endDate = start.toISOString().split('T')[0];
    } else {
      // For annual plans, add 1 year
      const start = new Date(startDate);
      start.setFullYear(start.getFullYear() + 1);
      endDate = start.toISOString().split('T')[0];
    }

    // Create new plan with calculated end date
    const { error: planError } = await supabaseClient
      .from('user_plans')
      .insert({
        user_id: targetUserId,
        tipo_plano: mappedPlanType,
        data_inicio: startDate,
        data_fim: endDate,
        ativo: true
      });

    if (planError) {
      console.error('Error creating user plan:', planError);
      throw planError;
    }

    console.log('Successfully created new plan for user:', targetUserId);

    // Log admin action with original plan type
    await supabaseClient
      .from('admin_logs')
      .insert({
        admin_user_id: adminUserId,
        action: 'update_user_plan',
        target_user_id: targetUserId,
        details: { tipo_plano: planData.tipo_plano, data_inicio: startDate, data_fim: endDate }
      });

    return { success: true };
  } catch (error) {
    console.error('Error in updateUserPlan:', error);
    throw error;
  }
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
  const { error: roleError } = await supabaseClient
    .from('user_roles')
    .insert({
      user_id: authData.user.id,
      role: 'user',
      created_by: adminUserId
    });

  if (roleError) {
    console.error('Error creating user role:', roleError);
  }

  // Create mensal plan for new users (mapped from teste, 7 days duration)
  const startDate = new Date().toISOString().split('T')[0];
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);
  const endDateStr = endDate.toISOString().split('T')[0];

  const { error: planError } = await supabaseClient
    .from('user_plans')
    .insert({
      user_id: authData.user.id,
      tipo_plano: 'mensal', // Use mensal instead of teste
      data_inicio: startDate,
      data_fim: endDateStr
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
  
  try {
    // Get admin logs first
    const { data: logs, error: logsError } = await supabaseClient
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (logsError) {
      console.error('Error fetching admin logs:', logsError);
      throw logsError;
    }

    if (!logs || logs.length === 0) {
      console.log('No admin logs found');
      return [];
    }

    // Get profile names for admin users and target users
    const adminUserIds = [...new Set(logs.map(log => log.admin_user_id))];
    const targetUserIds = [...new Set(logs.map(log => log.target_user_id).filter(Boolean))];
    const allUserIds = [...new Set([...adminUserIds, ...targetUserIds])];

    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, nome')
      .in('id', allUserIds);

    if (profilesError) {
      console.error('Error fetching profiles for logs:', profilesError);
      // Continue without profile names rather than failing
    }

    // Map logs with profile names
    const logsWithProfiles = logs.map(log => {
      const adminProfile = profiles?.find(p => p.id === log.admin_user_id);
      const targetProfile = profiles?.find(p => p.id === log.target_user_id);

      return {
        ...log,
        admin_profile: adminProfile ? { nome: adminProfile.nome } : { nome: 'Unknown' },
        target_profile: targetProfile ? { nome: targetProfile.nome } : null
      };
    });

    console.log('Admin logs fetched successfully:', logsWithProfiles.length);
    return logsWithProfiles;

  } catch (error) {
    console.error('Error in getAdminLogs:', error);
    throw error;
  }
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
  const { error: roleError } = await supabaseClient
    .from('user_roles')
    .insert({
      user_id: userId,
      role: userData.role,
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
  console.log('Updating user plan by ID:', { userId, planData });
  
  // Map 'teste' to 'mensal' since 'teste' doesn't exist in the database enum
  const mappedPlanType = planData.tipo_plano === 'teste' ? 'mensal' : planData.tipo_plano;
  
  try {
    // First, delete all existing plans for this user to avoid unique constraint issues
    const { error: deleteError } = await supabaseClient
      .from('user_plans')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting existing plans:', deleteError);
      throw deleteError;
    }

    console.log('Successfully deleted existing plans for user:', userId);

    // Calculate end date based on plan type
    const startDate = planData.data_inicio || new Date().toISOString().split('T')[0];
    let endDate: string;
    
    if (planData.tipo_plano === 'teste') {
      // For teste plans, add 7 days
      const start = new Date(startDate);
      start.setDate(start.getDate() + 7);
      endDate = start.toISOString().split('T')[0];
    } else if (mappedPlanType === 'mensal') {
      // For monthly plans, add 1 month
      const start = new Date(startDate);
      start.setMonth(start.getMonth() + 1);
      endDate = start.toISOString().split('T')[0];
    } else {
      // For annual plans, add 1 year
      const start = new Date(startDate);
      start.setFullYear(start.getFullYear() + 1);
      endDate = start.toISOString().split('T')[0];
    }

    // Create new plan with calculated end date
    const { error: planError } = await supabaseClient
      .from('user_plans')
      .insert({
        user_id: userId,
        tipo_plano: mappedPlanType,
        data_inicio: startDate,
        data_fim: endDate,
        ativo: true
      });

    if (planError) {
      console.error('Error creating user plan:', planError);
      throw planError;
    }

    console.log('Successfully created new plan for user:', userId);

    // Log admin action with original plan type
    await supabaseClient
      .from('admin_logs')
      .insert({
        admin_user_id: adminUserId,
        action: 'update_user_plan',
        target_user_id: userId,
        details: { tipo_plano: planData.tipo_plano, data_inicio: startDate, data_fim: endDate }
      });

    return { success: true };
  } catch (error) {
    console.error('Error in updateUserPlanById:', error);
    throw error;
  }
};
