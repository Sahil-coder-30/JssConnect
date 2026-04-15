import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/auth.hook';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get email from router state (passed from Register)
  const initialEmail = location.state?.email || '';

  const {
    loading, error, successMessage,
    handleVerifyOtp, handleResendOtp, handleClearError, handleClearSuccess
  } = useAuth();

  const [otp, setOtp] = useState('');
  const [email] = useState(initialEmail);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (error) setLocalError(error);
    if (successMessage) {
      setLocalSuccess(successMessage);
      // Auto clear success message after 5 seconds
      setTimeout(() => {
         setLocalSuccess('');
         handleClearSuccess();
      }, 5000);
    }
  }, [error, successMessage, handleClearSuccess]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLocalError('');
    handleClearError();

    if (!otp || otp.length !== 6) {
      setLocalError('Please enter a valid 6-digit verification code.');
      return;
    }
    await handleVerifyOtp(email, otp);
  };

  const handleResend = () => {
    setLocalError('');
    handleClearError();
    handleResendOtp(email);
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-bg">
        <div className="ambient-light-tl"></div>
        <div className="dot-grid"></div>
      </div>

      <main className="auth-main">
        <div className="auth-form-wrapper">
          <div className="auth-brand">
            <div className="brand-logo">
              <span className="material-symbols-outlined">mark_email_read</span>
            </div>
            <span className="brand-text">JSS Connect</span>
          </div>

          <div className="auth-card">
            <header>
              <h2>Verify Email.</h2>
              <p>We sent a 6-digit code to <strong>{email}</strong>.</p>
            </header>

            <form onSubmit={handleSubmit}>
              {localError && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  color: '#f87171',
                  fontSize: '13px',
                }}>
                  {localError}
                </div>
              )}
              {localSuccess && (
                <div style={{
                  background: 'rgba(52,211,153,0.1)',
                  border: '1px solid rgba(52,211,153,0.3)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  color: '#34d399',
                  fontSize: '13px',
                }}>
                  {localSuccess}
                </div>
              )}

              <div className="form-group">
                <label>Verification Code</label>
                <div className="input-wrapper">
                  <input
                    placeholder="000000"
                    type="text"
                    maxLength={6}
                    style={{ letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
              </div>

              <button className="btn-primary" type="submit" disabled={loading}>
                <span>{loading ? 'Verifying...' : 'Confirm Authorization'}</span>
                <span className="material-symbols-outlined icon-arrow">
                  {loading ? 'hourglass_empty' : 'verified'}
                </span>
                <div className="btn-hover-layer"></div>
              </button>

              <div className="divider" style={{ marginTop: '24px' }}>
                <div className="line"></div>
                <span className="text">Didn't receive it?</span>
                <div className="line"></div>
              </div>

              <button 
                type="button" 
                onClick={handleResend}
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '12px',
                  borderRadius: '10px',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  marginTop: '16px',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
              >
                Send New Code
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyOtp;
