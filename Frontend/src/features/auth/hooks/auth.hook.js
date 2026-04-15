/**
 * LAYER 3 — CUSTOM HOOK
 * Bridges the Redux slice to components.
 * Components only import this — they never touch dispatch or the store directly.
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  createPassword,
  clearError,
  clearSuccess,
} from '../slice/auth.slice';
import { GOOGLE_AUTH_URL } from '../services/auth.api';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Local UI states ────────────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Redux state ────────────────────────────────────────────────────────────
  const { user, isAuthenticated, loading, error, successMessage, step, registrationEmail } =
    useSelector((state) => state.auth);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleRegister = async (formData) => {
    // formData: { username, email, password, contact, role }
    const result = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(result)) {
      // Registration succeeded → backend sends OTP to email
      // Navigate to OTP verification page, pass email via state
      navigate('/verify-otp', { state: { email: formData.email } });
    }
  };

  const handleLogin = async (formData) => {
    // formData: { email, password }
    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      // Login succeeded → fetch user profile and go to dashboard
      await dispatch(getMe());
      navigate('/');
    } else if (loginUser.rejected.match(result)) {
      // Check if it's the "No password set" error which returns `{ message, id, email }`
      if (result.payload && typeof result.payload === 'object' && result.payload.id) {
         navigate(`/set-password?id=${result.payload.id}`);
      }
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const handleVerifyOtp = async (email, otp) => {
    const result = await dispatch(verifyOtp({ email, otp }));
    if (verifyOtp.fulfilled.match(result)) {
      // Email verified → go to login
      navigate('/login', { state: { verified: true } });
    }
  };

  const handleResendOtp = (email) => {
    dispatch(resendOtp({ email }));
  };

  const handleForgotPassword = async (email) => {
    const result = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(result)) {
      navigate('/reset-password', { state: { email } });
    }
  };

  const handleResetPassword = async (email, otp, password) => {
    const result = await dispatch(resetPassword({ email, otp, password }));
    if (resetPassword.fulfilled.match(result)) {
      navigate('/login');
    }
  };

  const handleCreatePassword = async (id, password, confirmPass) => {
    const result = await dispatch(createPassword({ id, password, confirmPass }));
    if (createPassword.fulfilled.match(result)) {
      navigate('/login');
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend OAuth — not an axios call
    window.location.href = GOOGLE_AUTH_URL;
  };

  const handleClearError = () => dispatch(clearError());
  const handleClearSuccess = () => dispatch(clearSuccess());

  const toggleShowPassword = () => setShowPassword((p) => !p);
  const toggleShowConfirmPassword = () => setShowConfirmPassword((p) => !p);

  return {
    // state
    user,
    isAuthenticated,
    loading,
    error,
    successMessage,
    step,
    registrationEmail,

    // UI state
    showPassword,
    showConfirmPassword,

    // actions
    handleRegister,
    handleLogin,
    handleLogout,
    handleVerifyOtp,
    handleResendOtp,
    handleForgotPassword,
    handleResetPassword,
    handleCreatePassword,
    handleGoogleLogin,
    handleClearError,
    handleClearSuccess,
    toggleShowPassword,
    toggleShowConfirmPassword,
  };
};

export default useAuth;
