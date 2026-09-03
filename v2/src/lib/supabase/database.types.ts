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
      intervention_events: {
        Row: {
          actor_id: string;
          created_at: string;
          id: string;
          intervention_id: string;
          next_status: Database["public"]["Enums"]["intervention_status"];
          previous_status: Database["public"]["Enums"]["intervention_status"];
        };
        Insert: {
          actor_id: string;
          created_at?: string;
          id?: string;
          intervention_id: string;
          next_status: Database["public"]["Enums"]["intervention_status"];
          previous_status: Database["public"]["Enums"]["intervention_status"];
        };
        Update: never;
        Relationships: [];
      };
      interventions: {
        Row: {
          amount_minor: number;
          cancellation_reason:
            Database["public"]["Enums"]["cancellation_reason"] | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          client_id: string;
          created_at: string;
          eta_minutes: number;
          id: string;
          offer_id: string;
          provider_id: string;
          request_id: string;
          status: Database["public"]["Enums"]["intervention_status"];
          updated_at: string;
        };
        Insert: {
          amount_minor: number;
          cancellation_reason?:
            Database["public"]["Enums"]["cancellation_reason"] | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          client_id: string;
          created_at?: string;
          eta_minutes: number;
          id?: string;
          offer_id: string;
          provider_id: string;
          request_id: string;
          status?: Database["public"]["Enums"]["intervention_status"];
          updated_at?: string;
        };
        Update: {
          cancellation_reason?:
            Database["public"]["Enums"]["cancellation_reason"] | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          status?: Database["public"]["Enums"]["intervention_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          intervention_id: string;
          sender_id: string;
          sender_role: Database["public"]["Enums"]["message_sender_role"];
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          intervention_id: string;
          sender_id: string;
          sender_role: Database["public"]["Enums"]["message_sender_role"];
        };
        Update: never;
        Relationships: [];
      };
      offers: {
        Row: {
          amount_minor: number;
          created_at: string;
          eta_minutes: number;
          expires_at: string;
          id: string;
          message: string;
          provider_id: string;
          request_id: string;
          status: Database["public"]["Enums"]["offer_status"];
          updated_at: string;
        };
        Insert: {
          amount_minor: number;
          created_at?: string;
          eta_minutes: number;
          expires_at?: string;
          id?: string;
          message?: string;
          provider_id: string;
          request_id: string;
          status?: Database["public"]["Enums"]["offer_status"];
          updated_at?: string;
        };
        Update: {
          amount_minor?: number;
          eta_minutes?: number;
          expires_at?: string;
          message?: string;
          status?: Database["public"]["Enums"]["offer_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "offers_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "provider_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "request_drafts";
            referencedColumns: ["id"];
          },
        ];
      };
      provider_profiles: {
        Row: {
          business_name: string;
          city: string;
          created_at: string;
          id: string;
          rejection_reason: string | null;
          service_ids: Database["public"]["Enums"]["request_service"][];
          updated_at: string;
          vehicle_registration: string;
          vehicle_type: Database["public"]["Enums"]["provider_vehicle_type"];
          verification_status: Database["public"]["Enums"]["provider_verification_status"];
          verified_at: string | null;
        };
        Insert: {
          business_name: string;
          city: string;
          created_at?: string;
          id: string;
          rejection_reason?: string | null;
          service_ids: Database["public"]["Enums"]["request_service"][];
          updated_at?: string;
          vehicle_registration: string;
          vehicle_type: Database["public"]["Enums"]["provider_vehicle_type"];
          verification_status?: Database["public"]["Enums"]["provider_verification_status"];
          verified_at?: string | null;
        };
        Update: {
          business_name?: string;
          city?: string;
          rejection_reason?: string | null;
          service_ids?: Database["public"]["Enums"]["request_service"][];
          updated_at?: string;
          vehicle_registration?: string;
          vehicle_type?: Database["public"]["Enums"]["provider_vehicle_type"];
          verification_status?: Database["public"]["Enums"]["provider_verification_status"];
          verified_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "provider_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          locale: Database["public"]["Enums"]["locale"];
          phone: string | null;
          status: Database["public"]["Enums"]["profile_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          locale?: Database["public"]["Enums"]["locale"];
          phone?: string | null;
          status?: Database["public"]["Enums"]["profile_status"];
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          locale?: Database["public"]["Enums"]["locale"];
        };
        Relationships: [];
      };
      request_drafts: {
        Row: {
          created_at: string;
          details: Json | null;
          id: string;
          location: Json | null;
          owner_session_hash: string;
          published_at: string | null;
          service: Database["public"]["Enums"]["request_service"];
          status: Database["public"]["Enums"]["request_status"];
          updated_at: string;
          user_id: string | null;
          vehicle: Json;
        };
        Insert: {
          created_at?: string;
          details?: Json | null;
          id: string;
          location?: Json | null;
          owner_session_hash: string;
          published_at?: string | null;
          service: Database["public"]["Enums"]["request_service"];
          status?: Database["public"]["Enums"]["request_status"];
          updated_at?: string;
          user_id?: string | null;
          vehicle: Json;
        };
        Update: {
          details?: Json | null;
          location?: Json | null;
          published_at?: string | null;
          status?: Database["public"]["Enums"]["request_status"];
          updated_at?: string;
          user_id?: string | null;
          vehicle?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "request_drafts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      request_photos: {
        Row: {
          byte_size: number;
          content_type: string;
          created_at: string;
          file_name: string;
          id: string;
          object_path: string;
          request_id: string;
        };
        Insert: {
          byte_size: number;
          content_type: string;
          created_at?: string;
          file_name: string;
          id: string;
          object_path: string;
          request_id: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "request_photos_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "request_drafts";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      accept_client_offer: {
        Args: { p_offer_id: string };
        Returns: { id: string; offer_id: string; request_id: string }[];
      };
      advance_provider_intervention: {
        Args: {
          p_intervention_id: string;
          p_next_status: Database["public"]["Enums"]["intervention_status"];
        };
        Returns: Database["public"]["Enums"]["intervention_status"];
      };
      cancel_participant_intervention: {
        Args: {
          p_intervention_id: string;
          p_reason: Database["public"]["Enums"]["cancellation_reason"];
        };
        Returns: Database["public"]["Enums"]["intervention_status"];
      };
      get_participant_intervention: {
        Args: { p_intervention_id: string };
        Returns: {
          amount_minor: number;
          cancellation_reason:
            Database["public"]["Enums"]["cancellation_reason"] | null;
          cancelled_at: string | null;
          cancelled_by_role: string | null;
          created_at: string;
          eta_minutes: number;
          id: string;
          location: Json;
          participant_role: string;
          provider_name: string;
          provider_vehicle_registration: string;
          request_id: string;
          service: Database["public"]["Enums"]["request_service"];
          status: Database["public"]["Enums"]["intervention_status"];
          vehicle: Json;
        }[];
      };
      list_client_request_offers: {
        Args: { p_request_id: string };
        Returns: {
          amount_minor: number;
          eta_minutes: number;
          expires_at: string;
          id: string;
          intervention_id: string | null;
          message: string;
          provider_id: string;
          provider_name: string;
          provider_vehicle_type: Database["public"]["Enums"]["provider_vehicle_type"];
          request_id: string;
          status: Database["public"]["Enums"]["offer_status"];
        }[];
      };
      list_provider_interventions: {
        Args: Record<PropertyKey, never>;
        Returns: {
          amount_minor: number;
          city: string;
          eta_minutes: number;
          id: string;
          service: Database["public"]["Enums"]["request_service"];
          status: Database["public"]["Enums"]["intervention_status"];
          updated_at: string;
          vehicle: Json;
        }[];
      };
      send_intervention_message: {
        Args: { p_body: string; p_intervention_id: string };
        Returns: Database["public"]["Tables"]["messages"]["Row"];
      };
      list_eligible_requests: {
        Args: Record<PropertyKey, never>;
        Returns: {
          city: string;
          description: string;
          id: string;
          photo_count: number;
          published_at: string;
          safety_status: string;
          service: Database["public"]["Enums"]["request_service"];
          urgency: string;
          vehicle: Json;
        }[];
      };
      submit_provider_offer: {
        Args: {
          p_amount_minor: number;
          p_eta_minutes: number;
          p_message?: string;
          p_request_id: string;
        };
        Returns: string;
      };
    };
    Enums: {
      app_role: "client" | "provider" | "admin";
      cancellation_reason:
        | "client_changed_mind"
        | "problem_resolved"
        | "provider_late"
        | "provider_vehicle_issue"
        | "unsafe_location"
        | "client_no_show";
      intervention_status:
        "assigned" | "en_route" | "arrived" | "completed" | "cancelled";
      locale: "fr" | "ar";
      message_sender_role: "client" | "provider";
      offer_status:
        "submitted" | "accepted" | "rejected" | "withdrawn" | "expired";
      profile_status: "active" | "suspended" | "deleted";
      provider_vehicle_type: "tow_truck" | "service_vehicle";
      provider_verification_status: "pending" | "verified" | "rejected";
      request_service: "battery" | "tire" | "towing" | "other";
      request_status: "draft" | "published";
    };
    CompositeTypes: Record<string, never>;
  };
};
