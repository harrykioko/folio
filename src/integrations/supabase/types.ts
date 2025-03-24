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
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      verticals: {
        Row: {
          id: string
          name: string
          slug: string
          color: string
          organization_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          color: string
          organization_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          color?: string
          organization_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string | null
          status: string
          vertical_id: string | null
          organization_id: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string | null
          status: string
          vertical_id?: string | null
          organization_id: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string | null
          status?: string
          vertical_id?: string | null
          organization_id?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      asset_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          organization_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          organization_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          organization_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          category_id: string
          status: string
          expiry_date: string | null
          thumbnail_url: string | null
          starred: boolean
          metadata: Json | null
          organization_id: string
          created_by: string | null
          owner: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: string
          category_id: string
          status: string
          expiry_date?: string | null
          thumbnail_url?: string | null
          starred?: boolean
          metadata?: Json | null
          organization_id: string
          created_by?: string | null
          owner?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          category_id?: string
          status?: string
          expiry_date?: string | null
          thumbnail_url?: string | null
          starred?: boolean
          metadata?: Json | null
          organization_id?: string
          created_by?: string | null
          owner?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      asset_projects: {
        Row: {
          id: string
          asset_id: string
          project_id: string
          created_at: string
        }
        Insert: {
          id?: string
          asset_id: string
          project_id: string
          created_at?: string
        }
        Update: {
          id?: string
          asset_id?: string
          project_id?: string
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          priority: string
          due_date: string | null
          project_id: string | null
          vertical_id: string | null
          assignee_id: string | null
          created_by: string | null
          organization_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status: string
          priority: string
          due_date?: string | null
          project_id?: string | null
          vertical_id?: string | null
          assignee_id?: string | null
          created_by?: string | null
          organization_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          due_date?: string | null
          project_id?: string | null
          vertical_id?: string | null
          assignee_id?: string | null
          created_by?: string | null
          organization_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      task_comments: {
        Row: {
          id: string
          task_id: string
          content: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          content: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          content?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      task_attachments: {
        Row: {
          id: string
          task_id: string
          name: string
          file_url: string
          file_type: string | null
          file_size: number | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          name: string
          file_url: string
          file_type?: string | null
          file_size?: number | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          name?: string
          file_url?: string
          file_type?: string | null
          file_size?: number | null
          user_id?: string
          created_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          description: string | null
          project_id: string | null
          organization_id: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          project_id?: string | null
          organization_id: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          project_id?: string | null
          organization_id?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          title: string
          content: Json | null
          workspace_id: string
          project_id: string | null
          created_by: string | null
          organization_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: Json | null
          workspace_id: string
          project_id?: string | null
          created_by?: string | null
          organization_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: Json | null
          workspace_id?: string
          project_id?: string | null
          created_by?: string | null
          organization_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      document_history: {
        Row: {
          id: string
          document_id: string
          content: Json
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          content: Json
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          content?: Json
          user_id?: string
          created_at?: string
        }
      }
      portfolio_items: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          status: string
          value: number | null
          currency: string | null
          metrics: Json | null
          project_id: string | null
          organization_id: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: string
          status: string
          value?: number | null
          currency?: string | null
          metrics?: Json | null
          project_id?: string | null
          organization_id: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          status?: string
          value?: number | null
          currency?: string | null
          metrics?: Json | null
          project_id?: string | null
          organization_id?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          action: string
          entity_type: string
          entity_id: string
          user_id: string
          metadata: Json | null
          organization_id: string
          created_at: string
        }
        Insert: {
          id?: string
          action: string
          entity_type: string
          entity_id: string
          user_id: string
          metadata?: Json | null
          organization_id: string
          created_at?: string
        }
        Update: {
          id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          user_id?: string
          metadata?: Json | null
          organization_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          title: string
          content: string
          type: string
          is_read: boolean
          entity_type: string | null
          entity_id: string | null
          user_id: string
          organization_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          type: string
          is_read?: boolean
          entity_type?: string | null
          entity_id?: string | null
          user_id: string
          organization_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          type?: string
          is_read?: boolean
          entity_type?: string | null
          entity_id?: string | null
          user_id?: string
          organization_id?: string
          created_at?: string
        }
      }
      ai_conversations: {
        Row: {
          id: string
          title: string | null
          user_id: string
          organization_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          user_id: string
          organization_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          user_id?: string
          organization_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      ai_messages: {
        Row: {
          id: string
          conversation_id: string
          content: string
          role: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          content: string
          role: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          content?: string
          role?: string
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
