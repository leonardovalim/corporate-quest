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
      admin_config: {
        Row: {
          admin_password: string | null
          ai_config: Json
          id: number
          updated_at: string
        }
        Insert: {
          admin_password?: string | null
          ai_config?: Json
          id?: number
          updated_at?: string
        }
        Update: {
          admin_password?: string | null
          ai_config?: Json
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      game_logs: {
        Row: {
          created_at: string
          data: Json
          encounter: string | null
          event: string
          id: string
          model: string | null
          phase: number | null
          provider: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data?: Json
          encounter?: string | null
          event: string
          id?: string
          model?: string | null
          phase?: number | null
          provider?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          encounter?: string | null
          event?: string
          id?: string
          model?: string | null
          phase?: number | null
          provider?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      game_saves: {
        Row: {
          character_name: string | null
          class_name: string | null
          created_at: string
          id: string
          last_played_at: string
          level: number | null
          name: string
          snapshot: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          character_name?: string | null
          class_name?: string | null
          created_at?: string
          id?: string
          last_played_at?: string
          level?: number | null
          name: string
          snapshot: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          character_name?: string | null
          class_name?: string | null
          created_at?: string
          id?: string
          last_played_at?: string
          level?: number | null
          name?: string
          snapshot?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
profiles: {
        Row: {
          character_snapshot: Json | null
          company_name: string
          created_at: string
          email: string
          feedback: string | null
          full_name: string
          has_product_openings: boolean
          id: string
          linkedin_url: string | null
          phone: string
          rating: number | null
          updated_at: string
        }
        Insert: {
          character_snapshot?: Json | null
          company_name: string
          created_at?: string
          email: string
          feedback?: string | null
          full_name: string
          has_product_openings?: boolean
          id: string
          linkedin_url?: string | null
          phone: string
          rating?: number | null
          updated_at?: string
        }
        Update: {
          character_snapshot?: Json | null
          company_name?: string
          created_at?: string
          email?: string
          feedback?: string | null
          full_name?: string
          has_product_openings?: boolean
          id?: string
          linkedin_url?: string | null
          phone?: string
          rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {
      change_admin_password: {
        Args: {
          p_current_password: string
          p_new_password: string
        }
        Returns: void
      }
      get_all_profiles_for_admin: {
        Args: {
          p_password: string
        }
        Returns: {
          id: string
          full_name: string
          email: string
          phone: string
          company_name: string
          linkedin_url: string | null
          has_product_openings: boolean
          rating: number | null
          feedback: string | null
          character_snapshot: Json | null
          created_at: string
          updated_at: string
          last_sign_in_at: string | null
        }[]
      }
      get_game_logs_for_admin: {
        Args: {
          p_password: string
          p_limit?: number
          p_event?: string
        }
        Returns: {
          id: string
          created_at: string
          session_id: string
          user_id: string | null
          provider: string | null
          model: string | null
          event: string
          encounter: string | null
          phase: number | null
          data: Json
        }[]
      }
      update_admin_ai_config: {
        Args: {
          p_password: string
          p_config: Json
        }
        Returns: void
      }
      verify_admin_password: {
        Args: {
          p_password: string
        }
        Returns: boolean
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}
