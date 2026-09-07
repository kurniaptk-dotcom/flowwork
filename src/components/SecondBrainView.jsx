import React, { useState, useMemo } from 'react';
import {
  Brain,
  Folder,
  FolderOpen,
  BookOpen,
  Archive,
  Target,
  Sparkles,
  Search,
  Plus,
  Tag,
  Pin,
  Clock,
  MoreVertical,
  Edit3,
  Trash2,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  X,
  Share2,
  Copy,
  Layers,
  FileText,
  Bookmark,
  ChevronRight,
  Compass
} from 'lucide-react';

const PARA_TABS = [
  { id: 'all', label: 'Semua Catatan', icon: Layers, desc: 'Seluruh bank pengetahuan & ide' },
  { id: 'projects', label: 'Projects (Proyek)', icon: Target, desc: 'Riset aktif dengan target & tenggat waktu' },
  { id: 'areas', label: 'Areas (Bidang)', icon: Compass, desc: 'Tanggung jawab berkelanjutan (Kesehatan, Skill, Finansial)' },
  { id: 'resources', label: 'Resources (Sumber)', icon: BookOpen, desc: 'Bank materi, referensi jurnal, link, & cheat-sheet' },
  { id: 'archives', label: 'Archives (Arsip)', icon: Archive, desc: 'Catatan & dokumen proyek yang telah selesai' }
];

export const SecondBrainView = ({
  notes = [],
  onUpdateNotes,
  onConvertToTask,
  onAddToast,
  onOpenFlowPilot
}) => {
  const [activeParaTab, setActiveParaTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [quickCaptureText, setQuickCaptureText] = useState('');

  // AI Summary Modal State
  const [aiInsightModal, setAiInsightModal] = useState({ isOpen: false, note: null, content: '', isGenerating: false });

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('projects');
  const [formTags, setFormTags] = useState('');
  const [formPinned, setFormPinned] = useState(false);
  const [formColor, setFormColor] = useState('#6366f1');

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    notes.forEach((n) => {
      if (Array.isArray(n.tags)) {
        n.tags.forEach((t) => tagsSet.add(t.replace(/^#/, '')));
      }
    });
    return Array.from(tagsSet);
  }, [notes]);

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        const matchTab = activeParaTab === 'all' || n.paraCategory === activeParaTab;
        const matchSearch =
          !searchQuery.trim() ||
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (n.tags && n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
        const matchTag =
          selectedTag === 'all' ||
          (n.tags && n.tags.some((t) => t.replace(/^#/, '') === selectedTag));
        return matchTab && matchSearch && matchTag;
      })
      .sort((a, b) => {
        // Pinned first, then newest
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
      });
  }, [notes, activeParaTab, searchQuery, selectedTag]);

  // Quick Capture handler
  const handleQuickCapture = (e) => {
    if (e.key === 'Enter' && quickCaptureText.trim()) {
      e.preventDefault();
      const firstLine = quickCaptureText.trim().split('\n')[0];
      const title = firstLine.length > 50 ? firstLine.slice(0, 50) + '...' : firstLine;
      const newNote = {
        id: 'note-' + Date.now(),
        title,
        content: quickCaptureText.trim(),
        paraCategory: activeParaTab === 'all' ? 'resources' : activeParaTab,
        tags: ['quick-capture'],
        pinned: false,
        color: '#6366f1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onUpdateNotes([newNote, ...notes]);
      setQuickCaptureText('');
      if (onAddToast) onAddToast('💡 Ide berhasil ditangkap ke Second Brain!', 'success');
    }
  };

  const handleOpenAdd = () => {
    setEditingNote(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory(activeParaTab === 'all' ? 'projects' : activeParaTab);
    setFormTags('');
    setFormPinned(false);
    setFormColor('#6366f1');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormContent(note.content || '');
    setFormCategory(note.paraCategory || 'projects');
    setFormTags(Array.isArray(note.tags) ? note.tags.join(', ') : '');
    setFormPinned(!!note.pinned);
    setFormColor(note.color || '#6366f1');
    setIsModalOpen(true);
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const parsedTags = formTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0)
      .map((t) => `#${t}`);

    if (editingNote) {
      const updated = notes.map((n) =>
        n.id === editingNote.id
          ? {
              ...n,
              title: formTitle.trim(),
              content: formContent.trim(),
              paraCategory: formCategory,
              tags: parsedTags,
              pinned: formPinned,
              color: formColor,
              updatedAt: new Date().toISOString()
            }
          : n
      );
      onUpdateNotes(updated);
      if (onAddToast) onAddToast('Catatan Second Brain diperbarui!', 'success');
    } else {
      const newNote = {
        id: 'note-' + Date.now(),
        title: formTitle.trim(),
        content: formContent.trim(),
        paraCategory: formCategory,
        tags: parsedTags.length > 0 ? parsedTags : ['#catatan'],
        pinned: formPinned,
        color: formColor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onUpdateNotes([newNote, ...notes]);
      if (onAddToast) onAddToast(`Catatan "${newNote.title}" berhasil disimpan!`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDeleteNote = (noteId, title) => {
    if (window.confirm(`Hapus catatan "${title}" dari Second Brain?`)) {
      onUpdateNotes(notes.filter((n) => n.id !== noteId));
      if (onAddToast) onAddToast(`Catatan "${title}" dihapus.`, 'info');
    }
  };

  const handleTogglePin = (noteId) => {
    const updated = notes.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n));
    onUpdateNotes(updated);
  };

  // Convert Note to Kanban Task
  const handleConvertToTaskAction = (note) => {
    if (!onConvertToTask) return;
    const taskPayload = {
      title: note.title,
      description: note.content || 'Dibuat dari Second Brain Knowledge Hub',
      priority: note.paraCategory === 'projects' ? 'high' : 'medium',
      tags: note.tags || ['#second-brain']
    };
    onConvertToTask(taskPayload);
    if (onAddToast) {
      onAddToast(`✨ Catatan "${note.title}" berhasil dijadikan kartu tugas di Kanban Board!`, 'success');
    }
  };

  // KeepWork AI Summarizer
  const handleGenerateAiInsight = (note) => {
    setAiInsightModal({ isOpen: true, note, content: '', isGenerating: true });
    setTimeout(() => {
      const summaryText =
        `🧠 **Analisis & Rangkuman KeepWork AI (Second Brain)**\n\n` +
        `• **Esensi Utama:** ${note.title}\n` +
        `• **Pilar P.A.R.A:** ${note.paraCategory.toUpperCase()}\n` +
        `• **Inti Gagasan:** ${
          note.content
            ? note.content.slice(0, 180) + '...'
            : 'Materi riset penting siap diaplikasikan pada proyek aktif.'
        }\n\n` +
        `📋 **Rekomendasi Action Items Selanjutnya:**\n` +
        `1. Buat checklist implementasi langkah demi langkah.\n` +
        `2. Kaitkan referensi ini ke bab pembahasan skripsi atau deliverable klien.\n` +
        `3. Jadwalkan sesi deep work 25 menit (Pomodoro) untuk eksekusi.`;

      setAiInsightModal({ isOpen: true, note, content: summaryText, isGenerating: false });
    }, 750);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px', width: '100%', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--flow-primary)',
                padding: '3px 9px',
                borderRadius: 999,
                fontSize: '0.74rem',
                fontWeight: 700
              }}
            >
              <Brain size={13} /> Second Brain • P.A.R.A Method
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--flow-text-muted)' }}>
              Pusat Pengetahuan Digital
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--flow-text-main)', margin: 0, letterSpacing: '-0.02em' }}>
            Second Brain & Knowledge Hub
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--flow-text-subtle)', margin: '4px 0 0' }}>
            Simpan ide, materi riset skripsi, bank referensi, dan rangkuman penting agar otak Anda bebas berpikir jernih.
          </p>
        </div>

        <button
          className="flow-btn flow-btn-primary"
          onClick={handleOpenAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 700, borderRadius: 10 }}
        >
          <Plus size={16} />
          <span>Buat Catatan Baru</span>
        </button>
      </div>

      {/* Quick Capture Card */}
      <div
        style={{
          background: 'var(--flow-bg-surface)',
          border: '1px solid var(--flow-border-subtle)',
          borderRadius: 14,
          padding: '14px 18px',
          boxShadow: 'var(--flow-shadow-sm)',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--flow-pilot-gradient)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Sparkles size={18} />
        </div>
        <input
          type="text"
          placeholder="⚡ Quick Capture: Ketik ide, link referensi, atau kutipan penting lalu tekan Enter..."
          value={quickCaptureText}
          onChange={(e) => setQuickCaptureText(e.target.value)}
          onKeyDown={handleQuickCapture}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '0.9rem',
            color: 'var(--flow-text-main)'
          }}
        />
        <span style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)', fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: 'var(--flow-bg-elevated)' }}>
          Enter ↵
        </span>
      </div>

      {/* P.A.R.A Method Navigation Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          marginBottom: 20
        }}
      >
        {PARA_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeParaTab === tab.id;
          const count = tab.id === 'all' ? notes.length : notes.filter((n) => n.paraCategory === tab.id).length;

          return (
            <div
              key={tab.id}
              onClick={() => setActiveParaTab(tab.id)}
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                cursor: 'pointer',
                background: isActive ? 'var(--flow-bg-surface)' : 'var(--flow-bg-elevated)',
                border: isActive ? '2px solid var(--flow-primary)' : '1px solid var(--flow-border-subtle)',
                boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.15)' : 'none',
                transition: 'all 0.18s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: '0.86rem', color: isActive ? 'var(--flow-primary)' : 'var(--flow-text-main)' }}>
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 999,
                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'var(--flow-border-subtle)',
                    color: isActive ? 'var(--flow-primary)' : 'var(--flow-text-muted)'
                  }}
                >
                  {count}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--flow-text-subtle)', lineHeight: 1.3 }}>
                {tab.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Tag Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20
        }}
      >
        {/* Search Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            background: 'var(--flow-bg-surface)',
            border: '1px solid var(--flow-border-subtle)',
            borderRadius: 10,
            width: '100%',
            maxWidth: 360
          }}
        >
          <Search size={15} color="var(--flow-text-muted)" />
          <input
            type="text"
            placeholder="Cari judul, tagar, isi materi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.84rem',
              color: 'var(--flow-text-main)',
              width: '100%'
            }}
          />
          {searchQuery && (
            <button className="icon-btn" onClick={() => setSearchQuery('')} style={{ width: 20, height: 20 }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Tag Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--flow-text-muted)', fontWeight: 600 }}>
            <Tag size={12} style={{ display: 'inline', marginRight: 4 }} /> Tagar:
          </span>
          <button
            onClick={() => setSelectedTag('all')}
            style={{
              fontSize: '0.74rem',
              padding: '3px 8px',
              borderRadius: 6,
              background: selectedTag === 'all' ? 'var(--flow-primary)' : 'var(--flow-bg-elevated)',
              color: selectedTag === 'all' ? '#fff' : 'var(--flow-text-muted)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Semua
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              style={{
                fontSize: '0.74rem',
                padding: '3px 8px',
                borderRadius: 6,
                background: selectedTag === tag ? 'var(--flow-primary)' : 'var(--flow-bg-elevated)',
                color: selectedTag === tag ? '#fff' : 'var(--flow-text-muted)',
                border: '1px solid var(--flow-border-subtle)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div
          style={{
            background: 'var(--flow-bg-surface)',
            border: '1px solid var(--flow-border-subtle)',
            borderRadius: 16,
            padding: '50px 20px',
            textAlign: 'center',
            color: 'var(--flow-text-subtle)'
          }}
        >
          <BookOpen size={44} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>
            Belum ada catatan di folder ini
          </div>
          <p style={{ fontSize: '0.84rem', margin: '6px 0 16px' }}>
            Simpan artikel, draf bab skripsi, contekan coding, atau ide bisnis pertama Anda.
          </p>
          <button className="flow-btn flow-btn-primary" onClick={handleOpenAdd}>
            <Plus size={14} style={{ marginRight: 6 }} /> Buat Catatan Pertama
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 18
          }}
        >
          {filteredNotes.map((note) => {
            const categoryMeta = PARA_TABS.find((t) => t.id === note.paraCategory) || PARA_TABS[1];
            return (
              <div
                key={note.id}
                style={{
                  background: 'var(--flow-bg-surface)',
                  border: note.pinned ? '1px solid var(--flow-primary)' : '1px solid var(--flow-border-subtle)',
                  borderRadius: 14,
                  padding: '18px 20px',
                  boxShadow: 'var(--flow-shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  transition: 'transform 0.18s, box-shadow 0.18s'
                }}
              >
                {/* Note Header */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 4,
                          background: 'var(--flow-bg-elevated)',
                          color: note.color || 'var(--flow-primary)',
                          border: '1px solid var(--flow-border-subtle)',
                          textTransform: 'uppercase'
                        }}
                      >
                        {categoryMeta.label.split(' ')[0]}
                      </span>
                      {note.pinned && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            fontSize: '0.68rem',
                            color: 'var(--flow-primary)',
                            fontWeight: 700
                          }}
                        >
                          <Pin size={11} fill="currentColor" /> Tersemat
                        </span>
                      )}
                    </div>

                    <button
                      className="icon-btn"
                      onClick={() => handleTogglePin(note.id)}
                      title={note.pinned ? "Lepas sematan" : "Sematkan di atas"}
                      style={{ width: 26, height: 26, color: note.pinned ? 'var(--flow-primary)' : 'var(--flow-text-muted)' }}
                    >
                      <Pin size={13} fill={note.pinned ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.02rem',
                      fontWeight: 700,
                      color: 'var(--flow-text-main)',
                      margin: '0 0 8px',
                      lineHeight: 1.4,
                      cursor: 'pointer'
                    }}
                    onClick={() => handleOpenEdit(note)}
                  >
                    {note.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.84rem',
                      color: 'var(--flow-text-subtle)',
                      lineHeight: 1.5,
                      margin: '0 0 14px',
                      maxHeight: 76,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {note.content || 'Catatan kosong tanpa deskripsi...'}
                  </p>

                  {/* Tags */}
                  {Array.isArray(note.tags) && note.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {note.tags.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--flow-text-muted)',
                            background: 'var(--flow-bg-elevated)',
                            padding: '1px 6px',
                            borderRadius: 4
                          }}
                        >
                          {t.startsWith('#') ? t : `#${t}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Note Footer Actions */}
                <div
                  style={{
                    borderTop: '1px solid var(--flow-border-subtle)',
                    paddingTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 8
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* Action 1: AI Insight */}
                    <button
                      type="button"
                      className="tab-btn"
                      onClick={() => handleGenerateAiInsight(note)}
                      title="Ringkas catatan ini dengan KeepWork AI"
                      style={{ fontSize: '0.76rem', padding: '3px 8px', color: 'var(--flow-primary)', fontWeight: 600 }}
                    >
                      <Sparkles size={12} />
                      <span>AI Ringkas</span>
                    </button>

                    {/* Action 2: Convert to Task */}
                    <button
                      type="button"
                      className="tab-btn"
                      onClick={() => handleConvertToTaskAction(note)}
                      title="Ubah catatan ini jadi tugas di Kanban Board"
                      style={{ fontSize: '0.76rem', padding: '3px 8px' }}
                    >
                      <CheckCircle2 size={12} />
                      <span>Jadikan Tugas</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      className="icon-btn"
                      onClick={() => handleOpenEdit(note)}
                      title="Edit Catatan"
                      style={{ width: 28, height: 28 }}
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => handleDeleteNote(note.id, note.title)}
                      title="Hapus Catatan"
                      style={{ width: 28, height: 28, color: 'var(--flow-accent-rose)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add/Edit Note */}
      {isModalOpen && (
        <div className="flow-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="flow-modal-card"
            style={{ maxWidth: 560 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flow-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Brain size={18} color="var(--flow-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800 }}>
                  {editingNote ? 'Edit Catatan Second Brain' : 'Buat Catatan Second Brain'}
                </h3>
              </div>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveNote} style={{ padding: '20px' }}>
              {/* Title */}
              <div style={{ marginBottom: 16 }}>
                <label className="flow-auth-label" style={{ marginBottom: 6 }}>
                  Judul Catatan / Gagasan *
                </label>
                <input
                  type="text"
                  className="flow-auth-input"
                  placeholder="misal: Kerangka Teori Bab 2 Skripsi - Sistem Rekomendasi"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* PARA Category & Pin */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label className="flow-auth-label" style={{ marginBottom: 6 }}>
                    Kategori P.A.R.A
                  </label>
                  <select
                    className="flow-auth-input"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="projects">🎯 Projects (Proyek Aktif)</option>
                    <option value="areas">🌿 Areas (Tanggung Jawab Berkelanjutan)</option>
                    <option value="resources">📚 Resources (Bank Referensi & Materi)</option>
                    <option value="archives">📦 Archives (Dokumen Selesai / Arsip)</option>
                  </select>
                </div>
                <div>
                  <label className="flow-auth-label" style={{ marginBottom: 6 }}>
                    Prioritas Sematan
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormPinned(!formPinned)}
                    className="tab-btn"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 10,
                      justifyContent: 'center',
                      background: formPinned ? 'rgba(99, 102, 241, 0.15)' : 'var(--flow-bg-elevated)',
                      color: formPinned ? 'var(--flow-primary)' : 'var(--flow-text-main)',
                      fontWeight: formPinned ? 700 : 500,
                      border: formPinned ? '1px solid var(--flow-primary)' : '1px solid var(--flow-border-subtle)'
                    }}
                  >
                    <Pin size={14} fill={formPinned ? 'currentColor' : 'none'} />
                    <span>{formPinned ? 'Tersemat di Atas' : 'Biasa (Tidak Disematkan)'}</span>
                  </button>
                </div>
              </div>

              {/* Content Body */}
              <div style={{ marginBottom: 16 }}>
                <label className="flow-auth-label" style={{ marginBottom: 6 }}>
                  Isi Catatan / Ringkasan Materi
                </label>
                <textarea
                  className="flow-auth-input"
                  style={{ minHeight: 140, resize: 'vertical', lineHeight: 1.5 }}
                  placeholder="Tuliskan gagasan, kutipan jurnal, kesimpulan diskusi, kode referensi, atau instruksi kerja di sini..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                />
              </div>

              {/* Tags */}
              <div style={{ marginBottom: 20 }}>
                <label className="flow-auth-label" style={{ marginBottom: 6 }}>
                  Tagar (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  className="flow-auth-input"
                  placeholder="skripsi, metodologi, react, referensi"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                />
              </div>

              {/* Footer Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="flow-btn flow-btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="flow-btn flow-btn-primary" style={{ padding: '8px 20px' }}>
                  {editingNote ? 'Simpan Catatan' : 'Tambah ke Second Brain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: KeepWork AI Insight */}
      {aiInsightModal.isOpen && (
        <div className="flow-modal-backdrop" onClick={() => setAiInsightModal({ isOpen: false, note: null, content: '', isGenerating: false })}>
          <div
            className="flow-modal-card"
            style={{ maxWidth: 520 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flow-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="var(--flow-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800 }}>
                  Ringkasan Cerdas KeepWork AI
                </h3>
              </div>
              <button className="icon-btn" onClick={() => setAiInsightModal({ isOpen: false, note: null, content: '', isGenerating: false })}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {aiInsightModal.isGenerating ? (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--flow-text-muted)' }}>
                  <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--flow-primary)' }} />
                  <div>Menganalisis dan merangkum isi catatan...</div>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      background: 'var(--flow-bg-elevated)',
                      border: '1px solid var(--flow-border-subtle)',
                      borderRadius: 12,
                      padding: '16px',
                      fontSize: '0.88rem',
                      lineHeight: 1.6,
                      color: 'var(--flow-text-main)',
                      whiteSpace: 'pre-line',
                      marginBottom: 16
                    }}
                  >
                    {aiInsightModal.content}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button
                      className="flow-btn flow-btn-primary"
                      onClick={() => {
                        if (aiInsightModal.note) {
                          handleConvertToTaskAction(aiInsightModal.note);
                        }
                        setAiInsightModal({ isOpen: false, note: null, content: '', isGenerating: false });
                      }}
                    >
                      <CheckCircle2 size={14} style={{ marginRight: 6 }} /> Konversi ke Tugas Kanban
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
