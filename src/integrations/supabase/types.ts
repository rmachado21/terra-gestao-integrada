export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alertas: {
        Row: {
          created_at: string | null
          data_criacao: string | null
          data_vencimento: string | null
          id: string
          lido: boolean | null
          mensagem: string
          prioridade: Database["public"]["Enums"]["prioridade_alerta"] | null
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_criacao?: string | null
          data_vencimento?: string | null
          id?: string
          lido?: boolean | null
          mensagem: string
          prioridade?: Database["public"]["Enums"]["prioridade_alerta"] | null
          tipo: string
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_criacao?: string | null
          data_vencimento?: string | null
          id?: string
          lido?: boolean | null
          mensagem?: string
          prioridade?: Database["public"]["Enums"]["prioridade_alerta"] | null
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      areas: {
        Row: {
          ativa: boolean | null
          created_at: string | null
          id: string
          localizacao: string | null
          nome: string
          observacoes: string | null
          solo_tipo: string | null
          tamanho_hectares: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string | null
          id?: string
          localizacao?: string | null
          nome: string
          observacoes?: string | null
          solo_tipo?: string | null
          tamanho_hectares: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativa?: boolean | null
          created_at?: string | null
          id?: string
          localizacao?: string | null
          nome?: string
          observacoes?: string | null
          solo_tipo?: string | null
          tamanho_hectares?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          ativo: boolean | null
          cidade: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      colheitas: {
        Row: {
          created_at: string | null
          data_colheita: string
          destino: string | null
          id: string
          observacoes: string | null
          plantio_id: string | null
          qualidade: string | null
          quantidade_kg: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_colheita: string
          destino?: string | null
          id?: string
          observacoes?: string | null
          plantio_id?: string | null
          qualidade?: string | null
          quantidade_kg: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_colheita?: string
          destino?: string | null
          id?: string
          observacoes?: string | null
          plantio_id?: string | null
          qualidade?: string | null
          quantidade_kg?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "colheitas_plantio_id_fkey"
            columns: ["plantio_id"]
            isOneToOne: false
            referencedRelation: "plantios"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque: {
        Row: {
          created_at: string | null
          data_validade: string | null
          id: string
          lote: string | null
          observacoes: string | null
          produto_id: string | null
          quantidade: number
          quantidade_minima: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_validade?: string | null
          id?: string
          lote?: string | null
          observacoes?: string | null
          produto_id?: string | null
          quantidade?: number
          quantidade_minima?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_validade?: string | null
          id?: string
          lote?: string | null
          observacoes?: string | null
          produto_id?: string | null
          quantidade?: number
          quantidade_minima?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_pedido: {
        Row: {
          created_at: string | null
          id: string
          pedido_id: string | null
          preco_unitario: number
          produto_id: string | null
          quantidade: number
          subtotal: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pedido_id?: string | null
          preco_unitario: number
          produto_id?: string | null
          quantidade: number
          subtotal: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pedido_id?: string | null
          preco_unitario?: number
          produto_id?: string | null
          quantidade?: number
          subtotal?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes_financeiras: {
        Row: {
          categoria: string | null
          created_at: string | null
          data_movimentacao: string
          descricao: string
          id: string
          observacoes: string | null
          pedido_id: string | null
          tipo: Database["public"]["Enums"]["tipo_movimentacao"]
          updated_at: string | null
          user_id: string
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          data_movimentacao?: string
          descricao: string
          id?: string
          observacoes?: string | null
          pedido_id?: string | null
          tipo: Database["public"]["Enums"]["tipo_movimentacao"]
          updated_at?: string | null
          user_id: string
          valor: number
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          data_movimentacao?: string
          descricao?: string
          id?: string
          observacoes?: string | null
          pedido_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_movimentacao"]
          updated_at?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_financeiras_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          data_entrega: string | null
          data_pedido: string
          id: string
          observacoes: string | null
          status: Database["public"]["Enums"]["status_pedido"] | null
          updated_at: string | null
          user_id: string
          valor_total: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          data_entrega?: string | null
          data_pedido?: string
          id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_pedido"] | null
          updated_at?: string | null
          user_id: string
          valor_total?: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          data_entrega?: string | null
          data_pedido?: string
          id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_pedido"] | null
          updated_at?: string | null
          user_id?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      plantios: {
        Row: {
          area_id: string | null
          created_at: string | null
          data_plantio: string
          data_previsao_colheita: string
          id: string
          observacoes: string | null
          quantidade_mudas: number | null
          status: Database["public"]["Enums"]["status_plantio"] | null
          updated_at: string | null
          user_id: string
          variedade: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string | null
          data_plantio: string
          data_previsao_colheita: string
          id?: string
          observacoes?: string | null
          quantidade_mudas?: number | null
          status?: Database["public"]["Enums"]["status_plantio"] | null
          updated_at?: string | null
          user_id: string
          variedade: string
        }
        Update: {
          area_id?: string | null
          created_at?: string | null
          data_plantio?: string
          data_previsao_colheita?: string
          id?: string
          observacoes?: string | null
          quantidade_mudas?: number | null
          status?: Database["public"]["Enums"]["status_plantio"] | null
          updated_at?: string | null
          user_id?: string
          variedade?: string
        }
        Relationships: [
          {
            foreignKeyName: "plantios_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      processamentos: {
        Row: {
          colheita_id: string | null
          created_at: string
          data_processamento: string
          id: string
          lote: string
          observacoes: string | null
          perda_percentual: number | null
          quantidade_entrada_kg: number
          quantidade_saida_kg: number
          tipo_processamento: string
          updated_at: string
          user_id: string
        }
        Insert: {
          colheita_id?: string | null
          created_at?: string
          data_processamento: string
          id?: string
          lote: string
          observacoes?: string | null
          perda_percentual?: number | null
          quantidade_entrada_kg: number
          quantidade_saida_kg: number
          tipo_processamento: string
          updated_at?: string
          user_id: string
        }
        Update: {
          colheita_id?: string | null
          created_at?: string
          data_processamento?: string
          id?: string
          lote?: string
          observacoes?: string | null
          perda_percentual?: number | null
          quantidade_entrada_kg?: number
          quantidade_saida_kg?: number
          tipo_processamento?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "processamentos_colheita_id_fkey"
            columns: ["colheita_id"]
            isOneToOne: false
            referencedRelation: "colheitas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          preco_venda: number | null
          unidade_medida: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          preco_venda?: number | null
          unidade_medida: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          preco_venda?: number | null
          unidade_medida?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cargo: string | null
          created_at: string
          email: string
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cargo?: string | null
          created_at?: string
          email: string
          id: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cargo?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      prioridade_alerta: "baixa" | "media" | "alta" | "critica"
      status_pedido: "pendente" | "processando" | "entregue" | "cancelado"
      status_plantio:
        | "planejado"
        | "plantado"
        | "crescendo"
        | "pronto_colheita"
        | "colhido"
      tipo_movimentacao: "receita" | "despesa"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      prioridade_alerta: ["baixa", "media", "alta", "critica"],
      status_pedido: ["pendente", "processando", "entregue", "cancelado"],
      status_plantio: [
        "planejado",
        "plantado",
        "crescendo",
        "pronto_colheita",
        "colhido",
      ],
      tipo_movimentacao: ["receita", "despesa"],
    },
  },
} as const
