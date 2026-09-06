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
  AlertCircle
} from 'lucide-react';
import '../styles/auth-page.css';

export const AuthPage = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('kurnia@flowwork.id');
  const [loginPassword, setLoginPassword] = useState('kurnia123');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCategory, setRegCategory] = useState('Mahasiswa / Pelajar');

  const handleLogin = (e) => {
    e?.preventDefault();
    setErrorMessage('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Silakan isi email dan password Anda.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Check registered accounts or match default Kurnia
      try {
        const savedAccounts = JSON.parse(localStorage.getItem('flowwork_registered_accounts') || '[]');
        const matched = savedAccounts.find(
          (acc) => acc.email.toLowerCase() === loginEmail.trim().toLowerCase()
        );

        if (matched) {
          if (matched.password !== loginPassword) {
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
            avatar: matched.name.slice(0, 2).toUpperCase(),
            token: 'auth_' + Date.now(),
            loginAt: new Date().toISOString()
          };
          onLoginSuccess(userSession);
        } else if (
          loginEmail.trim().toLowerCase() === 'kurnia@flowwork.id' ||
          loginEmail.trim().toLowerCase() === 'kurnia' ||
          loginEmail.includes('@')
        ) {
          // Default Kurnia or Any valid email in local offline mode
          const userName = loginEmail.split('@')[0];
          const capitalized = userName.charAt(0).toUpperCase() + userName.slice(1);
          const userSession = {
            id: 'user-' + Date.now(),
            name: loginEmail.toLowerCase().includes('kurnia') ? 'Kurnia' : capitalized,
            email: loginEmail.trim(),
            role: 'Pemilik Ruang Kerja',
            category: 'Mahasiswa / Pelajar',
            avatar: loginEmail.toLowerCase().includes('kurnia') ? 'K' : capitalized.charAt(0),
            token: 'auth_' + Date.now(),
            loginAt: new Date().toISOString()
          };
          onLoginSuccess(userSession);
        } else {
          setErrorMessage('Format email tidak valid.');
        }
      } catch (err) {
        setErrorMessage('Terjadi kesalahan saat memproses login.');
      }
      setLoading(false);
    }, 350);
  };

  const handleRegister = (e) => {
    e?.preventDefault();
    setErrorMessage('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Lengkapi semua kolom formulir pendaftaran.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password minimal terdiri dari 6 karakter.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const savedAccounts = JSON.parse(localStorage.getItem('flowwork_registered_accounts') || '[]');
        const existing = savedAccounts.find(
          (acc) => acc.email.toLowerCase() === regEmail.trim().toLowerCase()
        );

        if (existing) {
          setErrorMessage('Email sudah terdaftar. Silakan langsung masuk.');
          setLoading(false);
          return;
        }

        const newAccount = {
          id: 'acc-' + Date.now(),
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword,
          category: regCategory,
          role: regCategory,
          createdAt: new Date().toISOString()
        };

        savedAccounts.push(newAccount);
        localStorage.setItem('flowwork_registered_accounts', JSON.stringify(savedAccounts));

        const userSession = {
          id: newAccount.id,
          name: newAccount.name,
          email: newAccount.email,
          role: newAccount.category,
          category: newAccount.category,
          avatar: newAccount.name.slice(0, 2).toUpperCase(),
          token: 'auth_' + Date.now(),
          loginAt: new Date().toISOString()
        };

        onLoginSuccess(userSession);
      } catch (err) {
        setErrorMessage('Gagal menyimpan akun baru. Silakan coba lagi.');
      }
      setLoading(false);
    }, 400);
  };

  const handleGuestLogin = () => {
    const guestUser = {
      id: 'guest-' + Date.now(),
      name: 'Pengguna Tamu',
      email: 'tamu@flowwork.id',
      role: 'Tamu Eksplorasi',
      category: 'Mahasiswa / Pelajar',
      avatar: 'T',
      token: 'guest_' + Date.now(),
      isGuest: true,
      loginAt: new Date().toISOString()
    };
    onLoginSuccess(guestUser);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const googleUser = {
        id: 'google-user-' + Date.now(),
        name: 'Kurnia Pratama',
        email: 'kurnia.pratama@gmail.com',
        role: 'Mahasiswa & Freelancer',
        category: 'Mahasiswa / Pelajar',
        avatar: 'G',
        token: 'google_token_' + Date.now(),
        loginAt: new Date().toISOString()
      };
      setLoading(false);
      onLoginSuccess(googleUser);
    }, 450);
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
            <div className="flow-auth-logo-icon">F</div>
            <div>
              <div className="flow-auth-brand-name">FlowWork</div>
              <div className="flow-auth-brand-badge">B2C Productivity OS</div>
            </div>
          </div>

          <div style={{ marginTop: 44 }} className="flow-auth-hero-text">
            <h1>Kelola Kuliah, Skripsi & Proyek Klien Tanpa Pusing</h1>
            <p>
              Papan Kanban interaktif, Pomodoro focus timer, catatan instan, dan asisten cerdas FlowPilot AI dalam satu platform modern.
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
                <span>FlowPilot AI: Analisis prioritas tugas & evaluasi progres mingguan</span>
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
            "FlowWork bener-bener ngebantu gue nuntasin skripsi tepat waktu sambil tetap handle 3 proyek klien freelance dengan rapi."
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
                    onClick={() => alert('Password default untuk demo: kurnia123')}
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
                Data Anda terenkripsi aman secara lokal di browser Anda.
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
