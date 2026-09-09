import React, { useState, useMemo } from 'react';
import {
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  Target,
  Sparkles,
  Trophy,
  Calendar,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  X,
  TrendingUp,
  Award,
  Zap,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

const HABIT_CATEGORIES = [
  'Semua',
  'Belajar & Skripsi',
  'Kesehatan & Kebugaran',
  'Mindfulness & Jiwa',
  'Karir & Finansial',
  'Rutinitas Harian'
];

const EMOJI_OPTIONS = ['📚', '💧', '🏃‍♂️', '🧘', '💻', '✍️', '🥦', '🛌', '🎯', '🌿', '💡', '⏰', '🔋', '📖', '🚴', '☕'];

const TIME_OPTIONS = [
  { id: 'anytime', label: 'Fleksibel' },
  { id: 'morning', label: 'Pagi Hari' },
  { id: 'afternoon', label: 'Siang Hari' },
  { id: 'evening', label: 'Malam Hari' }
];

export const HabitTrackerView = ({
  habits = [],
  onUpdateHabits,
  onAddToast,
  currentUser
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Belajar & Skripsi');
  const [formEmoji, setFormEmoji] = useState('📚');
  const [formTimeOfDay, setFormTimeOfDay] = useState('anytime');
  const [formGoal, setFormGoal] = useState('1x sehari');
  const [formColor, setFormColor] = useState('#6366f1');

  // Helper date generators for current week (Mon-Sun)
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const weekDays = useMemo(() => {
    const curr = new Date();
    // Monday as start of week
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diff));

    const days = [];
    const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      const iso = nextDate.toISOString().split('T')[0];
      days.push({
        name: dayNames[i],
        date: nextDate.getDate(),
        fullDate: iso,
        isToday: iso === todayStr
      });
    }
    return days;
  }, [todayStr]);

  // Filtered Habits
  const filteredHabits = useMemo(() => {
    return habits.filter((h) => {
      const matchCat = selectedCategory === 'Semua' || h.category === selectedCategory;
      const matchTime = selectedTimeFilter === 'all' || h.timeOfDay === selectedTimeFilter;
      const isTodayDone = !!h.history?.[todayStr];
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'completed'
          ? isTodayDone
          : !isTodayDone;
      return matchCat && matchTime && matchStatus;
    });
  }, [habits, selectedCategory, selectedTimeFilter, statusFilter, todayStr]);

  // Completion Stats for Today
  const todayStats = useMemo(() => {
    if (habits.length === 0) return { completed: 0, total: 0, percent: 0 };
    const completed = habits.filter((h) => h.history && h.history[todayStr]).length;
    const total = habits.length;
    const percent = Math.round((completed / total) * 100);
    return { completed, total, percent };
  }, [habits, todayStr]);

  // Overall Streaks
  const maxStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map((h) => h.streak || 0));
  }, [habits]);

  // Toggle habit on a given date
  const handleToggleDay = (habitId, dateStr) => {
    const updated = habits.map((h) => {
      if (h.id !== habitId) return h;
      const history = { ...(h.history || {}) };
      const wasDone = !!history[dateStr];

      if (wasDone) {
        delete history[dateStr];
      } else {
        history[dateStr] = true;
      }

      // Calculate streak
      let currentStreak = 0;
      if (dateStr === todayStr && !wasDone) {
        currentStreak = (h.streak || 0) + 1;
      } else if (dateStr === todayStr && wasDone) {
        currentStreak = Math.max(0, (h.streak || 1) - 1);
      } else {
        currentStreak = h.streak || 0;
      }

      const bestStreak = Math.max(h.bestStreak || 0, currentStreak);

      return {
        ...h,
        history,
        streak: currentStreak,
        bestStreak
      };
    });

    onUpdateHabits(updated);

    // Check if user just completed all habits today
    const wasHabitDone = habits.find((h) => h.id === habitId)?.history?.[dateStr];
    if (!wasHabitDone && dateStr === todayStr) {
      const remainingBeforeThis = habits.filter(
        (h) => h.id !== habitId && (!h.history || !h.history[todayStr])
      ).length;

      if (remainingBeforeThis === 0) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
        if (onAddToast) {
          onAddToast('🎉 Luar biasa! Seluruh kebiasaan hari ini telah selesai 100%!', 'success');
        }
      } else {
        if (onAddToast) {
          onAddToast('Mantap! Progres kebiasaan harian Anda bertambah.', 'info');
        }
      }
    }
  };

  const handleQuickAdd = (e) => {
    e?.preventDefault();
    if (!quickAddTitle.trim()) return;

    const newHabit = {
      id: 'habit-' + Date.now(),
      title: quickAddTitle.trim(),
      category: selectedCategory === 'Semua' ? 'Belajar & Skripsi' : selectedCategory,
      emoji: '🎯',
      timeOfDay: selectedTimeFilter === 'all' ? 'anytime' : selectedTimeFilter,
      goal: '1x sehari',
      color: '#6366f1',
      streak: 0,
      bestStreak: 0,
      history: {},
      createdAt: new Date().toISOString()
    };

    onUpdateHabits([newHabit, ...habits]);
    setQuickAddTitle('');
    if (onAddToast) onAddToast(`Kebiasaan "${newHabit.title}" berhasil ditambahkan!`, 'success');
  };

  const handleOpenAdd = () => {
    setEditingHabit(null);
    setFormTitle('');
    setFormCategory('Belajar & Skripsi');
    setFormEmoji('📚');
    setFormTimeOfDay('anytime');
    setFormGoal('1x sehari');
    setFormColor('#6366f1');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit) => {
    setEditingHabit(habit);
    setFormTitle(habit.title);
    setFormCategory(habit.category);
    setFormEmoji(habit.emoji || '🎯');
    setFormTimeOfDay(habit.timeOfDay || 'anytime');
    setFormGoal(habit.goal || '1x sehari');
    setFormColor(habit.color || '#6366f1');
    setIsModalOpen(true);
  };

  const handleSaveHabit = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingHabit) {
      const updated = habits.map((h) =>
        h.id === editingHabit.id
          ? {
              ...h,
              title: formTitle.trim(),
              category: formCategory,
              emoji: formEmoji,
              timeOfDay: formTimeOfDay,
              goal: formGoal,
              color: formColor
            }
          : h
      );
      onUpdateHabits(updated);
      if (onAddToast) onAddToast('Kebiasaan berhasil diperbarui!', 'success');
    } else {
      const newHabit = {
        id: 'habit-' + Date.now(),
        title: formTitle.trim(),
        category: formCategory,
        emoji: formEmoji,
        timeOfDay: formTimeOfDay,
        goal: formGoal,
        color: formColor,
        streak: 0,
        bestStreak: 0,
        history: {},
        createdAt: new Date().toISOString()
      };
      onUpdateHabits([newHabit, ...habits]);
      if (onAddToast) onAddToast(`Kebiasaan "${newHabit.title}" berhasil ditambahkan!`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDeleteHabit = (habitId, title) => {
    if (window.confirm(`Hapus kebiasaan "${title}"? Data streak akan dihapus.`)) {
      onUpdateHabits(habits.filter((h) => h.id !== habitId));
      if (onAddToast) onAddToast(`Kebiasaan "${title}" dihapus.`, 'info');
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px', width: '100%', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                padding: '3px 9px',
                borderRadius: 999,
                fontSize: '0.74rem',
                fontWeight: 700
              }}
            >
              <Flame size={13} /> Habit Tracker & Routine OS
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--flow-text-muted)' }}>
              Produktivitas Pribadi
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--flow-text-main)', margin: 0, letterSpacing: '-0.02em' }}>
            Pelacak Kebiasaan & Rutinitas
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--flow-text-subtle)', margin: '4px 0 0' }}>
            Bangun disiplin harian, rawat streak positif, dan raih target skripsi serta karier tanpa burnout.
          </p>
        </div>

        <button
          className="flow-btn flow-btn-primary"
          onClick={handleOpenAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 700, borderRadius: 10 }}
        >
          <Plus size={16} />
          <span>Tambah Kebiasaan</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28
        }}
      >
        {/* Metric 1: Today's Completion */}
        <div
          style={{
            background: 'var(--flow-bg-surface)',
            border: '1px solid var(--flow-border-subtle)',
            borderRadius: 14,
            padding: '18px 20px',
            boxShadow: 'var(--flow-shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--flow-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Target Hari Ini
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--flow-text-main)', margin: '4px 0' }}>
              {todayStats.completed} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--flow-text-muted)' }}>/ {todayStats.total}</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: todayStats.percent === 100 ? 'var(--flow-accent-emerald)' : 'var(--flow-text-subtle)', fontWeight: 600 }}>
              {todayStats.percent === 100 ? '✨ 100% Selesai Sempurna!' : `${todayStats.percent}% tercapai`}
            </div>
          </div>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: `conic-gradient(var(--flow-primary) ${todayStats.percent * 3.6}deg, rgba(99, 102, 241, 0.12) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--flow-bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.76rem',
                color: 'var(--flow-primary)'
              }}
            >
              {todayStats.percent}%
            </div>
          </div>
        </div>

        {/* Metric 2: Max Streak */}
        <div
          style={{
            background: 'var(--flow-bg-surface)',
            border: '1px solid var(--flow-border-subtle)',
            borderRadius: 14,
            padding: '18px 20px',
            boxShadow: 'var(--flow-shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--flow-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Streak Tertinggi
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', margin: '4px 0' }}>
              🔥 {maxStreak} Hari
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--flow-text-subtle)' }}>
              Konsistensi tanpa henti
            </div>
          </div>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Trophy size={24} />
          </div>
        </div>

        {/* Metric 3: Total Habits */}
        <div
          style={{
            background: 'var(--flow-bg-surface)',
            border: '1px solid var(--flow-border-subtle)',
            borderRadius: 14,
            padding: '18px 20px',
            boxShadow: 'var(--flow-shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--flow-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Kebiasaan Aktif
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--flow-text-main)', margin: '4px 0' }}>
              {habits.length} Rutinitas
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--flow-text-subtle)' }}>
              Tersebar di {new Set(habits.map((h) => h.category)).size} pilar hidup
            </div>
          </div>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--flow-accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Award size={24} />
          </div>
        </div>
      </div>

      {/* Filter Chips & Status Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 18
        }}
      >
        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {HABIT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="flow-pill-btn"
              style={{
                fontSize: '0.78rem',
                padding: '5px 12px',
                borderRadius: 20,
                background: selectedCategory === cat ? 'var(--flow-primary)' : 'var(--flow-bg-surface)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--flow-text-subtle)',
                borderColor: selectedCategory === cat ? 'var(--flow-primary)' : 'var(--flow-border-subtle)',
                fontWeight: selectedCategory === cat ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right Controls: Status Filter & Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Status Segmented Pill */}
          <div
            style={{
              display: 'inline-flex',
              padding: 3,
              borderRadius: 8,
              background: 'var(--flow-bg-elevated)',
              border: '1px solid var(--flow-border-subtle)'
            }}
          >
            {[
              { id: 'all', label: 'Semua' },
              { id: 'pending', label: '⚡ Belum Selesai' },
              { id: 'completed', label: '✓ Sudah Selesai' }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                style={{
                  border: 'none',
                  background: statusFilter === st.id ? 'var(--flow-bg-surface)' : 'transparent',
                  color: statusFilter === st.id ? 'var(--flow-text-main)' : 'var(--flow-text-muted)',
                  fontWeight: statusFilter === st.id ? 700 : 500,
                  fontSize: '0.74rem',
                  padding: '4px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  boxShadow: statusFilter === st.id ? 'var(--flow-shadow-sm)' : 'none',
                  transition: 'all 0.12s ease'
                }}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Time Filter Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={13} color="var(--flow-text-muted)" />
            <select
              value={selectedTimeFilter}
              onChange={(e) => setSelectedTimeFilter(e.target.value)}
              style={{
                fontSize: '0.78rem',
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid var(--flow-border-subtle)',
                background: 'var(--flow-bg-surface)',
                color: 'var(--flow-text-main)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">Semua Waktu</option>
              <option value="morning">Pagi Hari</option>
              <option value="afternoon">Siang Hari</option>
              <option value="evening">Malam Hari</option>
              <option value="anytime">Fleksibel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Habits Table / Weekly Matrix Card */}
      <div
        style={{
          background: 'var(--flow-bg-surface)',
          border: '1px solid var(--flow-border-subtle)',
          borderRadius: 16,
          boxShadow: 'var(--flow-shadow-md)',
          overflowX: 'auto'
        }}
      >
        {/* Inline Quick Add Bar */}
        <form
          onSubmit={handleQuickAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 18px',
            background: 'var(--flow-bg-elevated)',
            borderBottom: '1px solid var(--flow-border-subtle)'
          }}
        >
          <Plus size={15} color="var(--flow-primary)" />
          <input
            type="text"
            placeholder="Tambah kebiasaan cepat... (contoh: Membaca Buku 15 Menit, Minum Air 2 Liter) lalu tekan Enter"
            value={quickAddTitle}
            onChange={(e) => setQuickAddTitle(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.82rem',
              color: 'var(--flow-text-main)'
            }}
          />
          {quickAddTitle.trim() && (
            <button
              type="submit"
              className="flow-pill-btn active"
              style={{
                padding: '3px 12px',
                fontSize: '0.74rem',
                fontWeight: 700
              }}
            >
              Simpan
            </button>
          )}
        </form>

        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(240px, 1.8fr) repeat(7, minmax(44px, 1fr)) 110px 60px',
            minWidth: 700,
            padding: '14px 20px',
            background: 'var(--flow-bg-elevated)',
            borderBottom: '1px solid var(--flow-border-subtle)',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--flow-text-muted)'
          }}
        >
          <div>DAFTAR KEBIASAAN</div>
          {weekDays.map((d) => (
            <div
              key={d.fullDate}
              style={{
                textAlign: 'center',
                color: d.isToday ? 'var(--flow-primary)' : 'inherit',
                fontWeight: d.isToday ? 800 : 700
              }}
            >
              <div>{d.name}</div>
              <div
                style={{
                  fontSize: '0.72rem',
                  display: 'inline-block',
                  marginTop: 2,
                  padding: d.isToday ? '2px 6px' : '0',
                  background: d.isToday ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  borderRadius: 999
                }}
              >
                {d.date}
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'center' }}>STREAK</div>
          <div style={{ textAlign: 'center' }}>AKSI</div>
        </div>

        {/* Habits List */}
        {filteredHabits.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--flow-text-subtle)' }}>
            <Target size={42} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>
              Belum ada kebiasaan di kategori ini
            </div>
            <p style={{ fontSize: '0.84rem', margin: '6px 0 16px' }}>
              Mulai bangun kebiasaan harian Anda dengan menekan tombol di bawah.
            </p>
            <button className="flow-btn flow-btn-primary" onClick={handleOpenAdd}>
              <Plus size={14} style={{ marginRight: 6 }} /> Tambah Kebiasaan Pertama
            </button>
          </div>
        ) : (
          filteredHabits.map((habit, idx) => {
            const isTodayDone = !!habit.history?.[todayStr];
            return (
              <div
                key={habit.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(240px, 1.8fr) repeat(7, minmax(44px, 1fr)) 110px 60px',
                  minWidth: 700,
                  alignItems: 'center',
                  padding: '14px 20px',
                  borderBottom: idx === filteredHabits.length - 1 ? 'none' : '1px solid var(--flow-border-subtle)',
                  background: isTodayDone ? 'rgba(16, 185, 129, 0.02)' : 'transparent',
                  transition: 'background 0.2s'
                }}
              >
                {/* Column 1: Habit Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: habit.color ? `${habit.color}22` : 'rgba(99, 102, 241, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}
                  >
                    {habit.emoji || '🎯'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: 'var(--flow-text-main)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={habit.title}
                    >
                      {habit.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: 'var(--flow-bg-elevated)',
                          color: 'var(--flow-text-muted)',
                          border: '1px solid var(--flow-border-subtle)'
                        }}
                      >
                        {habit.category}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--flow-text-muted)' }}>
                        • {habit.goal || '1x sehari'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column 2-8: 7 Week Days Checkboxes */}
                {weekDays.map((d) => {
                  const isDone = !!habit.history?.[d.fullDate];
                  return (
                    <div key={d.fullDate} style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={(e) => handleToggleDay(habit.id, d.fullDate, e)}
                        title={`${habit.title}: ${isDone ? 'Selesai' : 'Belum selesai'} pada ${d.name} (${d.fullDate})`}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          border: isDone
                            ? 'none'
                            : d.isToday
                            ? '2px dashed var(--flow-primary)'
                            : '2px solid var(--flow-border-subtle)',
                          background: isDone ? (habit.color || 'var(--flow-accent-emerald)') : 'transparent',
                          color: isDone ? '#ffffff' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          transform: isDone ? 'scale(1.05)' : 'scale(1)'
                        }}
                      >
                        {isDone ? <Check size={16} strokeWidth={3} /> : null}
                      </button>
                    </div>
                  );
                })}

                {/* Column 9: Streak Pill */}
                <div style={{ textAlign: 'center' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: habit.streak > 0 ? '#f59e0b' : 'var(--flow-text-muted)',
                      background: habit.streak > 0 ? 'rgba(245, 158, 11, 0.12)' : 'var(--flow-bg-elevated)',
                      padding: '3px 8px',
                      borderRadius: 999
                    }}
                  >
                    <Flame size={12} fill={habit.streak > 0 ? '#f59e0b' : 'none'} />
                    {habit.streak || 0}d
                  </span>
                </div>

                {/* Column 10: Action Options */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <button
                    className="icon-btn"
                    onClick={() => handleOpenEdit(habit)}
                    title="Edit Kebiasaan"
                    style={{ width: 28, height: 28 }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => handleDeleteHabit(habit.id, habit.title)}
                    title="Hapus Kebiasaan"
                    style={{ width: 28, height: 28, color: 'var(--flow-accent-rose)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Motivation Banner at Bottom */}
      <div
        style={{
          marginTop: 28,
          padding: '18px 24px',
          borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(6, 182, 212, 0.08))',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'var(--flow-pilot-gradient)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Sparkles size={22} />
        </div>
        <div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--flow-text-main)' }}>
            Tips Kebiasaan Atomik (Atomic Habits)
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--flow-text-subtle)', marginTop: 2 }}>
            "Anda tidak naik ke tingkat tujuan Anda, melainkan jatuh ke tingkat sistem Anda. Cukup lakukan progres 1% lebih baik setiap hari."
          </div>
        </div>
      </div>

      {/* Modal: Add/Edit Habit */}
      {isModalOpen && (
        <div className="flow-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="flow-modal-card"
            style={{ maxWidth: 480 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flow-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={18} color="var(--flow-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800 }}>
                  {editingHabit ? 'Edit Kebiasaan' : 'Tambah Kebiasaan Baru'}
                </h3>
              </div>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveHabit} style={{ padding: '20px' }}>
              {/* Emoji & Title */}
              <div style={{ marginBottom: 16 }}>
                <label className="flow-auth-label" style={{ marginBottom: 6 }}>
                  Nama Kebiasaan *
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <select
                    value={formEmoji}
                    onChange={(e) => setFormEmoji(e.target.value)}
                    style={{
                      fontSize: '1.3rem',
                      padding: '8px',
                      borderRadius: 10,
                      border: '1px solid var(--flow-border-subtle)',
                      background: 'var(--flow-bg-surface)',
                      cursor: 'pointer'
                    }}
                  >
                    {EMOJI_OPTIONS.map((em) => (
                      <option key={em} value={em}>
                        {em}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className="flow-auth-input"
                    placeholder="misal: Membaca Jurnal 30 Menit"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Category */}
              <div style={{ marginBottom: 16 }}>
                <label className="flow-auth-label" style={{ marginBottom: 6 }}>
                  Pilar / Kategori
                </label>
                <select
                  className="flow-auth-input"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  {HABIT_CATEGORIES.filter((c) => c !== 'Semua').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time of Day & Target */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label className="flow-auth-label" style={{ marginBottom: 6 }}>
                    Waktu Rutinitas
                  </label>
                  <select
                    className="flow-auth-input"
                    value={formTimeOfDay}
                    onChange={(e) => setFormTimeOfDay(e.target.value)}
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flow-auth-label" style={{ marginBottom: 6 }}>
                    Frekuensi Target
                  </label>
                  <input
                    type="text"
                    className="flow-auth-input"
                    value={formGoal}
                    onChange={(e) => setFormGoal(e.target.value)}
                    placeholder="1x sehari"
                  />
                </div>
              </div>

              {/* Color Accent Picker */}
              <div style={{ marginBottom: 20 }}>
                <label className="flow-auth-label" style={{ marginBottom: 8 }}>
                  Warna Aksen
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormColor(color)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: color,
                        border: formColor === color ? '2px solid #ffffff' : 'none',
                        boxShadow: formColor === color ? `0 0 0 2px ${color}` : 'none',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Footer Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <button
                  type="button"
                  className="flow-btn flow-btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="flow-btn flow-btn-primary" style={{ padding: '8px 20px' }}>
                  {editingHabit ? 'Simpan Perubahan' : 'Tambah Kebiasaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
