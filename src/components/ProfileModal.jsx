import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Briefcase,
  Lock,
  Palette,
  ShieldCheck,
  Check,
  AlertCircle,
  KeyRound,
  Calendar,
  Save
} from 'lucide-react';
import { hashPassword, checkPasswordStrength } from '../utils/securityHelper';

const AVATAR_COLORS = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#00a884'  // Mint Teal
];

export const ProfileModal = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onShowToast
}) => {
  if (!isOpen || !currentUser) return null;

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'security'

  // General tab states
  const [name, setName] = useState(currentUser.name || '');
  const [role, setRole] = useState(currentUser.role || 'Mahasiswa / Pelajar');
  const [category, setCategory] = useState(currentUser.category || 'Mahasiswa / Pelajar');
  const [avatarInitials, setAvatarInitials] = useState(
    currentUser.avatar || (currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'U')
  );
  const [avatarColor, setAvatarColor] = useState(currentUser.avatarColor || '#6366f1');

  // Security tab states (Change Password)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ type: '', text: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const pwdStrength = checkPasswordStrength(newPassword);

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      if (onShowToast) onShowToast('Nama lengkap tidak boleh kosong.', 'error');
      return;
    }

    const updatedUser = {
      ...currentUser,
      name: name.trim(),
      role: role.trim(),
      category: category,
      avatar: avatarInitials.trim().slice(0, 2).toUpperCase(),
      avatarColor: avatarColor
    };

    onUpdateUser(updatedUser);
    if (onShowToast) onShowToast('Profil berhasil diperbarui! ✨', 'success');
    onClose();
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: '', text: '' });

    if (!currentPassword.trim() || !newPassword.trim()) {
      setPasswordStatus({ type: 'error', text: 'Semua kolom kata sandi wajib diisi.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', text: 'Password baru minimal terdiri dari 6 karakter.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordStatus({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    setSavingPassword(true);

    try {
      const currentInputHash = await hashPassword(currentPassword);
      const savedAccounts = JSON.parse(localStorage.getItem('flowwork_registered_accounts') || '[]');
      const accountIndex = savedAccounts.findIndex(
        (acc) => acc.id === currentUser.id || acc.email.toLowerCase() === currentUser.email?.toLowerCase()
      );

      // Check if it's default Kurnia or saved account
      if (currentUser.id === 'kurnia' || currentUser.email === 'kurnia@flowwork.id') {
        if (currentPassword !== 'kurnia123' && currentInputHash !== currentUser.passwordHash) {
          setPasswordStatus({ type: 'error', text: 'Password saat ini salah.' });
          setSavingPassword(false);
          return;
        }
      } else if (accountIndex !== -1) {
        const acc = savedAccounts[accountIndex];
        const isCurrentValid =
          acc.passwordHash === currentInputHash ||
          acc.password === currentPassword;

        if (!isCurrentValid) {
          setPasswordStatus({ type: 'error', text: 'Password saat ini salah.' });
          setSavingPassword(false);
          return;
        }
      }

      // Hash new password
      const newHash = await hashPassword(newPassword);

      if (accountIndex !== -1) {
        savedAccounts[accountIndex].passwordHash = newHash;
        delete savedAccounts[accountIndex].password;
        localStorage.setItem('flowwork_registered_accounts', JSON.stringify(savedAccounts));
      }

      setPasswordStatus({
        type: 'success',
        text: 'Password berhasil diubah dengan enkripsi SHA-256!'
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      if (onShowToast) onShowToast('Kata sandi berhasil diperbarui!', 'success');
    } catch (err) {
      setPasswordStatus({ type: 'error', text: 'Gagal memperbarui kata sandi.' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flow-auth-modal-backdrop" onClick={onClose}>
      <div
        className="flow-auth-modal-card"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flow-auth-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: avatarColor,
                color: '#fff',
                fontSize: '1.05rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              {avatarInitials || 'U'}
            </div>
            <div>
              <div className="flow-auth-modal-title">{name || 'Pengguna'}</div>
              <div className="flow-auth-modal-subtitle">{currentUser.email}</div>
            </div>
          </div>
          <button type="button" className="flow-auth-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flow-auth-tabs" style={{ marginBottom: 18 }}>
          <button
            type="button"
            className={`flow-auth-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <User size={14} />
            Profil & Tampilan
          </button>
          <button
            type="button"
            className={`flow-auth-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock size={14} />
            Ganti Password
          </button>
        </div>

        {activeTab === 'general' ? (
          <form onSubmit={handleSaveGeneral}>
            <div className="flow-auth-field">
              <label className="flow-auth-label">
                <User size={13} />
                Nama Tampilan
              </label>
              <input
                type="text"
                className="flow-auth-input"
                style={{ paddingLeft: 14 }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="flow-auth-field">
              <label className="flow-auth-label">
                <Briefcase size={13} />
                Peran / Segmen
              </label>
              <select
                className="flow-auth-input"
                style={{ paddingLeft: 14 }}
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setRole(e.target.value);
                }}
              >
                <option value="Mahasiswa / Pelajar">🎓 Mahasiswa / Pelajar</option>
                <option value="Freelancer / Kreator">💼 Freelancer / Kreator</option>
                <option value="Personal / UMKM">🌱 Personal / Bisnis Kecil (UMKM)</option>
              </select>
            </div>

            <div className="flow-auth-field">
              <label className="flow-auth-label">
                <Palette size={13} />
                Warna & Inisial Avatar
              </label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  type="text"
                  maxLength={2}
                  className="flow-auth-input"
                  style={{ width: 64, textAlign: 'center', padding: 0, fontWeight: 700 }}
                  value={avatarInitials}
                  onChange={(e) => setAvatarInitials(e.target.value.toUpperCase())}
                  title="Inisial Avatar (maksimal 2 huruf)"
                />
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {AVATAR_COLORS.map((c) => (
                    <div
                      key={c}
                      onClick={() => setAvatarColor(c)}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: c,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: avatarColor === c ? '0 0 0 2px var(--flow-bg-surface), 0 0 0 4px ' + c : 'none'
                      }}
                    >
                      {avatarColor === c && <Check size={14} color="#fff" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button
                type="button"
                className="tab-btn"
                style={{ flex: 1, height: 42 }}
                onClick={onClose}
              >
                Batal
              </button>
              <button
                type="submit"
                className="flow-auth-submit-btn"
                style={{ flex: 1.5, height: 42, marginTop: 0 }}
              >
                <Save size={16} />
                Simpan Perubahan
              </button>
            </div>
          </form>
        ) : (
          /* Security Tab (Change Password) */
          <form onSubmit={handleChangePassword}>
            {passwordStatus.text && (
              <div
                className="flow-auth-error-alert"
                style={{
                  background:
                    passwordStatus.type === 'success'
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(244, 63, 94, 0.12)',
                  borderColor:
                    passwordStatus.type === 'success'
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(244, 63, 94, 0.3)',
                  color:
                    passwordStatus.type === 'success'
                      ? 'var(--flow-accent-emerald)'
                      : 'var(--flow-accent-rose)'
                }}
              >
                {passwordStatus.type === 'success' ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                <span>{passwordStatus.text}</span>
              </div>
            )}

            <div className="flow-auth-field">
              <label className="flow-auth-label">
                <Lock size={13} />
                Password Saat Ini
              </label>
              <input
                type="password"
                className="flow-auth-input"
                style={{ paddingLeft: 14 }}
                placeholder="Masukkan password saat ini"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="flow-auth-field">
              <label className="flow-auth-label">
                <KeyRound size={13} />
                Password Baru
              </label>
              <input
                type="password"
                className="flow-auth-input"
                style={{ paddingLeft: 14 }}
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              {newPassword.length > 0 && (
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

            <div className="flow-auth-field">
              <label className="flow-auth-label">
                <Lock size={13} />
                Ulangi Password Baru
              </label>
              <input
                type="password"
                className="flow-auth-input"
                style={{ paddingLeft: 14 }}
                placeholder="Konfirmasi password baru"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button
                type="button"
                className="tab-btn"
                style={{ flex: 1, height: 42 }}
                onClick={onClose}
              >
                Tutup
              </button>
              <button
                type="submit"
                className="flow-auth-submit-btn"
                style={{ flex: 1.5, height: 42, marginTop: 0 }}
                disabled={savingPassword}
              >
                {savingPassword ? 'Menyimpan...' : 'Perbarui Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
