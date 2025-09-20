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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      comment_votes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
          vote_type: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "discussion_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      community_badges: {
        Row: {
          badge_description: string
          badge_icon: string
          badge_name: string
          badge_type: string
          created_at: string
          id: string
          points_required: number
          requirements: Json
        }
        Insert: {
          badge_description: string
          badge_icon: string
          badge_name: string
          badge_type: string
          created_at?: string
          id?: string
          points_required?: number
          requirements: Json
        }
        Update: {
          badge_description?: string
          badge_icon?: string
          badge_name?: string
          badge_type?: string
          created_at?: string
          id?: string
          points_required?: number
          requirements?: Json
        }
        Relationships: []
      }
      discussion_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_hidden: boolean
          parent_comment_id: string | null
          post_id: string
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "discussion_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_posts: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_hidden: boolean
          is_pinned: boolean
          tags: string[] | null
          title: string
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          is_pinned?: boolean
          tags?: string[] | null
          title: string
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          is_pinned?: boolean
          tags?: string[] | null
          title?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          coins_earned: number
          completed_at: string
          id: string
          module_id: string
          module_title: string
          user_id: string
        }
        Insert: {
          coins_earned?: number
          completed_at?: string
          id?: string
          module_id: string
          module_title: string
          user_id: string
        }
        Update: {
          coins_earned?: number
          completed_at?: string
          id?: string
          module_id?: string
          module_title?: string
          user_id?: string
        }
        Relationships: []
      }
      moderation_reports: {
        Row: {
          created_at: string
          id: string
          moderator_user_id: string | null
          reason: string
          reported_content_id: string
          reported_content_type: string
          reporter_user_id: string
          resolved_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          moderator_user_id?: string | null
          reason: string
          reported_content_id: string
          reported_content_type: string
          reporter_user_id: string
          resolved_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          moderator_user_id?: string | null
          reason?: string
          reported_content_id?: string
          reported_content_type?: string
          reporter_user_id?: string
          resolved_at?: string | null
          status?: string
        }
        Relationships: []
      }
      portfolio_history: {
        Row: {
          created_at: string
          id: string
          portfolio_value: number
          rank_position: number | null
          recorded_at: string
          total_returns: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          portfolio_value?: number
          rank_position?: number | null
          recorded_at?: string
          total_returns?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          portfolio_value?: number
          rank_position?: number | null
          recorded_at?: string
          total_returns?: number
          user_id?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          buy_price: number
          category: string | null
          created_at: string
          current_price: number
          id: string
          shares: number
          stock_name: string
          stock_symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          buy_price: number
          category?: string | null
          created_at?: string
          current_price: number
          id?: string
          shares: number
          stock_name: string
          stock_symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          buy_price?: number
          category?: string | null
          created_at?: string
          current_price?: number
          id?: string
          shares?: number
          stock_name?: string
          stock_symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_votes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          total_portfolio_value: number | null
          total_returns: number | null
          updated_at: string
          user_group: string | null
          user_id: string
          virtual_coins: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          total_portfolio_value?: number | null
          total_returns?: number | null
          updated_at?: string
          user_group?: string | null
          user_id: string
          virtual_coins?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          total_portfolio_value?: number | null
          total_returns?: number | null
          updated_at?: string
          user_group?: string | null
          user_id?: string
          virtual_coins?: number
        }
        Relationships: []
      }
      transactions: {
        Row: {
          created_at: string
          id: string
          price: number
          shares: number
          stock_name: string
          stock_symbol: string
          total_amount: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          shares: number
          stock_name: string
          stock_symbol: string
          total_amount: number
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          shares?: number
          stock_name?: string
          stock_symbol?: string
          total_amount?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          earned_at: string
          id: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          earned_at?: string
          id?: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          earned_at?: string
          id?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_community_badges: {
        Row: {
          badge_type: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_type: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_type?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_community_badges_badge_type_fkey"
            columns: ["badge_type"]
            isOneToOne: false
            referencedRelation: "community_badges"
            referencedColumns: ["badge_type"]
          },
        ]
      }
      user_reputation: {
        Row: {
          comments_count: number
          created_at: string
          helpful_votes_received: number
          id: string
          posts_count: number
          reputation_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          created_at?: string
          helpful_votes_received?: number
          id?: string
          posts_count?: number
          reputation_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          created_at?: string
          helpful_votes_received?: number
          id?: string
          posts_count?: number
          reputation_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_award_achievements: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      check_and_award_community_badges: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      get_leaderboard_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          display_name: string
          rank_position: number
          total_portfolio_value: number
          total_returns: number
          user_group: string
        }[]
      }
      get_user_performance_history: {
        Args: { days_back?: number; user_uuid: string }
        Returns: {
          date: string
          portfolio_value: number
          rank_position: number
          total_returns: number
        }[]
      }
      get_user_rank: {
        Args: { user_uuid: string }
        Returns: {
          display_name: string
          total_portfolio_value: number
          total_returns: number
          user_group: string
          user_rank: number
        }[]
      }
      update_user_reputation_from_votes: {
        Args: { content_id: string; content_type: string }
        Returns: undefined
      }
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
