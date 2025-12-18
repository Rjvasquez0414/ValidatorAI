export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          role: 'ADMIN' | 'ANALYST' | 'VIEWER'
          avatar_url: string | null
          status: 'Active' | 'Pending'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: 'ADMIN' | 'ANALYST' | 'VIEWER'
          avatar_url?: string | null
          status?: 'Active' | 'Pending'
        }
        Update: {
          email?: string
          name?: string | null
          role?: 'ADMIN' | 'ANALYST' | 'VIEWER'
          avatar_url?: string | null
          status?: 'Active' | 'Pending'
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          status: 'ACTIVE' | 'SCALED' | 'PAUSED' | 'KILLED'
          start_date: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          status?: 'ACTIVE' | 'SCALED' | 'PAUSED' | 'KILLED'
          start_date?: string
          created_by?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          category?: string
          status?: 'ACTIVE' | 'SCALED' | 'PAUSED' | 'KILLED'
          start_date?: string
          updated_at?: string
        }
      }
      metrics: {
        Row: {
          id: string
          project_id: string
          month: string
          revenue: number
          active_users: number
          burn_rate: number
          cac: number
          churn_rate: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          month: string
          revenue?: number
          active_users?: number
          burn_rate?: number
          cac?: number
          churn_rate?: number
        }
        Update: {
          month?: string
          revenue?: number
          active_users?: number
          burn_rate?: number
          cac?: number
          churn_rate?: number
        }
      }
      ai_analyses: {
        Row: {
          id: string
          project_id: string
          recommendation: 'SCALE' | 'PIVOT' | 'KILL' | 'MONITOR'
          score: number
          reasoning: string | null
          key_strength: string | null
          key_risk: string | null
          strategic_actions: string[]
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          recommendation: 'SCALE' | 'PIVOT' | 'KILL' | 'MONITOR'
          score: number
          reasoning?: string | null
          key_strength?: string | null
          key_risk?: string | null
          strategic_actions?: string[]
        }
        Update: {
          recommendation?: 'SCALE' | 'PIVOT' | 'KILL' | 'MONITOR'
          score?: number
          reasoning?: string | null
          key_strength?: string | null
          key_risk?: string | null
          strategic_actions?: string[]
        }
      }
      invitations: {
        Row: {
          id: string
          email: string
          role: 'ADMIN' | 'ANALYST' | 'VIEWER'
          invited_by: string | null
          token: string
          status: 'pending' | 'accepted' | 'expired'
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: 'ADMIN' | 'ANALYST' | 'VIEWER'
          invited_by?: string | null
          token?: string
          status?: 'pending' | 'accepted' | 'expired'
          expires_at?: string
        }
        Update: {
          status?: 'pending' | 'accepted' | 'expired'
        }
      }
    }
  }
}
