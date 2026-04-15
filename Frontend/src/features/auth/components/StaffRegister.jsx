import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { startAuthentication } from '@simplewebauthn/browser';
import { useNavigate } from 'react-router-dom';

const CinematicBackground = () => (
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
);

const StaffRegister = () => {
  const [role, setRole] = useState('faculty');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form State
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [department, setDepartment] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [authStatus, setAuthStatus] = useState('checking'); // 'checking', 'authorized', 'unauthorized'
  const [submitStatus, setSubmitStatus] = useState('');
  const navigate = useNavigate();

  const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api/developer',
    withCredentials: true
  });

  useEffect(() => {
    const validateDeveloper = async () => {
      try {
        await axiosInstance.get('/validate-faculty-register');
        setAuthStatus('authorized');
      } catch (err) {
        setAuthStatus('unauthorized');
        setTimeout(() => navigate('/developer'), 2000);
      }
    };
    validateDeveloper();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setSubmitStatus('Passwords do not match');
      return;
    }

    const devEmail = localStorage.getItem('developerEmail');
    if (!devEmail) {
      setSubmitStatus('Developer authentication missing. Please login as developer again.');
      return;
    }

    try {
      setSubmitStatus('Initiating WebAuthn protocol...');
      // 1. Get developer auth options challenge
      const resp = await axiosInstance.get(`/generate-auth?email=${devEmail}`);
      const options = resp.data;

      setSubmitStatus('Please verify your biometric credentials...');
      // 2. Scan Biometrics
      const asseResp = await startAuthentication({ optionsJSON: options });

      setSubmitStatus('Creating staff account...');
      // 3. Complete faculty registration
      const registerResp = await axiosInstance.post('/faculty-register', {
        email: devEmail,
        data: asseResp,
        newFacultyData: {
          role,
          fullname,
          newEmail: email,
          contact,
          department,
          adminCode,
          password
        }
      });

      setSubmitStatus(`Success: ${registerResp.data.message}`);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error(error);
      setSubmitStatus(`Registration failed: ${error.response?.data?.error || error.message}`);
    }
  };

  const isFaculty = role === 'faculty';
  const isAdmin = role === 'admin';

  if (authStatus === 'checking') {
    return (
      <div className="auth-wrapper">
        <CinematicBackground />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', position: 'relative', zIndex: 10 }}>
          <p style={{ color: '#0D9B8A', fontWeight: 'bold' }}>Validating Supreme Developer token...</p>
        </div>
      </div>
    );
  }

  if (authStatus === 'unauthorized') {
    return (
      <div className="auth-wrapper">
        <CinematicBackground />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', position: 'relative', zIndex: 10 }}>
          <p style={{ color: '#F4A62A', fontWeight: 'bold' }}>Access Denied. Supreme Developer Token Required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <CinematicBackground />

      <main className="auth-main">
        <div className="auth-form-wrapper staff-register-layout">

          {/* Brand Lock-up */}
          <div className="auth-brand">
            <div className="brand-logo">
              <span className="material-symbols-outlined">hub</span>
            </div>
            <span className="brand-text">JSS Connect</span>
          </div>

          {/* Role Selector Card */}
          <div className="auth-card">
            <header>
              <h2>Staff Onboarding.</h2>
              <p>Select a role and complete the secure registration form.</p>
            </header>

            {/* Role Radio Toggle */}
            <div className="role-selector">
              <label
                className={`role-option ${isFaculty ? 'active' : ''}`}
                htmlFor="role-faculty"
              >
                <input
                  type="radio"
                  id="role-faculty"
                  name="role"
                  value="faculty"
                  checked={isFaculty}
                  onChange={() => setRole('faculty')}
                />
                <span className="material-symbols-outlined role-icon">school</span>
                <span className="role-label">Faculty</span>
                <span className="role-desc">Instructor / Lecturer</span>
                <div className="role-check">
                  <span className="material-symbols-outlined">check</span>
                </div>
              </label>

              <label
                className={`role-option ${isAdmin ? 'active' : ''}`}
                htmlFor="role-admin"
              >
                <input
                  type="radio"
                  id="role-admin"
                  name="role"
                  value="admin"
                  checked={isAdmin}
                  onChange={() => setRole('admin')}
                />
                <span className="material-symbols-outlined role-icon">admin_panel_settings</span>
                <span className="role-label">Admin</span>
                <span className="role-desc">System Administrator</span>
                <div className="role-check">
                  <span className="material-symbols-outlined">check</span>
                </div>
              </label>
            </div>

            {/* Role Badge */}
            <div className={`role-badge ${role}`}>
              <span className="material-symbols-outlined">
                {isFaculty ? 'badge' : 'verified_user'}
              </span>
              <span>
                Registering as&nbsp;<strong>{isFaculty ? 'Faculty Member' : 'System Administrator'}</strong>
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              {submitStatus && (
                <p style={{ color: submitStatus.includes('Error') || submitStatus.includes('failed') ? '#EA4335' : '#0D9B8A', fontSize: '13px', textAlign: 'center', marginBottom: '10px' }}>
                  {submitStatus}
                </p>
              )}
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="sr-fullname">Full Legal Name</label>
                <div className="input-wrapper">
                  <input
                    id="sr-fullname"
                    placeholder={isFaculty ? 'Dr. Arthur Vance' : 'Admin: Jane Doe'}
                    type="text"
                    value={fullname}
                    onChange={e => setFullname(e.target.value)}
                    required
                    autoComplete="name"
                  />
                  <span className="material-symbols-outlined icon">person</span>
                </div>
              </div>

              <div className="form-grid">
                {/* Email */}
                <div className="form-group">
                  <label htmlFor="sr-email">Institutional Email</label>
                  <div className="input-wrapper">
                    <input
                    id="sr-email"
                    placeholder={isFaculty ? 'faculty@jss.edu' : 'admin@jss.edu'}
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                    <span className="material-symbols-outlined icon">alternate_email</span>
                  </div>
                </div>

                {/* Contact */}
                <div className="form-group">
                  <label htmlFor="sr-phone">Primary Contact</label>
                  <div className="input-wrapper">
                    <input
                    id="sr-phone"
                    placeholder="+91 98765 43210"
                    type="tel"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    required
                    autoComplete="tel"
                  />
                    <span className="material-symbols-outlined icon">phone</span>
                  </div>
                </div>
              </div>

              {/* Faculty-specific: Department */}
              {isFaculty && (
                <div className="form-group">
                  <label htmlFor="sr-dept">Department</label>
                  <div className="input-wrapper">
                    <select 
                    id="sr-dept" 
                    className="select-input"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    required={isFaculty}
                  >
                      <option value="">Select Department</option>
                      <option>Computer Science & Engineering</option>
                      <option>Electronics & Communication</option>
                      <option>Mechanical Engineering</option>
                      <option>Civil Engineering</option>
                      <option>Information Science</option>
                      <option>Mathematics</option>
                      <option>Physics</option>
                    </select>
                    <span className="material-symbols-outlined icon">account_tree</span>
                  </div>
                </div>
              )}

              {/* Admin-specific: Admin Code */}
              {isAdmin && (
                <div className="form-group">
                  <label htmlFor="sr-admin-code">Admin Authorization Code</label>
                  <div className="input-wrapper">
                    <input
                    id="sr-admin-code"
                    placeholder="ADMIN-XXXXX-XXXXX"
                    type="text"
                    value={adminCode}
                    onChange={e => setAdminCode(e.target.value)}
                    required={isAdmin}
                    autoComplete="off"
                  />
                    <span className="material-symbols-outlined icon">key</span>
                  </div>
                </div>
              )}

              <div className="form-grid">
                {/* Password */}
                <div className="form-group">
                  <label htmlFor="sr-password">Secure Password</label>
                  <div className="input-wrapper">
                    <input
                    id="sr-password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                    <span
                      className="material-symbols-outlined icon clickable"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label htmlFor="sr-confirm-password">Confirm Password</label>
                  <div className="input-wrapper">
                    <input
                    id="sr-confirm-password"
                    placeholder="••••••••"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                    <span
                      className="material-symbols-outlined icon clickable"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button className={`btn-primary btn-role-${role}`} type="submit">
                <span>
                  {isFaculty ? 'Register Faculty Account' : 'Register Admin Account'}
                </span>
                <span className="material-symbols-outlined icon-arrow">arrow_forward</span>
                <div className="btn-hover-layer"></div>
              </button>
            </form>

            <footer>
              <p>
                Already registered?&nbsp;
                <a href="/login">Authorize Session</a>
              </p>
            </footer>
          </div>

          {/* Global Navigation */}
          <nav className="global-nav">
            <a href="#">Security Policy</a>
            <a href="#">Global Terms</a>
            <a href="#">Support Hub</a>
          </nav>

          <p className="copyright">© 2024 JSS Connect Ecosystem</p>
        </div>
      </main>

      {/* Floating Help */}
      <button className="floating-help" aria-label="Get support">
        <span className="material-symbols-outlined">support_agent</span>
      </button>
    </div>
  );
};

export default StaffRegister;
