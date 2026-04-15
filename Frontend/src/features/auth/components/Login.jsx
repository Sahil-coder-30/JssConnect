import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/auth.hook';

const Login = () => {
  const {
    loading, error, successMessage,
    showPassword, toggleShowPassword,
    handleLogin, handleGoogleLogin, handleClearError,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  // Sync Redux error into local display
  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLocalError('');
    handleClearError();
    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }
    await handleLogin({ email, password });
  };

  return (
    <div className="auth-wrapper">
      {/* Cinematic Background */}
      <div className="auth-bg">
        <div className="ambient-light-tl"></div>
        <div className="dot-grid"></div>
        <div className="svg-layer-container">
          <div className="svg-layer slow-blue">
            <svg viewBox="0 0 200 100" preserveAspectRatio="none">
              <path fill="none" stroke="#1B2B5E" strokeWidth="0.25" d="M0,50 Q25,20 50,50 T100,50 T150,50 T200,50" />
            </svg>
            <svg viewBox="0 0 200 100" preserveAspectRatio="none">
              <path fill="none" stroke="#1B2B5E" strokeWidth="0.25" d="M0,50 Q25,20 50,50 T100,50 T150,50 T200,50" />
            </svg>
          </div>
          <div className="svg-layer med-teal">
            <svg viewBox="0 0 200 100" preserveAspectRatio="none">
              <path fill="none" stroke="#0D9B8A" strokeWidth="0.2" d="M0,60 Q25,30 50,60 T100,60 T150,60 T200,60" />
            </svg>
            <svg viewBox="0 0 200 100" preserveAspectRatio="none">
              <path fill="none" stroke="#0D9B8A" strokeWidth="0.2" d="M0,60 Q25,30 50,60 T100,60 T150,60 T200,60" />
            </svg>
          </div>
          <div className="svg-layer fast-amber">
            <svg viewBox="0 0 200 100" preserveAspectRatio="none">
              <path className="animate-flow" fill="none" stroke="#F4A62A" strokeWidth="0.15" strokeDasharray="1 1" d="M0,45 Q20,30 40,45 T80,45 T120,45 T160,45 T200,45" />
            </svg>
            <svg viewBox="0 0 200 100" preserveAspectRatio="none">
              <path className="animate-flow" fill="none" stroke="#F4A62A" strokeWidth="0.15" strokeDasharray="1 1" d="M0,45 Q20,30 40,45 T80,45 T120,45 T160,45 T200,45" />
            </svg>
          </div>
        </div>
        <div className="blob b1"></div>
        <div className="blob b2"></div>
        <div className="blob b3"></div>
      </div>

      <main className="auth-main">
        <div className="auth-form-wrapper">
          <div className="auth-brand">
            <div className="brand-logo">
              <span className="material-symbols-outlined">hub</span>
            </div>
            <span className="brand-text">JSS Connect</span>
          </div>

          <div className="auth-card">
            <header>
              <h2>Portal Access.</h2>
              <p>Enter your institutional credentials.</p>
            </header>

            <form onSubmit={handleSubmit}>
              {/* Error Message */}
              {localError && (
                <div className="form-error-banner" style={{
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

              {/* Email Field */}
              <div className="form-group">
                <label>Institutional Email</label>
                <div className="input-wrapper">
                  <input
                    id="login-email"
                    placeholder="faculty@jss.edu"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  <span className="material-symbols-outlined icon">alternate_email</span>
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <div className="form-group-row">
                  <label>Secure Password</label>
                  <a className="forgot-link" href="/forgot-password">Recover Access</a>
                </div>
                <div className="input-wrapper">
                  <input
                    id="login-password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
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

              {/* Submit Button */}
              <button
                className="btn-primary"
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Authorizing...' : 'Authorize Session'}</span>
                <span className="material-symbols-outlined icon-arrow">
                  {loading ? 'hourglass_empty' : 'arrow_forward'}
                </span>
                <div className="btn-hover-layer"></div>
              </button>

              {/* Divider */}
              <div className="divider">
                <div className="line"></div>
                <span className="text">Institution SSO</span>
                <div className="line"></div>
              </div>

              {/* Google Auth */}
              <button
                className="btn-social"
                type="button"
                onClick={handleGoogleLogin}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 5.04c1.73 0 3.12.63 4.12 1.54l3.07-3.07C17.35 1.83 14.91 1 12 1 7.37 1 3.44 3.65 1.54 7.54l3.58 2.78c.85-2.54 3.23-4.28 6.88-4.28z" fill="#EA4335"></path>
                  <path d="M23.49 12.27c0-.81-.07-1.59-.2-2.33H12v4.42h6.44c-.28 1.48-1.12 2.74-2.38 3.58l3.71 2.87c2.17-2 3.43-4.94 3.43-8.54z" fill="#4285F4"></path>
                  <path d="M5.12 14.71c-.24-.71-.38-1.47-.38-2.27s.14-1.56.38-2.27L1.54 7.54C.56 9.53 0 11.7 0 14s.56 4.47 1.54 6.46l3.58-2.75z" fill="#FBBC05"></path>
                  <path d="M12 23c3.12 0 5.74-1.03 7.65-2.8l-3.71-2.87c-1.03.69-2.35 1.1-3.94 1.1-3.65 0-6.03-2.43-6.88-4.97L1.54 16.15C3.44 20.35 7.37 23 12 23z" fill="#34A853"></path>
                </svg>
                <span>Google Identity</span>
              </button>
            </form>

            <footer>
              <p>
                Awaiting clearance?{' '}
                <a href="/register">Initiate Node</a>
              </p>
            </footer>
          </div>

          <nav className="global-nav">
            <a href="#">Security Protocol</a>
            <a href="#">Network Terms</a>
            <a href="#">System Helpdesk</a>
          </nav>

          <div className="system-status">
            <div className="dot"></div>
            <span>Core Active</span>
          </div>

          <p className="copyright">© 2024 JSS Connect Ecosystem</p>
        </div>
      </main>

      <button className="floating-help">
        <span className="material-symbols-outlined">support_agent</span>
      </button>
    </div>
  );
};

export default Login;
