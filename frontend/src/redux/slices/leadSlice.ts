// src/redux/slices/leadSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LeadState, Lead } from '../../types';
import * as leadApi from '../../api/leadApi';

const initialState: LeadState = {
  leads: [],
  selectedLead: null,
  isLoading: false,
  error: null,
  totalLeads: 0,
  currentPage: 1,
  totalPages: 1,
};

export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (filters: { page?: number; limit?: number; status?: string; source?: string; language?: string; search?: string } = {}, { rejectWithValue }) => {
    try {
      return await leadApi.getAllLeads(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads');
    }
  }
);

export const fetchLeadById = createAsyncThunk(
  'leads/fetchLeadById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await leadApi.getLeadById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lead');
    }
  }
);

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData: Partial<Lead>, { rejectWithValue }) => {
    try {
      return await leadApi.createLead(leadData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create lead');
    }
  }
);

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, leadData }: { id: number; leadData: Partial<Lead> }, { rejectWithValue }) => {
    try {
      return await leadApi.updateLead(id, leadData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lead');
    }
  }
);

export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (id: number, { rejectWithValue }) => {
    try {
      await leadApi.deleteLead(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete lead');
    }
  }
);

export const importLeadsFromCSV = createAsyncThunk(
  'leads/importLeadsFromCSV',
  async (file: File, { rejectWithValue }) => {
    try {
      return await leadApi.importLeadsFromCSV(file);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to import leads');
    }
  }
);

export const checkDNDStatus = createAsyncThunk(
  'leads/checkDNDStatus',
  async (leadId: number, { rejectWithValue }) => {
    try {
      return await leadApi.checkDNDStatus(leadId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check DND status');
    }
  }
);

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearSelectedLead: (state) => {
      state.selectedLead = null;
    },
    clearLeadError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Leads
      .addCase(fetchLeads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action: PayloadAction<{ leads: Lead[]; totalLeads: number; totalPages: number; currentPage: number }>) => {
        state.isLoading = false;
        state.leads = action.payload.leads;
        state.totalLeads = action.payload.totalLeads;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Lead By Id
      .addCase(fetchLeadById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeadById.fulfilled, (state, action: PayloadAction<Lead>) => {
        state.isLoading = false;
        state.selectedLead = action.payload;
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Lead
      .addCase(createLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLead.fulfilled, (state, action: PayloadAction<Lead>) => {
        state.isLoading = false;
        state.leads = [action.payload, ...state.leads];
        state.totalLeads += 1;
      })
      .addCase(createLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Lead
      .addCase(updateLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLead.fulfilled, (state, action: PayloadAction<Lead>) => {
        state.isLoading = false;
        state.leads = state.leads.map(lead => 
          lead.id === action.payload.id ? action.payload : lead
        );
        if (state.selectedLead && state.selectedLead.id === action.payload.id) {
          state.selectedLead = action.payload;
        }
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete Lead
      .addCase(deleteLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteLead.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.leads = state.leads.filter(lead => lead.id !== action.payload);
        state.totalLeads -= 1;
        if (state.selectedLead && state.selectedLead.id === action.payload) {
          state.selectedLead = null;
        }
      })
      .addCase(deleteLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Import Leads from CSV
      .addCase(importLeadsFromCSV.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(importLeadsFromCSV.fulfilled, (state) => {
        state.isLoading = false;
        // We don't update the leads array here because we'll need to fetch the updated list
      })
      .addCase(importLeadsFromCSV.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Check DND Status
      .addCase(checkDNDStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkDNDStatus.fulfilled, (state, action: PayloadAction<{ lead_id: number; dnd_status: boolean; checked_at: string }>) => {
        state.isLoading = false;
        state.leads = state.leads.map(lead => 
          lead.id === action.payload.lead_id 
            ? { ...lead, dnd_status: action.payload.dnd_status, dnd_checked_at: action.payload.checked_at } 
            : lead
        );
        if (state.selectedLead && state.selectedLead.id === action.payload.lead_id) {
          state.selectedLead = {
            ...state.selectedLead,
            dnd_status: action.payload.dnd_status,
            dnd_checked_at: action.payload.checked_at
          };
        }
      })
      .addCase(checkDNDStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedLead, clearLeadError } = leadSlice.actions;
export default leadSlice.reducer;
