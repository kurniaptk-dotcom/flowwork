import React, { useState, useEffect } from 'react';
import { X, User, Mail, Briefcase, Building, Activity, Sliders, Check } from 'lucide-react';

export const MemberEditModal = ({ isOpen, onClose, member, onSaveMember }) => {
  if (!isOpen || !member) return null;

  const [name, setName] = useState(member.name || '');
  const [email, setEmail] = useState(member.email || '');
  const [role, setRole] = useState(member.role || 'Kolaborator');
  const [department, setDepartment] = useState(member.department || 'Rekan Tim');
  const [status, setStatus] = useState(member.status || 'active');
  const [capacity, setCapacity] = useState(member.capacity || 5);
  const [color, setColor] = useState(member.color || '#6366f1');

  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setEmail(member.email || '');
      setRole(member.role || 'Kolaborator');
      setDepartment(member.department || 'Rekan Tim');
      setStatus(member.status || 'active');
      setCapacity(member.capacity || 5);
      setColor(member.color || '#6366f1');
    }
  }, [member]);

  const colorPresets = [
    '#6366f1', // Indigo
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#00a884', // Teal (Owner)
    '#f43f5e'  // Rose
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initials = name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const updated = {
      ...member,
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      department,
      status,
      capacity: Number(capacity) || 5,
      color,
      avatar: initials || member.avatar
    };

    onSaveMember(updated);
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
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: `${color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color
              }}
            >
              <User size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--flow-text-main)' }}>
                Edit Profil Kolaborator
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--flow-text-muted)', margin: 0 }}>
                Perbarui peran, kategori kolaborasi, dan target kapasitas tugas
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="meta-field-label">
                <Briefcase size={13} />
                Peran / Hubungan
              </label>
              <input
                type="text"
                className="meta-field-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Contoh: Teman Kelompok, Desainer, Klien"
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
                <option value="Rekan Kuliah / Studi">Rekan Kuliah / Studi</option>
                <option value="Partner Proyek & Freelance">Partner Proyek & Freelance</option>
                <option value="Klien & Pemesan">Klien & Pemesan</option>
                <option value="Dosen / Mentor Pembimbing">Dosen / Mentor Pembimbing</option>
                <option value="Organisasi & Komunitas">Organisasi & Komunitas</option>
                <option value="Rekan Tim">Rekan Tim</option>
                <option value="Kreatif & Media">Kreatif & Media</option>
                <option value="Akun Utama">Akun Utama</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="meta-field-label">
                <Activity size={13} />
                Status Kehadiran
              </label>
              <select
                className="meta-field-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">🟢 Active / Online</option>
                <option value="away">🟡 Away / Istirahat</option>
                <option value="on_leave">⚪ On Leave / Cuti</option>
              </select>
            </div>

            <div>
              <label className="meta-field-label">
                <Sliders size={13} />
                Kapasitas Tugas Maksimal
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

          {/* Color Picker */}
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
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
