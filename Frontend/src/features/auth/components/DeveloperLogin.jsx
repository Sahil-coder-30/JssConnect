import React, { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DeveloperLogin = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api/developer',
    withCredentials: true
  });

  const handleLoginBiometric = async () => {
    try {
      if (!email) {
        setStatus('Error: Please enter your email first.');
        return;
      }

      setStatus('Fetching authentication options...');
      const resp = await axiosInstance.get(`/generate-auth?email=${email}`);
      const options = resp.data;

      setStatus('Please scan your fingerprint/face to login...');
      const asseResp = await startAuthentication({ optionsJSON: options });

      setStatus('Verifying login...');
      const verifyResp = await axiosInstance.post('/verify-auth', {
        email,
        data: asseResp,
      });

      setStatus('Login successful! Supreme Power Granted.');
      localStorage.setItem('developerEmail', email);
      setTimeout(() => {
        navigate('/staff-register');
      }, 1500);
    } catch (error) {
      console.error(error);
      setStatus(`Login failed: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Cinematic Background */}
      <div className="auth-bg">
        <div className="ambient-light-tl"></div>
        <div className="dot-grid"></div>
      </div>
      
      <main className="auth-main">
        <div className="auth-form-wrapper">
          <div className="auth-brand">
            <div className="brand-logo" style={{ color: '#F4A62A' }}>
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
            <span className="brand-text">JSS Connect Developer</span>
          </div>
          
          <div className="auth-card">
            <header>
              <h2>Supreme Access</h2>
              <p>Authenticate using your biometric credentials.</p>
            </header>
            
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Developer Email</label>
                <div className="input-wrapper">
                  <input 
                    placeholder="developer@jss.edu" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <span className="material-symbols-outlined icon">fingerprint</span>
                </div>
              </div>

              {status && <p style={{ color: '#0D9B8A', fontSize: '0.9rem', marginBottom: '1rem', marginTop: '10px' }}>{status}</p>}
              
              <button className="btn-primary" type="button" onClick={handleLoginBiometric} style={{ marginBottom: '1rem' }}>
                <span>Login with Biometrics</span>
                <span className="material-symbols-outlined icon-arrow">login</span>
                <div className="btn-hover-layer"></div>
              </button>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>Secure Enclave Backed Verification</span>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeveloperLogin;
