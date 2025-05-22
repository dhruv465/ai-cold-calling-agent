// src/api/analyticsApi.ts
import axios from './axios';

export const getDashboardMetrics = async (): Promise<any> => {
  const response = await axios.get<any>('/analytics/dashboard');
  return response.data;
};

export const getCallMetrics = async (startDate?: string, endDate?: string, campaignId?: number): Promise<any> => {
  const response = await axios.get<any>('/analytics/calls', {
    params: {
      start_date: startDate,
      end_date: endDate,
      campaign_id: campaignId
    }
  });
  return response.data;
};

export const getLeadMetrics = async (startDate?: string, endDate?: string, campaignId?: number): Promise<any> => {
  const response = await axios.get<any>('/analytics/leads', {
    params: {
      start_date: startDate,
      end_date: endDate,
      campaign_id: campaignId
    }
  });
  return response.data;
};

export const getAgentPerformance = async (startDate?: string, endDate?: string): Promise<any> => {
  const response = await axios.get<any>('/analytics/agents', {
    params: {
      start_date: startDate,
      end_date: endDate
    }
  });
  return response.data;
};

export const getCampaignComparison = async (campaignIds: number[], startDate?: string, endDate?: string): Promise<any> => {
  const response = await axios.get<any>('/analytics/campaigns', {
    params: {
      campaign_ids: campaignIds.join(','),
      start_date: startDate,
      end_date: endDate
    }
  });
  return response.data;
};

export const getRegionalDistribution = async (): Promise<any> => {
  const response = await axios.get<any>('/analytics/regions');
  return response.data;
};

export const generateReport = async (reportData: {
  name: string;
  description: string;
  report_type: string;
  parameters?: any;
  schedule?: string;
  recipients?: string[];
}): Promise<any> => {
  const response = await axios.post<any>('/analytics/reports/generate', reportData);
  return response.data;
};

export const getReports = async (): Promise<any> => {
  const response = await axios.get<any>('/analytics/reports');
  return response.data;
};

export const getReportById = async (id: number): Promise<any> => {
  const response = await axios.get<any>(`/analytics/reports/${id}`);
  return response.data;
};
