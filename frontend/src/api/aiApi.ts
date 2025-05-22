// src/api/aiApi.ts
import axios from './axios';

export const generateScript = async (data: {
  campaign_id: number;
  language: string;
  goal: string;
  target_audience?: string;
  key_points?: string;
  tone?: string;
}): Promise<any> => {
  const response = await axios.post<any>('/ai/generate-script', data);
  return response.data;
};

export const analyzeTranscript = async (conversationId: number): Promise<any> => {
  const response = await axios.post<any>('/ai/analyze-transcript', { conversation_id: conversationId });
  return response.data;
};

export const detectIntent = async (text: string, conversationId?: number): Promise<any> => {
  const response = await axios.post<any>('/ai/detect-intent', { 
    text,
    conversation_id: conversationId
  });
  return response.data;
};

export const sentimentAnalysis = async (text: string, conversationId?: number): Promise<any> => {
  const response = await axios.post<any>('/ai/sentiment-analysis', { 
    text,
    conversation_id: conversationId
  });
  return response.data;
};

export const suggestResponses = async (data: {
  customer_text: string;
  conversation_id?: number;
  campaign_id?: number;
}): Promise<any> => {
  const response = await axios.post<any>('/ai/suggest-responses', data);
  return response.data;
};

export const extractInsights = async (campaignId: number, dateRange?: { start_date: string; end_date: string }): Promise<any> => {
  const response = await axios.post<any>('/ai/extract-insights', { 
    campaign_id: campaignId,
    date_range: dateRange
  });
  return response.data;
};
