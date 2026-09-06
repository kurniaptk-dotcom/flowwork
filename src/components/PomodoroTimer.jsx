import React, { useState } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Flame, Award } from 'lucide-react';

export const PomodoroTimer = ({
  minutes,
  seconds,
  isRunning,
  timerMode,
  setTimerMode,
  toggleTimer,
  resetTimer,
  tasks,
  selectedTaskId,
  setSelectedTaskId,
  completedSessions
}) => {
  const activeTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="pomodoro-container">
      <div className="pomodoro-card">
        {/* Mode Selector */}
        <div className="timer-modes">
          <button
            className={`timer-mode-btn ${timerMode === 'focus' ? 'active' : ''}`}
            onClick={() => setTimerMode('focus')}
          >
            🔥 Focus (25m)
          </button>
          <button
            className={`timer-mode-btn ${timerMode === 'shortBreak' ? 'active' : ''}`}
            onClick={() => setTimerMode('shortBreak')}
          >
            ☕ Short Break (5m)
          </button>
          <button
            className={`timer-mode-btn ${timerMode === 'longBreak' ? 'active' : ''}`}
            onClick={() => setTimerMode('longBreak')}
          >
            🌴 Long Break (15m)
          </button>
        </div>

        {/* Big Digital Timer Display */}
        <div className="timer-display">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        {/* Target Task Selection */}
        <div style={{ width: '100%', maxWidth: 380, marginBottom: 24 }}>
          <label className="meta-field-label" style={{ textAlign: 'center', justifyContent: 'center' }}>
            Fokus Pada Tugas:
          </label>
          <select
            className="meta-field-input"
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
          >
            <option value="">-- Pilih Tugas dari Board --</option>
            {tasks
              .filter((t) => t.status !== 'done')
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
          </select>
        </div>

        {/* Controls */}
        <div className="timer-controls">
          <button className="icon-btn" onClick={resetTimer} title="Reset Timer">
            <RotateCcw size={18} />
          </button>

          <button className="timer-play-btn" onClick={toggleTimer}>
            {isRunning ? (
              <>
                <Pause size={20} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={20} />
                <span>Mulai Fokus</span>
              </>
            )}
          </button>
        </div>

        {/* Session Count & Streak */}
        <div
          style={{
            marginTop: 32,
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-around',
            color: 'var(--text-secondary)',
            fontSize: '0.88rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={16} color="var(--accent-primary)" />
            <span>Sesi Selesai: <strong>{completedSessions}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Flame size={16} color="var(--color-high)" />
            <span>Daily Streak: <strong>4 Hari</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
