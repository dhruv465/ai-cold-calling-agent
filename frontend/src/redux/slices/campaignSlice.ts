// src/redux/slices/campaignSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CampaignState, Campaign, CampaignScript } from '../../types';
import * as campaignApi from '../../api/campaignApi';

const initialState: CampaignState = {
  campaigns: [],
  selectedCampaign: null,
  isLoading: false,
  error: null,
  totalCampaigns: 0,
  currentPage: 1,
  totalPages: 1,
};

export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async (filters: { page?: number; limit?: number; status?: string; search?: string } = {}, { rejectWithValue }) => {
    try {
      return await campaignApi.getAllCampaigns(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaigns');
    }
  }
);

export const fetchCampaignById = createAsyncThunk(
  'campaigns/fetchCampaignById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await campaignApi.getCampaignById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaign');
    }
  }
);

export const createCampaign = createAsyncThunk(
  'campaigns/createCampaign',
  async (campaignData: Partial<Campaign>, { rejectWithValue }) => {
    try {
      return await campaignApi.createCampaign(campaignData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create campaign');
    }
  }
);

export const updateCampaign = createAsyncThunk(
  'campaigns/updateCampaign',
  async ({ id, campaignData }: { id: number; campaignData: Partial<Campaign> }, { rejectWithValue }) => {
    try {
      return await campaignApi.updateCampaign(id, campaignData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update campaign');
    }
  }
);

export const deleteCampaign = createAsyncThunk(
  'campaigns/deleteCampaign',
  async (id: number, { rejectWithValue }) => {
    try {
      await campaignApi.deleteCampaign(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete campaign');
    }
  }
);

export const addCampaignScript = createAsyncThunk(
  'campaigns/addCampaignScript',
  async ({ campaignId, scriptData }: { campaignId: number; scriptData: Partial<CampaignScript> }, { rejectWithValue }) => {
    try {
      return await campaignApi.addCampaignScript(campaignId, scriptData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add campaign script');
    }
  }
);

export const getCampaignScripts = createAsyncThunk(
  'campaigns/getCampaignScripts',
  async (campaignId: number, { rejectWithValue }) => {
    try {
      return await campaignApi.getCampaignScripts(campaignId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get campaign scripts');
    }
  }
);

export const addLeadsToCampaign = createAsyncThunk(
  'campaigns/addLeadsToCampaign',
  async ({ campaignId, leadIds, priority, scheduledTime }: { campaignId: number; leadIds: number[]; priority?: number; scheduledTime?: string }, { rejectWithValue }) => {
    try {
      return await campaignApi.addLeadsToCampaign(campaignId, leadIds, priority, scheduledTime);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add leads to campaign');
    }
  }
);

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    clearSelectedCampaign: (state) => {
      state.selectedCampaign = null;
    },
    clearCampaignError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Campaigns
      .addCase(fetchCampaigns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action: PayloadAction<{ campaigns: Campaign[]; totalCampaigns: number; totalPages: number; currentPage: number }>) => {
        state.isLoading = false;
        state.campaigns = action.payload.campaigns;
        state.totalCampaigns = action.payload.totalCampaigns;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Campaign By Id
      .addCase(fetchCampaignById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCampaignById.fulfilled, (state, action: PayloadAction<Campaign>) => {
        state.isLoading = false;
        state.selectedCampaign = action.payload;
      })
      .addCase(fetchCampaignById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Campaign
      .addCase(createCampaign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCampaign.fulfilled, (state, action: PayloadAction<Campaign>) => {
        state.isLoading = false;
        state.campaigns = [action.payload, ...state.campaigns];
        state.totalCampaigns += 1;
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Campaign
      .addCase(updateCampaign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCampaign.fulfilled, (state, action: PayloadAction<Campaign>) => {
        state.isLoading = false;
        state.campaigns = state.campaigns.map(campaign => 
          campaign.id === action.payload.id ? action.payload : campaign
        );
        if (state.selectedCampaign && state.selectedCampaign.id === action.payload.id) {
          state.selectedCampaign = action.payload;
        }
      })
      .addCase(updateCampaign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete Campaign
      .addCase(deleteCampaign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCampaign.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.campaigns = state.campaigns.filter(campaign => campaign.id !== action.payload);
        state.totalCampaigns -= 1;
        if (state.selectedCampaign && state.selectedCampaign.id === action.payload) {
          state.selectedCampaign = null;
        }
      })
      .addCase(deleteCampaign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedCampaign, clearCampaignError } = campaignSlice.actions;
export default campaignSlice.reducer;
