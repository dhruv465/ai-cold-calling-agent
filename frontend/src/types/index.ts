// src/types/index.ts
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'agent';
  is_active: boolean;
}

export interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  language_preference: 'english' | 'hindi';
  lead_source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
  dnd_status: boolean;
  dnd_checked_at: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: number;
  name: string;
  description: string;
  goal: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: User;
}

export interface CampaignScript {
  id: number;
  campaign_id: number;
  language: 'english' | 'hindi';
  script_content: string;
  version: number;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignLead {
  id: number;
  campaign_id: number;
  lead_id: number;
  status: 'pending' | 'called' | 'completed' | 'failed';
  priority: number;
  scheduled_time: string;
  created_at: string;
  updated_at: string;
  Lead?: Lead;
  Campaign?: Campaign;
}

export interface Call {
  id: number;
  campaign_lead_id: number;
  twilio_call_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'no-answer';
  recording_url: string;
  call_cost: number;
  created_at: string;
  updated_at: string;
  CampaignLead?: CampaignLead;
}

export interface Conversation {
  id: number;
  call_id: number;
  transcript: string;
  sentiment_score: number;
  intent: string;
  outcome: 'interested' | 'not-interested' | 'callback' | 'disconnected';
  created_at: string;
  updated_at: string;
  ConversationSegments?: ConversationSegment[];
}

export interface ConversationSegment {
  id: number;
  conversation_id: number;
  speaker: 'agent' | 'customer';
  content: string;
  start_time: number;
  end_time: number;
  sentiment_score: number;
  created_at: string;
}

export interface KPIData {
  total_calls: number;
  successful_connections: number;
  avg_duration: number;
  call_statuses: {
    status: string;
    count: number;
  }[];
  conversation_outcomes: {
    outcome: string;
    count: number;
  }[];
  total_leads: number;
  leads_by_status: {
    status: string;
    count: number;
  }[];
  lead_sources: {
    lead_source: string;
    count: number;
  }[];
  active_campaigns: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LeadState {
  leads: Lead[];
  selectedLead: Lead | null;
  isLoading: boolean;
  error: string | null;
  totalLeads: number;
  currentPage: number;
  totalPages: number;
}

export interface CampaignState {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  isLoading: boolean;
  error: string | null;
  totalCampaigns: number;
  currentPage: number;
  totalPages: number;
}

export interface CallState {
  calls: Call[];
  selectedCall: Call | null;
  isLoading: boolean;
  error: string | null;
  totalCalls: number;
  currentPage: number;
  totalPages: number;
}

export interface DashboardState {
  kpiData: KPIData | null;
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  sidebarOpen: boolean;
  notifications: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }[];
  darkMode: boolean;
}
