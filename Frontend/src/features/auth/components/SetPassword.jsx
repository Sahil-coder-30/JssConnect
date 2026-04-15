import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/auth.hook';

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('id');

  const {
    loading, error,
    showPassword, showConfirmPassword,
    toggleShowPassword, toggleShowConfirmPassword,
    handleCreatePassword, handleClearError,
  } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLocalError('');
    handleClearError();

    if (!password || !confirmPass) {
      setLocalError('Please fill in both password fields.');
      return;
    }
    if (password !== confirmPass) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }

    if (!userId) {
      setLocalError('User ID is missing from the URL.');
      return;
    }

    await handleCreatePassword(userId, password, confirmPass);
  };

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
              <span className="material-symbols-outlined">key</span>
            </div>
            <span className="brand-text">JSS Connect</span>
          </div>

          <div className="auth-card">
            <header>
              <h2>Set Password.</h2>
              <p>Secure your node. Create a master password to log in without Google.</p>
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

              <div className="form-group">
                <label>New Secure Password</label>
                <div className="input-wrapper">
                  <input
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    className="material-symbols-outlined icon clickable"
                    onClick={toggleShowPassword}
                    style={{ cursor: 'pointer' }}
                  >
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    placeholder="••••••••"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                  />
                  <span
                    className="material-symbols-outlined icon clickable"
                    onClick={toggleShowConfirmPassword}
                    style={{ cursor: 'pointer' }}
                  >
                    {showConfirmPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </div>
              </div>

              <button className="btn-primary" type="submit" disabled={loading}>
                <span>{loading ? 'Encrypting...' : 'Secure Account'}</span>
                <span className="material-symbols-outlined icon-arrow">
                  {loading ? 'hourglass_empty' : 'lock'}
                </span>
                <div className="btn-hover-layer"></div>
              </button>
            </form>

            <footer>
              <p>
                <a href="/login">Return to Access Portal</a>
              </p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SetPassword;
