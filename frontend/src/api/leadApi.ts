// src/api/leadApi.ts
import axios from './axios';
import { Lead } from '../types';

interface LeadListResponse {
  leads: Lead[];
  totalLeads: number;
  totalPages: number;
  currentPage: number;
}

interface LeadFilters {
  page?: number;
  limit?: number;
  status?: string;
  source?: string;
  language?: string;
  search?: string;
}

export const getAllLeads = async (filters: LeadFilters = {}): Promise<LeadListResponse> => {
  const response = await axios.get<LeadListResponse>('/leads', { params: filters });
  return response.data;
};

export const getLeadById = async (id: number): Promise<Lead> => {
  const response = await axios.get<Lead>(`/leads/${id}`);
  return response.data;
};

export const createLead = async (leadData: Partial<Lead>): Promise<Lead> => {
  const response = await axios.post<{ message: string; lead: Lead }>('/leads', leadData);
  return response.data.lead;
};

export const updateLead = async (id: number, leadData: Partial<Lead>): Promise<Lead> => {
  const response = await axios.put<{ message: string; lead: Lead }>(`/leads/${id}`, leadData);
  return response.data.lead;
};

export const deleteLead = async (id: number): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(`/leads/${id}`);
  return response.data;
};

export const importLeadsFromCSV = async (file: File): Promise<{ message: string; success_count: number; error_count: number }> => {
  const formData = new FormData();
  formData.append('csv', file);
  
  const response = await axios.post<{ message: string; success_count: number; error_count: number }>('/leads/import/csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const importLeadsFromAPI = async (apiUrl: string, apiKey?: string, params?: Record<string, any>): Promise<{ message: string; success_count: number; error_count: number }> => {
  const response = await axios.post<{ message: string; success_count: number; error_count: number }>('/leads/import/api', {
    api_url: apiUrl,
    api_key: apiKey,
    params,
  });
  
  return response.data;
};

export const checkDNDStatus = async (leadId: number): Promise<{ message: string; lead_id: number; phone_number: string; dnd_status: boolean; checked_at: string }> => {
  const response = await axios.post<{ message: string; lead_id: number; phone_number: string; dnd_status: boolean; checked_at: string }>('/leads/dnd-check', {
    lead_id: leadId,
  });
  
  return response.data;
};

export const batchCheckDNDStatus = async (leadIds: number[]): Promise<{ message: string; success_count: number; error_count: number; results: any[]; errors?: any[] }> => {
  const response = await axios.post<{ message: string; success_count: number; error_count: number; results: any[]; errors?: any[] }>('/leads/batch-dnd-check', {
    lead_ids: leadIds,
  });
  
  return response.data;
};
