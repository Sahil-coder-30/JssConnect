import React, { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import axios from 'axios';

const ShieldCheck = () => (
  <svg width="72" height="72" viewBox="0 0 24 24" fill="none"
    style={{ display: 'block', margin: '0 auto 16px', animation: 'successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
    <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6L12 2z"
      fill="rgba(13,155,138,0.2)" stroke="#0D9B8A" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M9 12l2 2 4-4" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/*
  5-STEP SUPREME GATEWAY:
  Step 0: Lock Screen  — Enter Master ID & Password
  Step 1: Unlocking   — Cinematic lock-opening animation
  Step 2: Email Gate  — Enter developer email & send OTP
  Step 3: OTP Gate    — Enter 6-digit code from email
  Step 4: Biometric   — Register fingerprint / face ID
  Step 5: Success     — Passkey created, supreme power granted
*/

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api/developer',
  withCredentials: true,
});

/* ─── Inline styles for zero import dependency ─────────────────────────── */
const S = {
  wrapper: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 60% 0%, #0d1b2e 0%, #05080f 70%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    overflow: 'hidden',
    position: 'relative',
  },
  // ambient orbs
  orb1: {
    position: 'fixed', top: '-15%', right: '-10%',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,82,204,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'fixed', bottom: '-10%', left: '-5%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(13,155,138,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  // grid overlay
  grid: {
    position: 'fixed', inset: 0, pointerEvents: 'none',
    backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
  },
  card: (unlocked) => ({
    position: 'relative',
    width: '420px',
    background: 'rgba(10,18,32,0.85)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '48px 40px',
    backdropFilter: 'blur(24px)',
    boxShadow: unlocked
      ? '0 0 60px rgba(13,155,138,0.25), 0 25px 80px rgba(0,0,0,0.5)'
      : '0 0 60px rgba(0,82,204,0.2), 0 25px 80px rgba(0,0,0,0.5)',
    transition: 'box-shadow 0.8s ease',
    zIndex: 10,
  }),
  // Blur overlay on top of the card for step > 0
  cardBlur: {
    position: 'absolute', inset: 0, borderRadius: '24px',
    backdropFilter: 'blur(12px)',
    background: 'rgba(5,8,15,0.55)',
    zIndex: 20,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '24px',
  },
  lockIconWrap: (unlocked) => ({
    width: '80px', height: '80px',
    borderRadius: '50%',
    background: unlocked
      ? 'linear-gradient(135deg, #0D9B8A, #06b6a2)'
      : 'linear-gradient(135deg, #0052cc, #1a6ef7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: unlocked
      ? '0 0 30px rgba(13,155,138,0.5)'
      : '0 0 30px rgba(0,82,204,0.5)',
    transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)',
    transform: unlocked ? 'scale(1.1)' : 'scale(1)',
    animation: unlocked ? 'none' : 'lockPulse 2s ease-in-out infinite',
  }),
  lockIcon: { fontSize: '36px', color: '#fff' },
  lockTitle: {
    fontSize: '22px', fontWeight: '700', color: '#fff',
    textAlign: 'center', letterSpacing: '-0.3px',
  },
  lockSub: {
    fontSize: '13px', color: '#64748b',
    textAlign: 'center', lineHeight: '1.5',
  },
  label: {
    display: 'block', fontSize: '12px', fontWeight: '600',
    color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase',
    marginBottom: '8px',
  },
  inputWrap: {
    position: 'relative', marginBottom: '18px',
  },
  input: {
    width: '100%', padding: '14px 44px 14px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '12px', color: '#e2e8f0',
    fontSize: '15px', outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputIcon: {
    position: 'absolute', right: '14px', top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '18px', color: '#475569',
    userSelect: 'none',
  },
  btn: (color = '#0052cc') => ({
    width: '100%', padding: '15px',
    background: `linear-gradient(135deg, ${color}, ${color}dd)`,
    border: 'none', borderRadius: '12px',
    color: '#fff', fontSize: '15px', fontWeight: '600',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '10px',
    marginTop: '8px',
    boxShadow: `0 4px 20px ${color}44`,
    transition: 'transform 0.2s, box-shadow 0.2s',
  }),
  error: {
    fontSize: '13px', color: '#f87171',
    marginTop: '12px', textAlign: 'center',
    padding: '10px', background: 'rgba(248,113,113,0.08)',
    borderRadius: '8px', border: '1px solid rgba(248,113,113,0.2)',
  },
  success: {
    fontSize: '13px', color: '#34d399',
    marginTop: '12px', textAlign: 'center',
    padding: '10px', background: 'rgba(52,211,153,0.08)',
    borderRadius: '8px', border: '1px solid rgba(52,211,153,0.2)',
  },
  info: {
    fontSize: '13px', color: '#60a5fa',
    marginTop: '12px', textAlign: 'center',
    padding: '10px', background: 'rgba(96,165,250,0.08)',
    borderRadius: '8px', border: '1px solid rgba(96,165,250,0.2)',
  },
  stepIndicator: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', marginBottom: '32px',
  },
  dot: (active, done) => ({
    width: done ? '24px' : active ? '32px' : '8px',
    height: '8px', borderRadius: '4px',
    background: done ? '#0D9B8A' : active ? '#0052cc' : 'rgba(255,255,255,0.15)',
    transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
  }),
  brand: {
    textAlign: 'center', marginBottom: '32px',
  },
  brandIcon: {
    width: '56px', height: '56px', borderRadius: '16px',
    background: 'linear-gradient(135deg, #0052cc, #0D9B8A)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 12px',
    boxShadow: '0 8px 24px rgba(0,82,204,0.3)',
  },
  brandText: {
    fontSize: '13px', color: '#475569', fontWeight: '500',
    letterSpacing: '1.2px', textTransform: 'uppercase',
  },
  heading: {
    fontSize: '26px', fontWeight: '800', color: '#f1f5f9',
    marginBottom: '6px', letterSpacing: '-0.5px',
  },
  subheading: {
    fontSize: '14px', color: '#475569', lineHeight: '1.5',
    marginBottom: '28px',
  },
  scanWrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '16px', padding: '24px',
  },
  fingerprint: (scanning) => ({
    fontSize: '72px', color: scanning ? '#0D9B8A' : '#1e40af',
    animation: scanning ? 'scanPulse 1s ease-in-out infinite' : 'none',
    transition: 'color 0.4s ease',
    filter: scanning ? 'drop-shadow(0 0 20px rgba(13,155,138,0.6))' : 'none',
  }),
  otpInput: {
    width: '100%', padding: '18px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '12px', color: '#f1f5f9',
    fontSize: '28px', fontWeight: '700',
    letterSpacing: '10px', textAlign: 'center',
    outline: 'none', boxSizing: 'border-box',
    marginBottom: '16px',
  },
  successWrap: {
    textAlign: 'center', padding: '16px 0',
  },
  successIcon: {
    fontSize: '64px', color: '#34d399',
    animation: 'successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
    display: 'block', marginBottom: '16px',
  },
};

/* ─── Keyframes injected once ───────────────────────────────────────────── */
const KEYFRAMES = `
  @keyframes lockPulse {
    0%,100% { box-shadow: 0 0 30px rgba(0,82,204,0.5); transform: scale(1); }
    50% { box-shadow: 0 0 50px rgba(0,82,204,0.8); transform: scale(1.05); }
  }
  @keyframes scanPulse {
    0%,100% { opacity: 1; filter: drop-shadow(0 0 16px rgba(13,155,138,0.6)); }
    50% { opacity: 0.6; filter: drop-shadow(0 0 30px rgba(13,155,138,1)); }
  }
  @keyframes successPop {
    0% { transform: scale(0) rotate(-20deg); opacity: 0; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes shakeX {
    0%,100% { transform: translateX(0); }
    20% { transform: translateX(-10px); }
    40% { transform: translateX(10px); }
    60% { transform: translateX(-8px); }
    80% { transform: translateX(8px); }
  }
`;

/* ─── Helper ─────────────────────────────────────────────────────────────── */
const StatusMsg = ({ msg, type }) => {
  if (!msg) return null;
  const style = type === 'error' ? S.error : type === 'success' ? S.success : S.info;
  return <p style={{ ...style, animation: 'fadeIn 0.3s ease' }}>{msg}</p>;
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
const DeveloperRegister = () => {
  const [step, setStep] = useState(0);
  // 0 = lock screen, 1 = unlocking anim, 2 = email entry, 3 = otp entry, 4 = biometric, 5 = success
  const [devId, setDevId] = useState('');
  const [devPassword, setDevPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState({ msg: '', type: 'info' });
  const [shakeCard, setShakeCard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  /* ── Step 0 → 1: Verify Master Credentials (local check, then unlock anim) */
  const handleUnlock = async () => {
    if (!devId || !devPassword) {
      setStatus({ msg: 'Both fields are required.', type: 'error' });
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 500);
      return;
    }
    setIsLoading(true);
    setStatus({ msg: 'Verifying master credentials...', type: 'info' });
    try {
      await axiosInstance.post('/verify-master', { devId, devPassword });
      // Credentials confirmed — play the cinematic unlock animation
      setStep(1);
      await new Promise(r => setTimeout(r, 1400));
      setStep(2);
      setStatus({ msg: '', type: 'info' });
    } catch (err) {
      setStep(0);
      setStatus({ msg: err?.response?.data?.error || 'Access Denied. Invalid credentials.', type: 'error' });
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 500);
      // Clear fields on wrong credentials
      setDevId('');
      setDevPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Step 2 → 3: Send OTP to email (also validates master creds server-side) */
  const handleSendOtp = async () => {
    if (!email) {
      setStatus({ msg: 'Please enter your developer email.', type: 'error' });
      return;
    }
    setIsLoading(true);
    setStatus({ msg: 'Sending verification code...', type: 'info' });
    try {
      await axiosInstance.post('/send-otp', { email, devId, devPassword });
      setStep(3);
      setStatus({ msg: `Code sent to ${email}. Check your inbox!`, type: 'success' });
    } catch (err) {
      setStatus({ msg: err?.response?.data?.error || 'Failed to send OTP.', type: 'error' });
      // If credentials were wrong, send back to lock
      if (err?.response?.status === 403) {
        setShakeCard(true);
        setTimeout(() => { setShakeCard(false); setStep(0); }, 800);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Step 3 → 4: Generate WebAuthn options (validates OTP server-side) */
  const handleVerifyOtpAndStartBiometric = async () => {
    if (otp.length !== 6) {
      setStatus({ msg: 'Enter the full 6-digit code.', type: 'error' });
      return;
    }
    setIsLoading(true);
    setStatus({ msg: 'Verifying code...', type: 'info' });
    try {
      const resp = await axiosInstance.post('/generate-registration', {
        email, devId, devPassword, otp,
      });
      const options = resp.data;
      setStep(4);
      setStatus({ msg: 'OTP verified! Now scan your biometric.', type: 'success' });

      // kick off biometric scan automatically after a brief pause
      setTimeout(async () => {
        setScanning(true);
        setStatus({ msg: 'Waiting for fingerprint / Face ID...', type: 'info' });
        try {
          const attResp = await startRegistration({ optionsJSON: options });
          setStatus({ msg: 'Verifying with server...', type: 'info' });
          await axiosInstance.post('/verify-registration', { email, data: attResp });
          setScanning(false);
          setStep(5);
          setStatus({ msg: 'Supreme access granted!', type: 'success' });
        } catch (biometricErr) {
          setScanning(false);
          setStatus({ msg: biometricErr?.response?.data?.error || biometricErr.message, type: 'error' });
        }
      }, 1000);
    } catch (err) {
      setStatus({ msg: err?.response?.data?.error || 'OTP verification failed.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Retry biometric if cancelled ─────────────────────────────────────── */
  const handleRetryBiometric = async () => {
    setScanning(true);
    setStatus({ msg: 'Waiting for fingerprint / Face ID...', type: 'info' });
    try {
      // Need fresh options — regenerate
      const resp = await axiosInstance.post('/generate-registration', {
        email, devId, devPassword, otp,
      });
      const attResp = await startRegistration({ optionsJSON: resp.data });
      setStatus({ msg: 'Verifying with server...', type: 'info' });
      await axiosInstance.post('/verify-registration', { email, data: attResp });
      setScanning(false);
      setStep(5);
    } catch (err) {
      setScanning(false);
      setStatus({ msg: err?.response?.data?.error || err.message, type: 'error' });
    }
  };

  /* ─── Render helpers ──────────────────────────────────────────────────── */
  const StepDots = ({ current }) => (
    <div style={S.stepIndicator}>
      {[2, 3, 4, 5].map((s, i) => (
        <div key={i} style={S.dot(current === s, current > s)} />
      ))}
    </div>
  );

  const cardAnimation = shakeCard ? 'shakeX 0.5s ease' : 'none';

  /* ══════════════════════════════════════════════════════════════════════ */
  return (
    <div style={S.wrapper}>
      <style>{KEYFRAMES}</style>
      <div style={S.orb1} />
      <div style={S.orb2} />
      <div style={S.grid} />

      {/* ═══ STEPS 2-5: Background card with blurred form ════════════════ */}
      {step >= 1 && (
        <div style={{ ...S.card(step >= 2), animation: 'fadeIn 0.5s ease', position: 'relative' }}
          key="background-card">
          {/* Brand */}
          <div style={S.brand}>
            <div style={S.brandIcon}>
              <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '28px' }}>
                admin_panel_settings
              </span>
            </div>
            <div style={S.brandText}>JSS Connect · Supreme Gateway</div>
          </div>

          {/* ─── STEP 1: Unlocking animation ─────────────────────────── */}
          {step === 1 && (
            <div style={{ ...S.cardBlur, animation: 'fadeIn 0.3s ease' }}>
              <div style={{ ...S.lockIconWrap(true), animation: 'none', transform: 'scale(1.15)', boxShadow: '0 0 50px rgba(13,155,138,0.7)' }}>
                <span className="material-symbols-outlined" style={S.lockIcon}>lock_open</span>
              </div>
              <p style={{ ...S.lockTitle, color: '#34d399', animation: 'slideUp 0.5s ease 0.3s both' }}>
                Credentials Verified
              </p>
              <p style={{ ...S.lockSub, animation: 'slideUp 0.5s ease 0.5s both' }}>
                Unlocking developer gateway...
              </p>
            </div>
          )}

          {/* ─── STEP 2: Email entry ──────────────────────────────────── */}
          {step === 2 && (
            <div style={{ animation: 'slideUp 0.5s ease' }}>
              <StepDots current={2} />
              <h2 style={S.heading}>Developer Email</h2>
              <p style={S.subheading}>Enter the email address to bind this device to.</p>
              <label style={S.label}>Developer Email</label>
              <div style={S.inputWrap}>
                <input
                  style={S.input}
                  placeholder="developer@jss.edu"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                  autoFocus
                />
                <span className="material-symbols-outlined" style={S.inputIcon}>alternate_email</span>
              </div>
              <StatusMsg {...status} />
              <button style={S.btn('#0D9B8A')} onClick={handleSendOtp} disabled={isLoading}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span>
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
          )}

          {/* ─── STEP 3: OTP entry ───────────────────────────────────── */}
          {step === 3 && (
            <div style={{ animation: 'slideUp 0.5s ease' }}>
              <StepDots current={3} />
              <h2 style={S.heading}>Check Your Email</h2>
              <p style={S.subheading}>
                Enter the 6-digit code sent to<br />
                <strong style={{ color: '#60a5fa' }}>{email}</strong>
              </p>
              <StatusMsg {...status} />
              <input
                style={S.otpInput}
                placeholder="• • • • • •"
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && handleVerifyOtpAndStartBiometric()}
                autoFocus
              />
              <button style={S.btn('#0052cc')} onClick={handleVerifyOtpAndStartBiometric} disabled={isLoading || otp.length !== 6}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>verified</span>
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>
              <button
                style={{ ...S.btn('transparent'), marginTop: '8px', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', fontSize: '13px' }}
                onClick={handleSendOtp}
              >
                Resend Code
              </button>
            </div>
          )}

          {/* ─── STEP 4: Biometric scan ───────────────────────────────── */}
          {step === 4 && (
            <div style={{ animation: 'slideUp 0.5s ease' }}>
              <StepDots current={4} />
              <h2 style={S.heading}>Biometric Lock-in</h2>
              <p style={S.subheading}>Place your finger on the sensor or look at the camera to register your identity.</p>
              <div style={S.scanWrap}>
                <span className="material-symbols-outlined" style={S.fingerprint(scanning)}>
                  fingerprint
                </span>
                <p style={{ color: scanning ? '#34d399' : '#475569', fontSize: '14px', fontWeight: '500', transition: 'color 0.3s' }}>
                  {scanning ? 'Scanning...' : 'Scanner ready'}
                </p>
              </div>
              <StatusMsg {...status} />
              {!scanning && (
                <button style={S.btn('#7c3aed')} onClick={handleRetryBiometric}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>fingerprint</span>
                  Start Biometric Scan
                </button>
              )}
            </div>
          )}

          {/* ─── STEP 5: Success ─────────────────────────────────────── */}
          {step === 5 && (
            <div style={{ ...S.successWrap, animation: 'slideUp 0.6s ease' }}>
              <StepDots current={5} />
              <ShieldCheck />
              <h2 style={{ ...S.heading, color: '#34d399' }}>Supreme Power Bound</h2>
              <p style={{ ...S.subheading, color: '#10b981' }}>
                Your biometric is now cryptographically sealed to this developer account.
              </p>
              <div style={{ padding: '16px', background: 'rgba(52,211,153,0.08)', borderRadius: '12px', border: '1px solid rgba(52,211,153,0.2)', marginBottom: '24px' }}>
                <p style={{ fontSize: '13px', color: '#34d399', margin: 0 }}>
                  ✓ Master credentials verified<br />
                  ✓ Email ownership confirmed<br />
                  ✓ OTP cross-verified<br />
                  ✓ Biometric signature registered<br />
                  ✓ Passkey sealed in secure enclave
                </p>
              </div>
              <button style={S.btn('#0052cc')} onClick={() => window.location.href = '/developer'}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>login</span>
                Proceed to Developer Login
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ STEP 0: LOCK SCREEN OVERLAY ════════════════════════════════ */}
      {step === 0 && (
        <div style={{
          ...S.card(false),
          animation: cardAnimation !== 'none' ? cardAnimation : 'slideUp 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {/* Brand */}
          <div style={S.brand}>
            <div style={S.brandIcon}>
              <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '28px' }}>
                admin_panel_settings
              </span>
            </div>
            <div style={S.brandText}>JSS Connect · Supreme Gateway</div>
          </div>

          {/* Animated lock icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={S.lockIconWrap(false)}>
              <span className="material-symbols-outlined" style={S.lockIcon}>lock</span>
            </div>
          </div>

          <h2 style={{ ...S.heading, textAlign: 'center' }}>Restricted Access</h2>
          <p style={{ ...S.subheading, textAlign: 'center' }}>
            This page is locked. Provide master credentials to proceed.
          </p>

          <label style={S.label}>Master Developer ID</label>
          <div style={S.inputWrap}>
            <input
              style={S.input}
              placeholder="Enter Developer ID"
              type="text"
              value={devId}
              onChange={e => setDevId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              autoFocus
            />
            <span className="material-symbols-outlined" style={S.inputIcon}>badge</span>
          </div>

          <label style={S.label}>Master Password</label>
          <div style={S.inputWrap}>
            <input
              style={S.input}
              placeholder="••••••••••••"
              type="password"
              value={devPassword}
              onChange={e => setDevPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            />
            <span className="material-symbols-outlined" style={S.inputIcon}>lock</span>
          </div>

          <StatusMsg {...status} />

          <button
            style={{ ...S.btn('#0052cc'), marginTop: '8px' }}
            onClick={handleUnlock}
            disabled={isLoading}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {isLoading ? 'hourglass_empty' : 'lock_open'}
            </span>
            {isLoading ? 'Verifying...' : 'Unlock Gateway'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#334155' }}>
            Unauthorized access attempts are logged and monitored.
          </p>
        </div>
      )}
    </div>
  );
};

export default DeveloperRegister;
