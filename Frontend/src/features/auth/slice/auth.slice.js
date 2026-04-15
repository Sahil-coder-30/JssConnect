/**
 * LAYER 2 — REDUX SLICE (State Management)
 * Manages: user, token, loading, error, verificationStep
 * Uses Redux Toolkit createSlice + createAsyncThunk
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  registerAPI,
  loginAPI,
  getMeAPI,
  logoutAPI,
  verifyOtpAPI,
  resendOtpAPI,
  forgotPasswordAPI,
  resetPasswordAPI,
  createPasswordAPI,
} from '../services/auth.api';

// ── ASYNC THUNKS ───────────────────────────────────────────────────────────────

export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await registerAPI(formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await loginAPI(formData);
      return res.data;
    } catch (err) {
      if (err.response?.data?.id) {
         // Pass the entire data payload since it contains id and email
         return rejectWithValue(err.response.data);
      }
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMeAPI();
      return res.data.user;
    } catch (err) {
      return rejectWithValue(null);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutAPI();
      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Logout failed');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (data, { rejectWithValue }) => {
    try {
      const res = await verifyOtpAPI(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Invalid OTP');
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (data, { rejectWithValue }) => {
    try {
      const res = await resendOtpAPI(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to resend OTP');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (data, { rejectWithValue }) => {
    try {
      const res = await forgotPasswordAPI(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send reset email');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const res = await resetPasswordAPI(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Password reset failed');
    }
  }
);

export const createPassword = createAsyncThunk(
  'auth/createPassword',
  async (data, { rejectWithValue }) => {
    try {
      const res = await createPasswordAPI(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create password');
    }
  }
);

// ── INITIAL STATE ──────────────────────────────────────────────────────────────

const initialState = {
  user: null,              // { id, username, email, role, ... }
  isAuthenticated: false,
  loading: false,
  error: null,
  successMessage: null,

  // registration multi-step flow
  registrationEmail: null, // saved after register so we know where to send OTP
  step: 'idle',           // 'idle' | 'registered' | 'verified' | 'logged_in'
};

// ── SLICE ──────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.successMessage = null; },
    resetAuthState: () => initialState,
    setStep: (state, action) => { state.step = action.payload; },
  },
  extraReducers: (builder) => {

    // ── Register ────────────────────────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationEmail = action.meta.arg.email;
        state.successMessage = action.payload.message;
        state.step = 'registered';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });

    // ── Login ────────────────────────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.step = 'logged_in';
        state.successMessage = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false; 
        state.error = typeof action.payload === 'object' ? action.payload.message : action.payload;
      });

    // ── Get Me ───────────────────────────────────────────────────────────────
    builder
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });

    // ── Logout ───────────────────────────────────────────────────────────────
    builder
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(logoutUser.rejected, () => initialState);

    // ── Verify OTP ───────────────────────────────────────────────────────────
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.step = 'verified';
        state.successMessage = action.payload.message;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });

    // ── Resend OTP ───────────────────────────────────────────────────────────
    builder
      .addCase(resendOtp.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });

    // ── Forgot Password ──────────────────────────────────────────────────────
    builder
      .addCase(forgotPassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });

    // ── Reset Password ───────────────────────────────────────────────────────
    builder
      .addCase(resetPassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.step = 'idle';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });

    // ── Create Password ──────────────────────────────────────────────────────
    builder
      .addCase(createPassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(createPassword.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, resetAuthState, setStep } = authSlice.actions;
export default authSlice.reducer;
