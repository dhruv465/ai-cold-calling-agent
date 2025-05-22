// src/api/campaignApi.ts
import axios from './axios';
import { Campaign, CampaignScript, CampaignLead } from '../types';

interface CampaignListResponse {
  campaigns: Campaign[];
  totalCampaigns: number;
  totalPages: number;
  currentPage: number;
}

interface CampaignLeadListResponse {
  campaignLeads: CampaignLead[];
  totalLeads: number;
  totalPages: number;
  currentPage: number;
}

interface CampaignFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const getAllCampaigns = async (filters: CampaignFilters = {}): Promise<CampaignListResponse> => {
  const response = await axios.get<CampaignListResponse>('/campaigns', { params: filters });
  return response.data;
};

export const getCampaignById = async (id: number): Promise<Campaign> => {
  const response = await axios.get<Campaign>(`/campaigns/${id}`);
  return response.data;
};

export const createCampaign = async (campaignData: Partial<Campaign>): Promise<Campaign> => {
  const response = await axios.post<{ message: string; campaign: Campaign }>('/campaigns', campaignData);
  return response.data.campaign;
};

export const updateCampaign = async (id: number, campaignData: Partial<Campaign>): Promise<Campaign> => {
  const response = await axios.put<{ message: string; campaign: Campaign }>(`/campaigns/${id}`, campaignData);
  return response.data.campaign;
};

export const deleteCampaign = async (id: number): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(`/campaigns/${id}`);
  return response.data;
};

// Campaign Scripts
export const addCampaignScript = async (campaignId: number, scriptData: Partial<CampaignScript>): Promise<CampaignScript> => {
  const response = await axios.post<{ message: string; script: CampaignScript }>(`/campaigns/${campaignId}/scripts`, scriptData);
  return response.data.script;
};

export const getCampaignScripts = async (campaignId: number): Promise<CampaignScript[]> => {
  const response = await axios.get<CampaignScript[]>(`/campaigns/${campaignId}/scripts`);
  return response.data;
};

export const updateCampaignScript = async (campaignId: number, scriptId: number, scriptData: Partial<CampaignScript>): Promise<CampaignScript> => {
  const response = await axios.put<{ message: string; script: CampaignScript }>(`/campaigns/${campaignId}/scripts/${scriptId}`, scriptData);
  return response.data.script;
};

// Campaign Leads
export const addLeadsToCampaign = async (campaignId: number, leadIds: number[], priority?: number, scheduledTime?: string): Promise<{ message: string; total_leads: number; added_leads: number; skipped_leads: number }> => {
  const response = await axios.post<{ message: string; total_leads: number; added_leads: number; skipped_leads: number }>(`/campaigns/${campaignId}/leads`, {
    lead_ids: leadIds,
    priority,
    scheduled_time: scheduledTime
  });
  
  return response.data;
};

export const getCampaignLeads = async (campaignId: number, page = 1, limit = 10, status?: string): Promise<CampaignLeadListResponse> => {
  const response = await axios.get<CampaignLeadListResponse>(`/campaigns/${campaignId}/leads`, {
    params: { page, limit, status }
  });
  
  return response.data;
};

export const removeLeadFromCampaign = async (campaignId: number, leadId: number): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(`/campaigns/${campaignId}/leads/${leadId}`);
  return response.data;
};

// Campaign Analytics
export const getCampaignAnalytics = async (campaignId: number): Promise<any> => {
  const response = await axios.get<any>(`/campaigns/${campaignId}/analytics`);
  return response.data;
};

export const getCampaignPerformance = async (campaignId: number, timeframe: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<any> => {
  const response = await axios.get<any>(`/campaigns/${campaignId}/performance`, {
    params: { timeframe }
  });
  
  return response.data;
};
