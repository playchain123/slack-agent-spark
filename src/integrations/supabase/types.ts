export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          answer_md: string
          asked_by: string
          created_at: string
          id: string
          question: string
          sources: Json
          workspace_id: string
        }
        Insert: {
          answer_md: string
          asked_by: string
          created_at?: string
          id?: string
          question: string
          sources?: Json
          workspace_id: string
        }
        Update: {
          answer_md?: string
          asked_by?: string
          created_at?: string
          id?: string
          question?: string
          sources?: Json
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      commitments: {
        Row: {
          channel_name: string | null
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          owner_avatar: string | null
          owner_name: string | null
          owner_slack_id: string | null
          priority: string
          source_permalink: string | null
          source_thread_id: string | null
          status: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          channel_name?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          owner_avatar?: string | null
          owner_name?: string | null
          owner_slack_id?: string | null
          priority?: string
          source_permalink?: string | null
          source_thread_id?: string | null
          status?: string
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          channel_name?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          owner_avatar?: string | null
          owner_name?: string | null
          owner_slack_id?: string | null
          priority?: string
          source_permalink?: string | null
          source_thread_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commitments_source_thread_id_fkey"
            columns: ["source_thread_id"]
            isOneToOne: false
            referencedRelation: "slack_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commitments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      digest_events: {
        Row: {
          actor_avatar: string | null
          actor_name: string | null
          channel_name: string | null
          created_at: string
          event_type: string
          id: string
          occurred_at: string
          slack_channel_id: string | null
          summary: string
          thread_permalink: string | null
          workspace_id: string
        }
        Insert: {
          actor_avatar?: string | null
          actor_name?: string | null
          channel_name?: string | null
          created_at?: string
          event_type: string
          id?: string
          occurred_at?: string
          slack_channel_id?: string | null
          summary: string
          thread_permalink?: string | null
          workspace_id: string
        }
        Update: {
          actor_avatar?: string | null
          actor_name?: string | null
          channel_name?: string | null
          created_at?: string
          event_type?: string
          id?: string
          occurred_at?: string
          slack_channel_id?: string | null
          summary?: string
          thread_permalink?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digest_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      slack_channels: {
        Row: {
          created_at: string
          id: string
          is_private: boolean
          name: string | null
          slack_channel_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_private?: boolean
          name?: string | null
          slack_channel_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_private?: boolean
          name?: string | null
          slack_channel_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slack_channels_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      slack_event_queue: {
        Row: {
          created_at: string
          error: string | null
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          slack_team_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          event_type: string
          id?: string
          payload: Json
          processed_at?: string | null
          slack_team_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          slack_team_id?: string
        }
        Relationships: []
      }
      slack_installations: {
        Row: {
          authed_user_id: string | null
          bot_token: string
          bot_user_id: string | null
          id: string
          installed_at: string
          scope: string | null
          slack_team_id: string
          slack_team_name: string | null
          user_cache: Json
          workspace_id: string
        }
        Insert: {
          authed_user_id?: string | null
          bot_token: string
          bot_user_id?: string | null
          id?: string
          installed_at?: string
          scope?: string | null
          slack_team_id: string
          slack_team_name?: string | null
          user_cache?: Json
          workspace_id: string
        }
        Update: {
          authed_user_id?: string | null
          bot_token?: string
          bot_user_id?: string | null
          id?: string
          installed_at?: string
          scope?: string | null
          slack_team_id?: string
          slack_team_name?: string | null
          user_cache?: Json
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slack_installations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      slack_messages: {
        Row: {
          created_at: string
          id: string
          permalink: string | null
          slack_channel_id: string
          slack_user_id: string | null
          slack_user_name: string | null
          text: string
          thread_id: string | null
          ts: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permalink?: string | null
          slack_channel_id: string
          slack_user_id?: string | null
          slack_user_name?: string | null
          text: string
          thread_id?: string | null
          ts: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permalink?: string | null
          slack_channel_id?: string
          slack_user_id?: string | null
          slack_user_name?: string | null
          text?: string
          thread_id?: string | null
          ts?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slack_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "slack_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slack_messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      slack_threads: {
        Row: {
          channel_id: string | null
          channel_name: string | null
          created_at: string
          id: string
          last_indexed_at: string | null
          message_count: number
          permalink: string | null
          slack_channel_id: string
          thread_ts: string
          workspace_id: string
        }
        Insert: {
          channel_id?: string | null
          channel_name?: string | null
          created_at?: string
          id?: string
          last_indexed_at?: string | null
          message_count?: number
          permalink?: string | null
          slack_channel_id: string
          thread_ts: string
          workspace_id: string
        }
        Update: {
          channel_id?: string | null
          channel_name?: string | null
          created_at?: string
          id?: string
          last_indexed_at?: string | null
          message_count?: number
          permalink?: string | null
          slack_channel_id?: string
          thread_ts?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slack_threads_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "slack_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slack_threads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      slack_installations_public: {
        Row: {
          bot_user_id: string | null
          id: string | null
          installed_at: string | null
          slack_team_id: string | null
          slack_team_name: string | null
          workspace_id: string | null
        }
        Insert: {
          bot_user_id?: string | null
          id?: string | null
          installed_at?: string | null
          slack_team_id?: string | null
          slack_team_name?: string | null
          workspace_id?: string | null
        }
        Update: {
          bot_user_id?: string | null
          id?: string | null
          installed_at?: string | null
          slack_team_id?: string | null
          slack_team_name?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slack_installations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      is_workspace_owner: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
