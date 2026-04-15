import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/auth.hook';

const Register = () => {
  const {
    loading, error,
    showPassword, showConfirmPassword,
    toggleShowPassword, toggleShowConfirmPassword,
    handleRegister, handleGoogleLogin, handleClearError,
  } = useAuth();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    contact: '',
    role: 'student', // default role
  });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError('');
    handleClearError();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLocalError('');
    handleClearError();

    if (!form.username || !form.email || !form.password || !form.contact) {
      setLocalError('All fields are required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }

    await handleRegister({
      username: form.username,
      email: form.email,
      password: form.password,
      contact: form.contact,
      role: form.role,
    });
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
        <div className="auth-form-wrapper register-layout">
          <div className="auth-brand">
            <div className="brand-logo">
              <span className="material-symbols-outlined">hub</span>
            </div>
            <span className="brand-text">JSS Connect</span>
          </div>

          <div className="auth-card">
            <header>
              <h2>Join the Network.</h2>
              <p>Create your secure institutional profile.</p>
            </header>

            <form onSubmit={handleSubmit}>
              {/* Error Banner */}
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

              {/* Full Name */}
              <div className="form-group">
                <label>Full Legal Name</label>
                <div className="input-wrapper">
                  <input
                    id="reg-username"
                    name="username"
                    placeholder="Dr. Arthur Vance"
                    type="text"
                    value={form.username}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                  <span className="material-symbols-outlined icon">person</span>
                </div>
              </div>

              <div className="form-grid">
                {/* Email */}
                <div className="form-group">
                  <label>Corporate Email</label>
                  <div className="input-wrapper">
                    <input
                      id="reg-email"
                      name="email"
                      placeholder="name@jss.edu"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                    />
                    <span className="material-symbols-outlined icon">alternate_email</span>
                  </div>
                </div>
                {/* Contact */}
                <div className="form-group">
                  <label>Primary Contact</label>
                  <div className="input-wrapper">
                    <input
                      id="reg-contact"
                      name="contact"
                      placeholder="+91 98XXXXXXXX"
                      type="tel"
                      value={form.contact}
                      onChange={handleChange}
                    />
                    <span className="material-symbols-outlined icon">phone</span>
                  </div>
                </div>
              </div>

              <div className="form-grid">
                {/* Password */}
                <div className="form-group">
                  <label>Secure Password</label>
                  <div className="input-wrapper">
                    <input
                      id="reg-password"
                      name="password"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
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
                {/* Confirm Password */}
                <div className="form-group">
                  <label>Confirm Password</label>
                  <div className="input-wrapper">
                    <input
                      id="reg-confirm-password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
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
              </div>

              {/* Role Selector */}
              <div className="form-group">
                <label>Role</label>
                <div className="input-wrapper">
                  <select
                    id="reg-role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    style={{
                      width: '100%', padding: '14px 44px 14px 16px',
                      background: 'transparent', border: 'none',
                      color: 'inherit', fontSize: '15px', outline: 'none',
                      appearance: 'none',
                    }}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                  <span className="material-symbols-outlined icon">badge</span>
                </div>
              </div>

              {/* Submit */}
              <button className="btn-primary" type="submit" disabled={loading}>
                <span>{loading ? 'Enrolling...' : 'Initiate Enrollment'}</span>
                <span className="material-symbols-outlined icon-arrow">
                  {loading ? 'hourglass_empty' : 'arrow_forward'}
                </span>
                <div className="btn-hover-layer"></div>
              </button>

              <div className="divider">
                <div className="line"></div>
                <span className="text">Institution SSO</span>
                <div className="line"></div>
              </div>

              <button className="btn-social" type="button" onClick={handleGoogleLogin}>
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
                Already registered?{' '}
                <a href="/login">Authorize Session</a>
              </p>
              <p style={{ marginTop: '0.75rem' }}>
                Staff Member? 
                <a href="/staff-register">Staff Onboarding</a>
              </p>
            </footer>
          </div>

          <nav className="global-nav">
            <a href="#">Security Policy</a>
            <a href="#">Global Terms</a>
            <a href="#">Support Hub</a>
          </nav>
          <p className="copyright">© 2024 JSS Connect Ecosystem</p>
        </div>
      </main>

      <button className="floating-help">
        <span className="material-symbols-outlined">support_agent</span>
      </button>
    </div>
  );
};

export default Register;
