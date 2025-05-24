// src/redux/slices/settingsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ApiStatus {
  [key: string]: {
    valid: boolean;
    message: string;
    lastChecked: string;
  };
}

interface SettingsState {
  apiCredentials: Record<string, any>;
  apiStatus: ApiStatus;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  apiCredentials: {},
  apiStatus: {},
  loading: false,
  error: null
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setApiCredentials: (state, action: PayloadAction<Record<string, any>>) => {
      state.apiCredentials = action.payload;
    },
    setApiStatus: (state, action: PayloadAction<ApiStatus>) => {
      state.apiStatus = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { setApiCredentials, setApiStatus, setLoading, setError } = settingsSlice.actions;

export default settingsSlice.reducer;
