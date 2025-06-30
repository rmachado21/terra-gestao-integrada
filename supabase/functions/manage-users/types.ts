
export interface UserData {
  nome: string;
  email: string;
  ativo?: boolean;
  empresa_nome?: string;
}

export interface PlanData {
  tipo_plano: 'mensal' | 'anual' | 'teste';
  data_inicio?: string;
}

export interface RequestBody {
  action: string;
  userData?: UserData;
  userId?: string;
  planData?: PlanData;
  targetUserId?: string;
  active?: boolean;
  newRole?: string;
  newPassword?: string;
}
