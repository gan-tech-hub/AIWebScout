export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string;
          bio: string;
          skills: Json;
          desired_conditions: Json;
          desired_hourly_rate: number | null;
          available_hours: number | null;
          preferred_work_style: string;
          analysis_instruction: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string;
          bio?: string;
          skills?: Json;
          desired_conditions?: Json;
          desired_hourly_rate?: number | null;
          available_hours?: number | null;
          preferred_work_style?: string;
          analysis_instruction?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string;
          bio?: string;
          skills?: Json;
          desired_conditions?: Json;
          desired_hourly_rate?: number | null;
          available_hours?: number | null;
          preferred_work_style?: string;
          analysis_instruction?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      captured_pages: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          url: string;
          page_text: string;
          selected_text: string;
          meta_description: string;
          source_type: Database['public']['Enums']['capture_source_type'];
          captured_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          url: string;
          page_text?: string;
          selected_text?: string;
          meta_description?: string;
          source_type?: Database['public']['Enums']['capture_source_type'];
          captured_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          url?: string;
          page_text?: string;
          selected_text?: string;
          meta_description?: string;
          source_type?: Database['public']['Enums']['capture_source_type'];
          captured_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      analyses: {
        Row: {
          id: string;
          user_id: string;
          captured_page_id: string;
          page_type: Database['public']['Enums']['page_type'] | null;
          status: Database['public']['Enums']['analysis_status'];
          summary: string;
          recommendation: string;
          recommendation_score: number | null;
          result_json: Json;
          error_message: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          captured_page_id: string;
          page_type?: Database['public']['Enums']['page_type'] | null;
          status?: Database['public']['Enums']['analysis_status'];
          summary?: string;
          recommendation?: string;
          recommendation_score?: number | null;
          result_json?: Json;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          captured_page_id?: string;
          page_type?: Database['public']['Enums']['page_type'] | null;
          status?: Database['public']['Enums']['analysis_status'];
          summary?: string;
          recommendation?: string;
          recommendation_score?: number | null;
          result_json?: Json;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'analyses_captured_page_id_fkey';
            columns: ['captured_page_id'];
            isOneToOne: false;
            referencedRelation: 'captured_pages';
            referencedColumns: ['id'];
          },
        ];
      };
      agent_steps: {
        Row: {
          id: string;
          analysis_id: string;
          step_key: string;
          step_name: string;
          status: Database['public']['Enums']['agent_step_status'];
          description: string;
          input_summary: string;
          output_summary: string;
          tool_name: string | null;
          error_message: string | null;
          started_at: string | null;
          completed_at: string | null;
          duration_ms: number | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          step_key: string;
          step_name: string;
          status?: Database['public']['Enums']['agent_step_status'];
          description?: string;
          input_summary?: string;
          output_summary?: string;
          tool_name?: string | null;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          duration_ms?: number | null;
          sort_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          analysis_id?: string;
          step_key?: string;
          step_name?: string;
          status?: Database['public']['Enums']['agent_step_status'];
          description?: string;
          input_summary?: string;
          output_summary?: string;
          tool_name?: string | null;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          duration_ms?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'agent_steps_analysis_id_fkey';
            columns: ['analysis_id'];
            isOneToOne: false;
            referencedRelation: 'analyses';
            referencedColumns: ['id'];
          },
        ];
      };
      analysis_tags: {
        Row: {
          id: string;
          analysis_id: string;
          tag: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          tag: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          analysis_id?: string;
          tag?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'analysis_tags_analysis_id_fkey';
            columns: ['analysis_id'];
            isOneToOne: false;
            referencedRelation: 'analyses';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      page_type: 'job' | 'article' | 'github' | 'company' | 'general';
      analysis_status: 'pending' | 'running' | 'completed' | 'failed';
      agent_step_status:
        | 'pending'
        | 'running'
        | 'completed'
        | 'failed'
        | 'skipped'
        | 'needs_confirmation';
      capture_source_type: 'chrome_extension' | 'web';
    };
    CompositeTypes: Record<never, never>;
  };
};

export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
