/**
 * LAYER 1 — API SERVICE
 * All raw HTTP calls to the backend. No state, no logic — just axios.
 * Base URL: http://localhost:3000/api
 */

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // sends cookies automatically (JWT token)
});

// ── REGISTER ─────────────────────────────────────────────────────────────────
export const registerAPI = (data) =>
  api.post('/auth/register', data);
// data: { username, email, password, contact, role }

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export const loginAPI = (data) =>
  api.post('/auth/login', data);
// data: { email, password }

// ── GET CURRENT USER ──────────────────────────────────────────────────────────
export const getMeAPI = () =>
  api.get('/auth/me');

// ── LOGOUT ────────────────────────────────────────────────────────────────────
export const logoutAPI = () =>
  api.post('/auth/logout');

// ── EMAIL VERIFICATION ────────────────────────────────────────────────────────
export const verifyOtpAPI = (data) =>
  api.post('/auth/verify-otp', data);
// data: { email, otp }

export const resendOtpAPI = (data) =>
  api.post('/auth/resend-otp', data);
// data: { email }

// ── FORGOT / RESET PASSWORD ───────────────────────────────────────────────────
export const forgotPasswordAPI = (data) =>
  api.post('/auth/forgot-password', data);
// data: { email }

export const resetPasswordAPI = (data) =>
  api.post('/auth/reset-password', data);
// data: { email, otp, password }

export const createPasswordAPI = (data) =>
  api.post('/auth/set-password', data);
// data: { id, password, confirmPass }

// ── GOOGLE OAUTH ──────────────────────────────────────────────────────────────
// This is a redirect-based flow — not called via axios.
// Just navigate the browser to this URL:
export const GOOGLE_AUTH_URL = 'http://localhost:3000/api/auth/google';

export default api;
