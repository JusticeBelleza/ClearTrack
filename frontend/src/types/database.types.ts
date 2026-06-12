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
      offices: {
        Row: {
          id: string
          name: string
          code: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          code: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          code?: string
          created_at?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: Database['public']['Enums']['user_role']
          office_id: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: Database['public']['Enums']['user_role']
          office_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: Database['public']['Enums']['user_role']
          office_id?: string | null
          created_at?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          tracking_number: string
          title: string
          document_type: string
          status: Database['public']['Enums']['document_status']
          originator_id: string
          current_office_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          tracking_number: string
          title: string
          document_type: string
          status?: Database['public']['Enums']['document_status']
          originator_id: string
          current_office_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          tracking_number?: string
          title?: string
          document_type?: string
          status?: Database['public']['Enums']['document_status']
          originator_id?: string
          current_office_id?: string | null
          created_at?: string | null
        }
      }
      routing_logs: {
        Row: {
          id: string
          document_id: string
          forwarding_office_id: string | null
          receiving_office_id: string
          forwarded_by: string | null
          received_by: string | null
          action: string
          remarks: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          document_id: string
          forwarding_office_id?: string | null
          receiving_office_id: string
          forwarded_by?: string | null
          received_by?: string | null
          action: string
          remarks?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          document_id?: string
          forwarding_office_id?: string | null
          receiving_office_id?: string
          forwarded_by?: string | null
          received_by?: string | null
          action?: string
          remarks?: string | null
          created_at?: string | null
        }
      }
    }
    Enums: {
      user_role: 'system_admin' | 'originator' | 'signatory' | 'deputy'
      document_status: 'draft' | 'in_transit' | 'received' | 'completed'
    }
  }
}