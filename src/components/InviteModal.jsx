import React, { useState } from 'react';
import { X, UserPlus, Mail, User, Shield, Check, Building, Sliders } from 'lucide-react';

export const InviteModal = ({ isOpen, onClose, onInviteMember }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Teman Kelompok');
  const [department, setDepartment] = useState('Teman Kuliah / Studi');
  const [accessLevel, setAccessLevel] = useState('Member');
  const [capacity, setCapacity] = useState(5);
  const [color, setColor] = useState('#6366f1');

  const colorPresets = [
    '#6366f1', // Indigo
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#f43f5e'  // Rose
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const initials = name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newMember = {
      id: 'member-' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      department,
      accessLevel,
      status: 'active',
      capacity: Number(capacity) || 5,
      avatar: initials,
      color,
      isOwner: false
    };

    onInviteMember(newMember);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 520, borderRadius: 16 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '18px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--flow-primary)'
              }}
            >
              <UserPlus size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--flow-text-main)' }}>
                Undang Kolaborator Baru
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--flow-text-muted)', margin: 0 }}>
                Tambahkan teman belajar, rekan kelompok, klien, atau partner ke ruang kerja ini
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="meta-field-label">
                <User size={13} />
                Nama Lengkap
              </label>
              <input
                type="text"
                className="meta-field-input"
                placeholder="Contoh: Budi Santoso / Sarah Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="meta-field-label">
                <Mail size={13} />
                Alamat Email
              </label>
              <input
                type="email"
                className="meta-field-input"
                placeholder="budi@kampus.ac.id atau klien@project.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="meta-field-label">
                <Shield size={13} />
                Peran / Hubungan
              </label>
              <input
                type="text"
                className="meta-field-input"
                placeholder="Contoh: Teman Kelompok, UI Designer, Klien"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="meta-field-label">
                <Building size={13} />
                Kategori Kolaborator
              </label>
              <select
                className="meta-field-input"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Teman Kuliah / Studi">Teman Kuliah / Studi</option>
                <option value="Partner Proyek & Freelance">Partner Proyek & Freelance</option>
                <option value="Klien & Pemesan">Klien & Pemesan</option>
                <option value="Dosen / Mentor Pembimbing">Dosen / Mentor Pembimbing</option>
                <option value="Organisasi & Komunitas">Organisasi & Komunitas</option>
                <option value="Rekan Tim">Rekan Tim</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="meta-field-label">
                <Shield size={13} />
                Tingkat Akses
              </label>
              <select
                className="meta-field-input"
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
              >
                <option value="Admin">Admin (Akses Penuh)</option>
                <option value="Member">Kolaborator (Kelola & Selesaikan Tugas)</option>
                <option value="Guest">Viewer (Hanya Melihat Progres)</option>
              </select>
            </div>

            <div>
              <label className="meta-field-label">
                <Sliders size={13} />
                Target Kapasitas Tugas
              </label>
              <input
                type="number"
                min="1"
                max="15"
                className="meta-field-input"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="meta-field-label" style={{ marginBottom: 8 }}>
              Warna Identitas Avatar
            </label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {colorPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: color === c ? '3px solid var(--flow-bg-surface)' : 'none',
                    outline: color === c ? `2px solid ${c}` : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    transition: 'transform 0.1s ease'
                  }}
                >
                  {color === c && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, paddingTop: 14, borderTop: '1px solid var(--flow-border-subtle)' }}>
            <button
              type="button"
              className="tab-btn"
              onClick={onClose}
              style={{ padding: '8px 16px', fontSize: '0.84rem' }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flow-cal-add-btn"
              style={{ padding: '8px 20px', fontSize: '0.84rem' }}
            >
              Kirim Undangan & Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
