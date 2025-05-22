// src/api/callApi.ts
import axios from './axios';
import { Call, Conversation, ConversationSegment } from '../types';

interface CallListResponse {
  calls: Call[];
  totalCalls: number;
  totalPages: number;
  currentPage: number;
}

interface CallFilters {
  page?: number;
  limit?: number;
  status?: string;
  campaign_id?: number;
  start_date?: string;
  end_date?: string;
}

export const getAllCalls = async (filters: CallFilters = {}): Promise<CallListResponse> => {
  const response = await axios.get<CallListResponse>('/calls', { params: filters });
  return response.data;
};

export const getCallById = async (id: number): Promise<Call> => {
  const response = await axios.get<Call>(`/calls/${id}`);
  return response.data;
};

export const initiateCall = async (campaignLeadId: number): Promise<Call> => {
  const response = await axios.post<{ message: string; call: Call }>('/calls/initiate', {
    campaign_lead_id: campaignLeadId
  });
  return response.data.call;
};

export const hangupCall = async (callId: number): Promise<Call> => {
  const response = await axios.post<{ message: string; call: Call }>(`/calls/${callId}/hangup`);
  return response.data.call;
};

export const getCallRecording = async (callId: number): Promise<{ recording_url: string; expires_in?: string }> => {
  const response = await axios.get<{ recording_url: string; expires_in?: string }>(`/calls/${callId}/recording`);
  return response.data;
};

export const getCallConversation = async (callId: number): Promise<Conversation> => {
  const response = await axios.get<Conversation>(`/calls/${callId}/conversation`);
  return response.data;
};

export const getCallTranscript = async (callId: number): Promise<{ call_id: number; transcript: string; segments: ConversationSegment[] }> => {
  const response = await axios.get<{ call_id: number; transcript: string; segments: ConversationSegment[] }>(`/calls/${callId}/transcript`);
  return response.data;
};
