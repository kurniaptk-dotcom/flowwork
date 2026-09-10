import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, Shield, Crown } from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: 'Gratis Selamanya',
    price: 'Rp 0',
    period: 'selamanya',
    description: 'Untuk catatan kuliah, tugas harian, dan produktivitas mandiri.',
    icon: Zap,
    color: '#10b981',
    features: [
      'Hingga 3 Ruang Kerja (Workspace)',
      'Papan Kanban & Manajemen Tugas',
      'Pomodoro Timer & Scratchpad Cepat',
      'Penyimpanan Lokal (Offline-First)',
      'Dukungan Komunitas FlowWork'
    ]
  },
  {
    id: 'student',
    name: 'Pelajar / Student Pro',
    price: 'Rp 19rb',
    period: 'per bulan',
    badge: 'Favorit Mahasiswa',
    description: 'Dirancang khusus untuk mahasiswa, pelajar, dan pejuang skripsi.',
    icon: Sparkles,
    color: '#6366f1',
    features: [
      'Semua fitur Gratis Selamanya',
      'Ruang Kerja (Workspace) Tanpa Batas',
      'KeepWork AI Asisten Produktivitas',
      'Templat Skripsi, Makalah & Praktikum',
      'Ekspor Laporan PDF & Ringkasan Rapi'
    ]
  },
  {
    id: 'freelancer',
    name: 'Freelancer Pro',
    price: 'Rp 49rb',
    period: 'per bulan',
    badge: 'Rekomendasi Freelancer',
    description: 'Untuk freelancer, solopreneur, dan kreator mengelola multi-klien.',
    icon: Crown,
    color: '#8b5cf6',
    features: [
      'Semua fitur Pelajar Pro',
      'Multi-Klien & Manajemen Proyek Klien',
      'Checklist Proposal & Invoice Proyek',
      'Integrasi Kalender & Pengingat Deadline',
      'KeepWork AI Scope & Breakdown Proyek'
    ]
  },
  {
    id: 'lifetime',
    name: 'Lifetime Pass',
    price: 'Rp 149rb',
    period: 'bayar 1x selamanya',
    badge: 'Paling Hemat',
    description: 'Akses seumur hidup tanpa biaya langganan bulanan berulang.',
    icon: Shield,
    color: '#06b6d4',
    features: [
      'Semua fitur Freelancer Pro',
      'Akses Semua Fitur Baru Masa Depan',
      'Tanpa Tagihan Bulanan / Tahunan',
      'Prioritas Dukungan Komunitas',
      'Badge Eksklusif "Early Supporter"'
    ]
  }
];

export default function UpgradePlanModal({ isOpen, onClose, currentPlan = 'free', onSelectPlan }) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);

  if (!isOpen) return null;

  const handleUpgrade = (planId) => {
    setSelectedPlan(planId);
    if (onSelectPlan) {
      onSelectPlan(planId);
    }
  };

  return (
    <div className="flow-modal-backdrop" onClick={onClose}>
      <div
        className="flow-upgrade-card-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flow-upgrade-header">
          <div>
            <div className="flow-upgrade-tag">
              <Sparkles size={13} color="var(--flow-primary)" />
              <span>Paket Pengguna KeepWork</span>
            </div>
            <h2 className="flow-upgrade-title">Pilih Paket Produktivitas Pribadi</h2>
            <p className="flow-upgrade-sub">
              Tingkatkan fokus belajar, kelola tugas kuliah, serta raih efisiensi proyek freelance dengan KeepWork AI dan ruang kerja tanpa batas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
            style={{ width: 32, height: 32 }}
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="flow-upgrade-grid">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = (currentPlan || 'free').toLowerCase() === plan.id.toLowerCase();
            const isCardSelected = (selectedPlan || 'free').toLowerCase() === plan.id.toLowerCase();

            return (
              <div
                key={plan.id}
                className={`flow-pricing-card ${isCurrent ? 'current-active' : isCardSelected ? 'card-selected' : ''}`}
              >
                {plan.badge && (
                  <div className="flow-pricing-badge">
                    {plan.badge}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      backgroundColor: `${plan.color}18`,
                      color: plan.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--flow-text-main)', margin: 0 }}>
                      {plan.name}
                    </h3>
                    {isCurrent && (
                      <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--flow-accent-emerald)' }}>
                        Paket Aktif
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ margin: '8px 0 10px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--flow-text-main)' }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)', marginLeft: 6 }}>
                    /{plan.period}
                  </span>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--flow-text-subtle)', lineHeight: 1.4, margin: '0 0 14px', minHeight: 34 }}>
                  {plan.description}
                </p>

                <div className="flow-pricing-features">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.76rem', color: 'var(--flow-text-main)' }}>
                      <Check size={14} color="var(--flow-accent-emerald)" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent}
                  className={`flow-pricing-btn ${isCurrent ? 'active-btn' : 'upgrade-btn'}`}
                >
                  {isCurrent ? '✓ Paket Sedang Aktif' : `Pilih Paket ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flow-upgrade-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} color="var(--flow-accent-emerald)" />
            <span>Garansi uang kembali 30 hari. Beralih atau batalkan paket kapan saja tanpa penalti.</span>
          </div>
          <button
            onClick={onClose}
            className="tab-btn"
            style={{ fontSize: '0.8rem', padding: '5px 14px' }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
