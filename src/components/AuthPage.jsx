import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  GraduationCap,
  Briefcase,
  Layers,
  AlertCircle,
  X,
  KeyRound,
  Check
} from 'lucide-react';
import { hashPassword, validateEmail, checkPasswordStrength } from '../utils/securityHelper';
import {
  isSupabaseConfigured,
  cloudSignUp,
  cloudSignIn,
  cloudSignInWithGoogle,
  cloudResetPassword,
  formatSupabaseUser
} from '../utils/supabaseClient';
import '../styles/auth-page.css';

export const AuthPage = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('kurnia@keepwork.id');
  const [loginPassword, setLoginPassword] = useState('kurnia123');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regCategory, setRegCategory] = useState('Mahasiswa / Pelajar');

  // Reset Password Modal States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetMessage, setResetMessage] = useState({ type: '', text: '' });
  const [resetLoading, setResetLoading] = useState(false);

  // Password strength calculation
  const pwdStrength = checkPasswordStrength(regPassword);
  const isConfirmMatched = regConfirmPassword.length > 0 && regPassword === regConfirmPassword;
  const isConfirmMismatched = regConfirmPassword.length > 0 && regPassword !== regConfirmPassword;

  const handleLogin = async (e) => {
    e?.preventDefault();
    setErrorMessage('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Silakan isi email dan password Anda.');
      return;
    }

    if (!validateEmail(loginEmail)) {
      setErrorMessage('Format alamat email tidak valid.');
      return;
    }

    setLoading(true);

    try {
      // 1. Official Default Demo Account (Instant 1-Click for offline evaluation)
      if (
        loginEmail.trim().toLowerCase() === 'kurnia@flowwork.id' &&
        loginPassword === 'kurnia123'
      ) {
        const userSession = {
          id: 'kurnia',
          name: 'Kurnia Pratama',
          email: 'kurnia@flowwork.id',
          role: 'Workspace Owner & Lead',
          category: 'Mahasiswa / Pelajar',
          avatar: 'K',
          avatarColor: '#00a884',
          token: 'auth_demo_' + Date.now(),
          loginAt: new Date().toISOString()
        };
        onLoginSuccess(userSession, rememberMe);
        return;
      }

      // 2. Try Supabase Cloud Login first if configured
      if (isSupabaseConfigured) {
        try {
          const cloudData = await cloudSignIn(loginEmail, loginPassword);
          if (cloudData?.user) {
            const userSession = formatSupabaseUser(cloudData.user, cloudData.session);
            onLoginSuccess(userSession, rememberMe);
            return;
          }
        } catch (cloudErr) {
          console.log('Supabase sign-in note:', cloudErr.message);
          // If message is specifically wrong credentials and not network error, show it
          if (cloudErr.message && !cloudErr.message.includes('FetchError') && !cloudErr.message.includes('NetworkError')) {
            // Check if account exists locally before blocking
            const savedAccounts = JSON.parse(localStorage.getItem('flowwork_registered_accounts') || '[]');
            const localMatched = savedAccounts.find(
              (acc) => acc.email.toLowerCase() === loginEmail.trim().toLowerCase()
            );
            if (!localMatched) {
              setErrorMessage('Email atau password salah. Pastikan akun sudah terdaftar di Supabase.');
              setLoading(false);
              return;
            }
          }
        }
      }

      // 3. Fallback to Local Encrypted Accounts (Offline-first capability)
      const inputHash = await hashPassword(loginPassword);
      const savedAccounts = JSON.parse(localStorage.getItem('flowwork_registered_accounts') || '[]');
      const matched = savedAccounts.find(
        (acc) => acc.email.toLowerCase() === loginEmail.trim().toLowerCase()
      );

      if (matched) {
        const isPasswordCorrect =
          matched.passwordHash === inputHash ||
          matched.password === loginPassword;

        if (!isPasswordCorrect) {
          setErrorMessage('Password yang Anda masukkan salah.');
          setLoading(false);
          return;
        }

        const userSession = {
          id: matched.id,
          name: matched.name,
          email: matched.email,
          role: matched.role || matched.category,
          category: matched.category,
          avatar: matched.avatar || matched.name.slice(0, 2).toUpperCase(),
          avatarColor: matched.avatarColor || '#6366f1',
          token: 'auth_' + Date.now(),
          loginAt: new Date().toISOString()
        };

        onLoginSuccess(userSession, rememberMe);
        return;
      }

      setErrorMessage('Email tidak terdaftar atau password salah. Silakan periksa kembali atau buat akun baru.');
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    setErrorMessage('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regConfirmPassword.trim()) {
      setErrorMessage('Lengkapi semua kolom formulir pendaftaran.');
      return;
    }

    if (!validateEmail(regEmail)) {
      setErrorMessage('Format email tidak valid (contoh: nama@kampus.ac.id).');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password minimal terdiri dari 6 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok dengan password yang dibuat.');
      return;
    }

    setLoading(true);

    try {
      const avatarColors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
      const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
      const passwordHash = await hashPassword(regPassword);

      let createdUserSession = null;

      // 1. Try Supabase Cloud Registration
      if (isSupabaseConfigured) {
        try {
          const cloudData = await cloudSignUp(regEmail, regPassword, {
            name: regName.trim(),
            category: regCategory,
            avatar: regName.trim().slice(0, 2).toUpperCase(),
            avatarColor: randomColor
          });

          if (cloudData?.user) {
            createdUserSession = formatSupabaseUser(cloudData.user, cloudData.session);
          }
        } catch (cloudErr) {
          console.warn('Supabase cloud signup notice:', cloudErr);
          if (cloudErr.message?.toLowerCase().includes('already registered')) {
            setErrorMessage('Alamat email sudah terdaftar di Supabase. Silakan langsung masuk.');
            setLoading(false);
            return;
          }
        }
      }

      // 2. Persist locally so user can always work offline
      const savedAccounts = JSON.parse(localStorage.getItem('flowwork_registered_accounts') || '[]');
      const existingIdx = savedAccounts.findIndex(
        (acc) => acc.email.toLowerCase() === regEmail.trim().toLowerCase()
      );

      const localAccount = {
        id: createdUserSession?.id || 'acc-' + Date.now(),
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        passwordHash: passwordHash,
        category: regCategory,
        role: regCategory,
        avatar: regName.trim().slice(0, 2).toUpperCase(),
        avatarColor: randomColor,
        isCloud: Boolean(createdUserSession),
        createdAt: new Date().toISOString()
      };

      if (existingIdx !== -1) {
        savedAccounts[existingIdx] = localAccount;
      } else {
        savedAccounts.push(localAccount);
      }
      localStorage.setItem('flowwork_registered_accounts', JSON.stringify(savedAccounts));

      const userSession = createdUserSession || {
        id: localAccount.id,
        name: localAccount.name,
        email: localAccount.email,
        role: localAccount.category,
        category: localAccount.category,
        avatar: localAccount.avatar,
        avatarColor: localAccount.avatarColor,
        token: 'auth_' + Date.now(),
        loginAt: new Date().toISOString()
      };

      onLoginSuccess(userSession, true);
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menyimpan akun baru. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      id: 'guest-' + Date.now(),
      name: 'Pengguna Tamu',
      email: 'tamu@flowwork.id',
      role: 'Tamu Eksplorasi',
      category: 'Mahasiswa / Pelajar',
      avatar: 'T',
      avatarColor: '#06b6d4',
      token: 'guest_' + Date.now(),
      isGuest: true,
      loginAt: new Date().toISOString()
    };
    onLoginSuccess(guestUser, false);
  };

  const handleGoogleLogin = async () => {
    if (isSupabaseConfigured) {
      try {
        setLoading(true);
        await cloudSignInWithGoogle();
        return;
      } catch (err) {
        console.warn('Google cloud OAuth error, using local fallback:', err);
      } finally {
        setLoading(false);
      }
    }

    // Local Simulation Fallback
    setLoading(true);
    setTimeout(() => {
      const googleUser = {
        id: 'google-user-' + Date.now(),
        name: 'Kurnia Pratama',
        email: 'kurnia.pratama@gmail.com',
        role: 'Mahasiswa & Freelancer',
        category: 'Mahasiswa / Pelajar',
        avatar: 'G',
        avatarColor: '#ea4335',
        token: 'google_token_' + Date.now(),
        loginAt: new Date().toISOString()
      };
      setLoading(false);
      onLoginSuccess(googleUser, true);
    }, 450);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetMessage({ type: '', text: '' });

    if (!resetEmail.trim() || !resetNewPassword.trim()) {
      setResetMessage({ type: 'error', text: 'Semua kolom wajib diisi.' });
      return;
    }

    if (!validateEmail(resetEmail)) {
      setResetMessage({ type: 'error', text: 'Format email tidak valid.' });
      return;
    }

    if (resetNewPassword.length < 6) {
      setResetMessage({ type: 'error', text: 'Password baru minimal 6 karakter.' });
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    setResetLoading(true);

    try {
      // 1. If Supabase configured, request password reset email
      if (isSupabaseConfigured) {
        try {
          await cloudResetPassword(resetEmail);
          setResetMessage({
            type: 'success',
            text: 'Tautan pemulihan kata sandi telah dikirimkan ke email Anda! Silakan periksa kotak masuk email Anda.'
          });
          setTimeout(() => {
            setShowResetModal(false);
            setResetMessage({ type: '', text: '' });
          }, 3000);
          return;
        } catch (cloudErr) {
          console.warn('Supabase reset password note:', cloudErr);
        }
      }

      // 2. Local fallback reset
      const savedAccounts = JSON.parse(localStorage.getItem('flowwork_registered_accounts') || '[]');
      const accountIndex = savedAccounts.findIndex(
        (acc) => acc.email.toLowerCase() === resetEmail.trim().toLowerCase()
      );

      if (accountIndex === -1 && resetEmail.trim().toLowerCase() !== 'kurnia@flowwork.id') {
        setResetMessage({
          type: 'error',
          text: 'Akun dengan email ini belum terdaftar di perangkat ini.'
        });
        setResetLoading(false);
        return;
      }

      const newHash = await hashPassword(resetNewPassword);

      if (accountIndex !== -1) {
        savedAccounts[accountIndex].passwordHash = newHash;
        delete savedAccounts[accountIndex].password;
        localStorage.setItem('flowwork_registered_accounts', JSON.stringify(savedAccounts));
      }

      setResetMessage({
        type: 'success',
        text: 'Password berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.'
      });

      setTimeout(() => {
        setShowResetModal(false);
        setLoginEmail(resetEmail.trim());
        setLoginPassword('');
        setResetMessage({ type: '', text: '' });
      }, 1500);
    } catch (err) {
      setResetMessage({ type: 'error', text: 'Gagal mengatur ulang password.' });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flow-auth-container">
      {/* Background Ambient Glows */}
      <div className="flow-auth-glow-1" />
      <div className="flow-auth-glow-2" />

      {/* Left Brand Showcase Section */}
      <div className="flow-auth-showcase">
        <div>
          <div className="flow-auth-brand-logo">
            <div className="flow-auth-logo-icon">K</div>
            <div>
              <div className="flow-auth-brand-name">KeepWork</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
                <div className="flow-auth-brand-badge">B2C Productivity OS</div>
                {isSupabaseConfigured && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.68rem',
                      color: 'var(--flow-accent-emerald)',
                      background: 'rgba(16, 185, 129, 0.12)',
                      padding: '2px 7px',
                      borderRadius: 999,
                      fontWeight: 700
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--flow-accent-emerald)' }} />
                    Supabase Cloud
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 44 }} className="flow-auth-hero-text">
            <h1>Kelola Kuliah, Skripsi & Proyek Klien Tanpa Pusing</h1>
            <p>
              Papan Kanban interaktif, Pomodoro focus timer, catatan instan, dan asisten cerdas KeepWork AI dalam satu platform modern.
            </p>

            <div className="flow-auth-feature-list">
              <div className="flow-auth-feature-item">
                <div className="flow-auth-feature-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--flow-primary)' }}>
                  <Zap size={16} />
                </div>
                <span>Offline-First: Data tersimpan aman & privat di perangkat Anda</span>
              </div>

              <div className="flow-auth-feature-item">
                <div className="flow-auth-feature-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--flow-accent-cyan)' }}>
                  <Layers size={16} />
                </div>
                <span>Multi-Workspace: Pisahkan ruang kuliah, kerjaan, & rutinitas harian</span>
              </div>

              <div className="flow-auth-feature-item">
                <div className="flow-auth-feature-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--flow-accent-emerald)' }}>
                  <Sparkles size={16} />
                </div>
                <span>KeepWork AI: Analisis prioritas tugas & evaluasi progres mingguan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Quote */}
        <div className="flow-auth-testimonial-card">
          <div style={{ display: 'flex', gap: 4, color: '#f59e0b', fontSize: '0.82rem', marginBottom: 8 }}>
            ★★★★★
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--flow-text-main)', margin: '0 0 10px', fontStyle: 'italic', lineHeight: 1.5 }}>
            "KeepWork bener-bener ngebantu gue nuntasin skripsi tepat waktu sambil tetap handle 3 proyek klien freelance dengan rapi."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#ec4899',
                color: '#fff',
                fontSize: '0.74rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              SC
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>Sarah Chen</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--flow-text-muted)' }}>Mahasiswa Semester 8 & UI/UX Designer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Auth Form Section */}
      <div className="flow-auth-form-wrapper">
        <div className="flow-auth-card">
          {/* Tabs */}
          <div className="flow-auth-tabs">
            <button
              type="button"
              className={`flow-auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('login');
                setErrorMessage('');
              }}
            >
              Masuk
            </button>
            <button
              type="button"
              className={`flow-auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('register');
                setErrorMessage('');
              }}
            >
              Daftar Akun Baru
            </button>
          </div>

          {/* Error Alert if any */}
          {errorMessage && (
            <div className="flow-auth-error-alert">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form: LOGIN */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="flow-auth-field">
                <label className="flow-auth-label">
                  <Mail size={13} />
                  Alamat Email
                </label>
                <div className="flow-auth-input-wrap">
                  <Mail size={16} className="flow-auth-input-icon" />
                  <input
                    type="email"
                    className="flow-auth-input"
                    placeholder="nama@kampus.ac.id"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="flow-auth-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="flow-auth-label">
                    <Lock size={13} />
                    Password
                  </label>
                  <span
                    style={{ fontSize: '0.72rem', color: 'var(--flow-primary)', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => {
                      setResetEmail(loginEmail);
                      setShowResetModal(true);
                    }}
                  >
                    Lupa Password?
                  </span>
                </div>
                <div className="flow-auth-input-wrap">
                  <Lock size={16} className="flow-auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="flow-auth-input"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="flow-auth-input-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 16px', fontSize: '0.78rem' }}>
                <input
                  type="checkbox"
                  id="rememberMeCheck"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--flow-primary)', cursor: 'pointer' }}
                />
                <label htmlFor="rememberMeCheck" style={{ color: 'var(--flow-text-subtle)', cursor: 'pointer' }}>
                  Ingat sesi login di perangkat ini
                </label>
              </div>

              <button
                type="submit"
                className="flow-auth-submit-btn"
                disabled={loading}
              >
                {loading ? 'Memverifikasi...' : 'Masuk ke Ruang Kerja'}
                {!loading && <ArrowRight size={16} />}
              </button>

              {/* Demo Account Quick Access */}
              <div className="flow-auth-demo-box">
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>
                    Akun Demo: Kurnia
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--flow-text-muted)' }}>
                    kurnia@flowwork.id • kurnia123
                  </div>
                </div>
                <button
                  type="button"
                  className="tab-btn"
                  style={{ fontSize: '0.74rem', padding: '4px 10px', background: 'var(--flow-bg-surface)' }}
                  onClick={() => {
                    setLoginEmail('kurnia@flowwork.id');
                    setLoginPassword('kurnia123');
                    handleLogin();
                  }}
                >
                  Masuk 1-Klik
                </button>
              </div>

              <div className="flow-auth-divider">
                <span>atau</span>
              </div>

              <button
                type="button"
                className="flow-auth-social-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Lanjut dengan Google</span>
              </button>

              <div
                className="flow-auth-guest-link"
                onClick={handleGuestLogin}
              >
                Atau masuk sebagai tamu (coba tanpa akun) →
              </div>
            </form>
          ) : (
            /* Form: REGISTER */
            <form onSubmit={handleRegister}>
              <div className="flow-auth-field">
                <label className="flow-auth-label">
                  <User size={13} />
                  Nama Lengkap
                </label>
                <div className="flow-auth-input-wrap">
                  <User size={16} className="flow-auth-input-icon" />
                  <input
                    type="text"
                    className="flow-auth-input"
                    placeholder="Contoh: Budi Santoso"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="flow-auth-field">
                <label className="flow-auth-label">
                  <Mail size={13} />
                  Alamat Email
                </label>
                <div className="flow-auth-input-wrap">
                  <Mail size={16} className="flow-auth-input-icon" />
                  <input
                    type="email"
                    className="flow-auth-input"
                    placeholder="budi@kampus.ac.id"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Create Password */}
              <div className="flow-auth-field">
                <label className="flow-auth-label">
                  <Lock size={13} />
                  Buat Password
                </label>
                <div className="flow-auth-input-wrap">
                  <Lock size={16} className="flow-auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="flow-auth-input"
                    placeholder="Minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="flow-auth-input-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {regPassword.length > 0 && (
                  <div className="flow-auth-strength-wrap">
                    <div className="flow-auth-strength-bars">
                      <div
                        className="flow-auth-strength-bar"
                        style={{ background: pwdStrength.score >= 1 ? pwdStrength.color : undefined }}
                      />
                      <div
                        className="flow-auth-strength-bar"
                        style={{ background: pwdStrength.score >= 2 ? pwdStrength.color : undefined }}
                      />
                      <div
                        className="flow-auth-strength-bar"
                        style={{ background: pwdStrength.score >= 3 ? pwdStrength.color : undefined }}
                      />
                    </div>
                    <div className="flow-auth-strength-meta">
                      <span>{pwdStrength.feedback}</span>
                      <span className="flow-auth-strength-label" style={{ color: pwdStrength.color }}>
                        {pwdStrength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flow-auth-field">
                <label className="flow-auth-label">
                  <KeyRound size={13} />
                  Konfirmasi Password
                </label>
                <div className="flow-auth-input-wrap">
                  <Lock size={16} className="flow-auth-input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="flow-auth-input"
                    placeholder="Ulangi password di atas"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="flow-auth-input-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {isConfirmMatched && (
                  <div className="flow-auth-match-badge" style={{ color: 'var(--flow-accent-emerald)' }}>
                    <Check size={12} /> Password cocok
                  </div>
                )}
                {isConfirmMismatched && (
                  <div className="flow-auth-match-badge" style={{ color: 'var(--flow-accent-rose)' }}>
                    <AlertCircle size={12} /> Password belum cocok
                  </div>
                )}
              </div>

              <div className="flow-auth-field">
                <label className="flow-auth-label">
                  <Briefcase size={13} />
                  Profil Utama Anda
                </label>
                <select
                  className="flow-auth-input"
                  style={{ paddingLeft: 14 }}
                  value={regCategory}
                  onChange={(e) => setRegCategory(e.target.value)}
                >
                  <option value="Mahasiswa / Pelajar">🎓 Mahasiswa / Pelajar</option>
                  <option value="Freelancer / Kreator">💼 Freelancer / Kreator</option>
                  <option value="Personal / UMKM">🌱 Personal / Bisnis Kecil (UMKM)</option>
                </select>
              </div>

              <button
                type="submit"
                className="flow-auth-submit-btn"
                disabled={loading}
              >
                {loading ? 'Mendaftarkan Akun...' : 'Buat Akun & Mulai Sekarang'}
                {!loading && <ArrowRight size={16} />}
              </button>

              <div style={{ textAlign: 'center', marginTop: 14, fontSize: '0.72rem', color: 'var(--flow-text-muted)', lineHeight: 1.4 }}>
                <ShieldCheck size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4, color: 'var(--flow-accent-emerald)' }} />
                Password dienkripsi SHA-256 dan tersimpan aman di browser Anda.
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="flow-auth-modal-backdrop" onClick={() => setShowResetModal(false)}>
          <div className="flow-auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="flow-auth-modal-header">
              <div>
                <div className="flow-auth-modal-title">Atur Ulang Password</div>
                <div className="flow-auth-modal-subtitle">
                  Masukkan email terdaftar dan buat kata sandi baru untuk akun Anda.
                </div>
              </div>
              <button
                type="button"
                className="flow-auth-modal-close"
                onClick={() => setShowResetModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {resetMessage.text && (
              <div
                className="flow-auth-error-alert"
                style={{
                  background:
                    resetMessage.type === 'success'
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(244, 63, 94, 0.12)',
                  borderColor:
                    resetMessage.type === 'success'
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(244, 63, 94, 0.3)',
                  color:
                    resetMessage.type === 'success'
                      ? 'var(--flow-accent-emerald)'
                      : 'var(--flow-accent-rose)'
                }}
              >
                {resetMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{resetMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit}>
              <div className="flow-auth-field">
                <label className="flow-auth-label">Alamat Email Terdaftar</label>
                <input
                  type="email"
                  className="flow-auth-input"
                  style={{ paddingLeft: 14 }}
                  placeholder="email@kampus.ac.id"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flow-auth-field">
                <label className="flow-auth-label">Password Baru</label>
                <input
                  type="password"
                  className="flow-auth-input"
                  style={{ paddingLeft: 14 }}
                  placeholder="Minimal 6 karakter"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flow-auth-field">
                <label className="flow-auth-label">Ulangi Password Baru</label>
                <input
                  type="password"
                  className="flow-auth-input"
                  style={{ paddingLeft: 14 }}
                  placeholder="Konfirmasi password baru"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  className="tab-btn"
                  style={{ flex: 1, height: 42 }}
                  onClick={() => setShowResetModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flow-auth-submit-btn"
                  style={{ flex: 1.5, height: 42, marginTop: 0 }}
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Memproses...' : 'Simpan Password Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
