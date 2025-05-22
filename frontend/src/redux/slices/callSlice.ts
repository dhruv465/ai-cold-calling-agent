// src/redux/slices/callSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CallState, Call, Conversation } from '../../types';
import * as callApi from '../../api/callApi';

const initialState: CallState = {
  calls: [],
  selectedCall: null,
  isLoading: false,
  error: null,
  totalCalls: 0,
  currentPage: 1,
  totalPages: 1,
};

export const fetchCalls = createAsyncThunk(
  'calls/fetchCalls',
  async (filters: { page?: number; limit?: number; status?: string; campaign_id?: number; start_date?: string; end_date?: string } = {}, { rejectWithValue }) => {
    try {
      return await callApi.getAllCalls(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch calls');
    }
  }
);

export const fetchCallById = createAsyncThunk(
  'calls/fetchCallById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await callApi.getCallById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch call');
    }
  }
);

export const initiateCall = createAsyncThunk(
  'calls/initiateCall',
  async (campaignLeadId: number, { rejectWithValue }) => {
    try {
      return await callApi.initiateCall(campaignLeadId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initiate call');
    }
  }
);

export const hangupCall = createAsyncThunk(
  'calls/hangupCall',
  async (callId: number, { rejectWithValue }) => {
    try {
      return await callApi.hangupCall(callId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to hang up call');
    }
  }
);

export const getCallRecording = createAsyncThunk(
  'calls/getCallRecording',
  async (callId: number, { rejectWithValue }) => {
    try {
      return await callApi.getCallRecording(callId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get call recording');
    }
  }
);

export const getCallConversation = createAsyncThunk(
  'calls/getCallConversation',
  async (callId: number, { rejectWithValue }) => {
    try {
      return await callApi.getCallConversation(callId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get call conversation');
    }
  }
);

export const getCallTranscript = createAsyncThunk(
  'calls/getCallTranscript',
  async (callId: number, { rejectWithValue }) => {
    try {
      return await callApi.getCallTranscript(callId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get call transcript');
    }
  }
);

const callSlice = createSlice({
  name: 'calls',
  initialState,
  reducers: {
    clearSelectedCall: (state) => {
      state.selectedCall = null;
    },
    clearCallError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Calls
      .addCase(fetchCalls.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCalls.fulfilled, (state, action: PayloadAction<{ calls: Call[]; totalCalls: number; totalPages: number; currentPage: number }>) => {
        state.isLoading = false;
        state.calls = action.payload.calls;
        state.totalCalls = action.payload.totalCalls;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchCalls.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Call By Id
      .addCase(fetchCallById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCallById.fulfilled, (state, action: PayloadAction<Call>) => {
        state.isLoading = false;
        state.selectedCall = action.payload;
      })
      .addCase(fetchCallById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Initiate Call
      .addCase(initiateCall.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initiateCall.fulfilled, (state, action: PayloadAction<Call>) => {
        state.isLoading = false;
        state.calls = [action.payload, ...state.calls];
        state.selectedCall = action.payload;
        state.totalCalls += 1;
      })
      .addCase(initiateCall.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Hangup Call
      .addCase(hangupCall.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(hangupCall.fulfilled, (state, action: PayloadAction<Call>) => {
        state.isLoading = false;
        state.calls = state.calls.map(call => 
          call.id === action.payload.id ? action.payload : call
        );
        if (state.selectedCall && state.selectedCall.id === action.payload.id) {
          state.selectedCall = action.payload;
        }
      })
      .addCase(hangupCall.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedCall, clearCallError } = callSlice.actions;
export default callSlice.reducer;
