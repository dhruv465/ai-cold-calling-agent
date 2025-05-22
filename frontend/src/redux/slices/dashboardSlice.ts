// src/redux/slices/dashboardSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DashboardState, KPIData } from '../../types';
import * as analyticsApi from '../../api/analyticsApi';

const initialState: DashboardState = {
  kpiData: null,
  isLoading: false,
  error: null,
};

export const fetchDashboardMetrics = createAsyncThunk(
  'dashboard/fetchDashboardMetrics',
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsApi.getDashboardMetrics();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard metrics');
    }
  }
);

export const fetchCallMetrics = createAsyncThunk(
  'dashboard/fetchCallMetrics',
  async ({ startDate, endDate, campaignId }: { startDate?: string; endDate?: string; campaignId?: number } = {}, { rejectWithValue }) => {
    try {
      return await analyticsApi.getCallMetrics(startDate, endDate, campaignId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch call metrics');
    }
  }
);

export const fetchLeadMetrics = createAsyncThunk(
  'dashboard/fetchLeadMetrics',
  async ({ startDate, endDate, campaignId }: { startDate?: string; endDate?: string; campaignId?: number } = {}, { rejectWithValue }) => {
    try {
      return await analyticsApi.getLeadMetrics(startDate, endDate, campaignId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lead metrics');
    }
  }
);

export const fetchAgentPerformance = createAsyncThunk(
  'dashboard/fetchAgentPerformance',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      return await analyticsApi.getAgentPerformance(startDate, endDate);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch agent performance');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Metrics
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action: PayloadAction<KPIData>) => {
        state.isLoading = false;
        state.kpiData = action.payload;
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
