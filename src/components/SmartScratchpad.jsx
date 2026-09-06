import React, { useState, useRef, useEffect } from 'react';
import {
  StickyNote,
  Plus,
  Pin,
  PinOff,
  Trash2,
  ArrowRightToLine,
  Search,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  Edit3,
  Maximize2,
  Minimize2
} from 'lucide-react';

const STORAGE_KEY = 'flowwork_scratchpad_notes';

const getStoredNotes = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveNotes = (notes) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export const SmartScratchpad = ({ onConvertToTask, onAddToast, isCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [scratchNotes, setScratchNotes] = useState(getStoredNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [newNoteMode, setNewNoteMode] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const textareaRef = useRef(null);
  const panelRef = useRef(null);

  // Persist notes
  useEffect(() => {
    saveNotes(scratchNotes);
  }, [scratchNotes]);

  // Auto-focus new note textarea
  useEffect(() => {
    if (newNoteMode && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [newNoteMode]);

  const handleCreateNote = () => {
    if (!newContent.trim() && !newTitle.trim()) return;
    const note = {
      id: `scratch-${Date.now()}`,
      title: newTitle.trim() || newContent.trim().slice(0, 40),
      content: newContent.trim(),
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setScratchNotes(prev => [note, ...prev]);
    setNewTitle('');
    setNewContent('');
    setNewNoteMode(false);
    onAddToast?.('📝 Catatan baru ditambahkan', 'success');
  };

  const handleDeleteNote = (id) => {
    setScratchNotes(prev => prev.filter(n => n.id !== id));
    onAddToast?.('Catatan dihapus', 'info');
  };

  const handleTogglePin = (id) => {
    setScratchNotes(prev =>
      prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n)
    );
  };

  const handleStartEdit = (note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    setScratchNotes(prev =>
      prev.map(n =>
        n.id === editingId
          ? { ...n, title: editTitle.trim() || editContent.trim().slice(0, 40), content: editContent, updatedAt: new Date().toISOString() }
          : n
      )
    );
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleConvertToTask = (note) => {
    if (onConvertToTask) {
      onConvertToTask({
        title: note.title,
        description: note.content,
        priority: 'normal',
        status: 'to-do'
      });
      // Mark as converted visually
      setScratchNotes(prev =>
        prev.map(n => n.id === note.id ? { ...n, converted: true } : n)
      );
      onAddToast?.(`✅ "${note.title}" dijadikan tugas sprint!`, 'success');
    }
  };

  // Sort: pinned first, then by date
  const sortedNotes = [...scratchNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const filteredNotes = searchQuery.trim()
    ? sortedNotes.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedNotes;

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Baru saja';
    if (diffMin < 60) return `${diffMin}m lalu`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}j lalu`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}h lalu`;
  };

  if (isCollapsed) {
    return (
      <div
        className="flow-nav-item"
        style={{ padding: '6px 8px', justifyContent: 'center' }}
        onClick={() => setIsOpen(!isOpen)}
        title="Smart Scratchpad"
      >
        <StickyNote size={16} color="var(--flow-accent-amber)" />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <div
        className="flow-nav-item"
        style={{ padding: '6px 8px', fontSize: '0.8rem', cursor: 'pointer' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StickyNote size={14} color="var(--flow-accent-amber)" />
          <span>Smart Scratchpad</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {scratchNotes.length > 0 && (
            <span className="scratchpad-badge">{scratchNotes.length}</span>
          )}
          {isOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </div>
      </div>

      {/* Scratchpad Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className={`scratchpad-panel ${isExpanded ? 'scratchpad-expanded' : ''}`}
        >
          {/* Panel Header */}
          <div className="scratchpad-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={13} color="var(--flow-accent-amber)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>
                Catatan Cepat
              </span>
              <span style={{ fontSize: '0.66rem', color: 'var(--flow-text-muted)' }}>
                ({filteredNotes.length})
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <button
                className="scratchpad-icon-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Perkecil' : 'Perbesar'}
              >
                {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </button>
              <button
                className="scratchpad-icon-btn"
                onClick={() => { setNewNoteMode(true); setEditingId(null); }}
                title="Catatan baru"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          {/* Search */}
          {scratchNotes.length > 2 && (
            <div className="scratchpad-search">
              <Search size={12} color="var(--flow-text-muted)" />
              <input
                type="text"
                placeholder="Cari catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="scratchpad-search-input"
              />
              {searchQuery && (
                <button className="scratchpad-icon-btn" onClick={() => setSearchQuery('')}>
                  <X size={11} />
                </button>
              )}
            </div>
          )}

          {/* New Note Form */}
          {newNoteMode && (
            <div className="scratchpad-new-note">
              <input
                type="text"
                placeholder="Judul catatan..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="scratchpad-title-input"
              />
              <textarea
                ref={textareaRef}
                placeholder="Tulis catatan cepat di sini... Ide, reminder, atau apapun yang terlintas."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="scratchpad-textarea"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleCreateNote();
                  }
                }}
              />
              <div className="scratchpad-new-actions">
                <span style={{ fontSize: '0.64rem', color: 'var(--flow-text-muted)' }}>
                  Ctrl+Enter untuk simpan
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className="scratchpad-btn-cancel"
                    onClick={() => { setNewNoteMode(false); setNewTitle(''); setNewContent(''); }}
                  >
                    Batal
                  </button>
                  <button className="scratchpad-btn-save" onClick={handleCreateNote}>
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes List */}
          <div className="scratchpad-notes-list">
            {filteredNotes.length === 0 && !newNoteMode && (
              <div className="scratchpad-empty">
                <StickyNote size={24} color="var(--flow-text-muted)" style={{ opacity: 0.4 }} />
                <p>Belum ada catatan.</p>
                <button
                  className="scratchpad-btn-save"
                  onClick={() => setNewNoteMode(true)}
                  style={{ marginTop: 4 }}
                >
                  <Plus size={12} /> Tulis Catatan Pertama
                </button>
              </div>
            )}

            {filteredNotes.map(note => (
              <div
                key={note.id}
                className={`scratchpad-note-card ${note.pinned ? 'pinned' : ''} ${note.converted ? 'converted' : ''}`}
              >
                {/* Edit Mode */}
                {editingId === note.id ? (
                  <div className="scratchpad-edit-mode">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="scratchpad-title-input"
                      placeholder="Judul..."
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="scratchpad-textarea"
                      rows={3}
                      autoFocus
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <button className="scratchpad-btn-cancel" onClick={() => setEditingId(null)}>
                        Batal
                      </button>
                      <button className="scratchpad-btn-save" onClick={handleSaveEdit}>
                        Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Note Header */}
                    <div className="scratchpad-note-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                        {note.pinned && <Pin size={10} color="var(--flow-accent-amber)" style={{ flexShrink: 0 }} />}
                        {note.converted && <CheckCircle2 size={10} color="var(--flow-accent-green)" style={{ flexShrink: 0 }} />}
                        <span className="scratchpad-note-title">{note.title}</span>
                      </div>
                      <div className="scratchpad-note-actions">
                        <button
                          className="scratchpad-icon-btn"
                          onClick={() => handleTogglePin(note.id)}
                          title={note.pinned ? 'Lepas pin' : 'Pin catatan'}
                        >
                          {note.pinned ? <PinOff size={11} /> : <Pin size={11} />}
                        </button>
                        <button
                          className="scratchpad-icon-btn"
                          onClick={() => handleStartEdit(note)}
                          title="Edit"
                        >
                          <Edit3 size={11} />
                        </button>
                        <button
                          className="scratchpad-icon-btn scratchpad-delete-btn"
                          onClick={() => handleDeleteNote(note.id)}
                          title="Hapus"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Note Content Preview */}
                    {note.content && (
                      <p className="scratchpad-note-content">
                        {note.content.length > 120 ? note.content.slice(0, 120) + '...' : note.content}
                      </p>
                    )}

                    {/* Note Footer */}
                    <div className="scratchpad-note-footer">
                      <span className="scratchpad-time">
                        <Clock size={10} /> {formatTime(note.createdAt)}
                      </span>
                      {!note.converted ? (
                        <button
                          className="scratchpad-convert-btn"
                          onClick={() => handleConvertToTask(note)}
                          title="Jadikan tugas sprint"
                        >
                          <ArrowRightToLine size={11} />
                          <span>Jadikan Tugas</span>
                        </button>
                      ) : (
                        <span className="scratchpad-converted-badge">
                          <CheckCircle2 size={10} /> Sudah jadi tugas
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
