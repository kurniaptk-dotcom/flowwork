import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  Plus,
  Mic,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Zap,
  Play,
  Code,
  ShieldCheck,
  X,
  Cpu
} from 'lucide-react';

export const FlowPilotView = ({ tasks = [], onAddTask, onAddToast }) => {
  const [mode, setMode] = useState('ask'); // 'ask' | 'agents'
  const [prompt, setPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [selectedModel, setSelectedModel] = useState('Claude 3.5 Sonnet');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Autonomous Agents
  const [agents, setAgents] = useState([
    {
      id: 'agent-1',
      name: 'Flow Velocity Agent',
      role: 'Monitors sprint backlog, detects bottlenecks, and balances workload',
      status: 'active',
      icon: Zap,
      color: 'var(--flow-primary)',
      lastRun: '8m lalu',
      stats: '14 tasks analyzed'
    },
    {
      id: 'agent-2',
      name: 'Code Review & QA Agent',
      role: 'Verifies test checklists before moving tickets to Done',
      status: 'active',
      icon: Code,
      color: 'var(--flow-accent-cyan)',
      lastRun: '45m lalu',
      stats: '5 pull requests audited'
    },
    {
      id: 'agent-3',
      name: 'Bug Triage & Security Agent',
      role: 'Scans CVE vulnerabilities and auto-prioritizes urgent tickets',
      status: 'paused',
      icon: ShieldCheck,
      color: 'var(--flow-accent-rose)',
      lastRun: '2j lalu',
      stats: '2 warnings resolved'
    }
  ]);

  const skillsList = [
    { id: 'weekly-summary', title: 'Evaluasi & Ringkasan Progres Mingguan', desc: 'Ringkasan tugas selesai, kendala/blocker, dan target berikutnya.', prompt: 'Buatkan ringkasan progres tugas dan proyek saat ini, tugas apa yang sudah selesai, dan target prioritas berikutnya.' },
    { id: 'task-decomposition', title: 'Breakdown Tugas & Makalah', desc: 'Memecah tugas besar/proyek menjadi checklist langkah praktis.', prompt: 'Bagi tugas proyek atau materi kuliah besar ini menjadi 4 subtask praktis yang siap dikerjakan.' },
    { id: 'priority-matrix', title: 'Matriks Prioritas Eisenhower', desc: 'Evaluasi tugas mendesak vs penting untuk produktivitas optimal.', prompt: 'Analisis tugas mana yang harus saya prioritaskan terlebih dahulu berdasarkan batas waktu terdekat.' },
    { id: 'client-report', title: 'Laporan Progres Klien / Dosen', desc: 'Format laporan rapi yang siap dikirim ke klien atau dosen.', prompt: 'Tuliskan draft laporan progres tugas yang sopan dan profesional untuk dikirim ke klien atau dosen pembimbing.' }
  ];

  const handleExecuteAI = (customText) => {
    const query = customText || prompt;
    if (!query.trim()) return;

    setIsThinking(true);
    setAiResponse('');

    setTimeout(() => {
      setIsThinking(false);
      const totalTasks = tasks.length;
      const doneTasks = tasks.filter((t) => t.status === 'done').length;
      const urgentTasks = tasks.filter((t) => t.priority === 'urgent').length;

      setAiResponse(
        `⚡ **KeepWork AI Intelligence (${selectedModel})**\n\n` +
        `• **Workspace Health:** Dari total **${totalTasks} tugas**, sebanyak **${doneTasks} tugas** telah selesai (${Math.round((doneTasks / (totalTasks || 1)) * 100)}% progress sprint).\n` +
        `• **Prioritas Utama:** Terdapat **${urgentTasks} tugas berkategori Urgent** yang memerlukan tindak lanjut sebelum jadwal sprint berakhir.\n` +
        `• **Rekomendasi KeepWork AI:** Seimbangkan alokasi tugas backend pada Dimas Pratama agar tidak terjadi penumpukan di fase Review & QA.`
      );
    }, 800);
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setPrompt('Buatkan ringkasan status sprint minggu ini untuk tim produk');
      handleExecuteAI('Buatkan ringkasan status sprint minggu ini untuk tim produk');
    }, 1800);
  };

  const toggleAgent = (agentId) => {
    setAgents(agents.map(a => a.id === agentId ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a));
  };

  const runAgentNow = (agent) => {
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
      setAiResponse(`⚡ **${agent.name}** selesai dieksekusi secara otonom!\nSemua dependensi tugas telah diverifikasi, performa sprint berada pada lintasan optimal.`);
    }, 700);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px', maxWidth: 880, margin: '0 auto', width: '100%' }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'var(--flow-pilot-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            margin: '0 auto 12px auto',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
          }}
        >
          <Cpu size={26} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--flow-text-main)', marginBottom: 4 }}>
          KeepWork AI
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--flow-text-subtle)' }}>
          Workspace Copilot & Autonomous Engineering Agents
        </p>
      </div>

      {/* Mode Toggle: Ask / Agents */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', padding: 4, background: 'var(--flow-bg-elevated)', borderRadius: 10, border: '1px solid var(--flow-border-subtle)' }}>
          <button
            className={`tab-btn ${mode === 'ask' ? 'active' : ''}`}
            style={{ padding: '6px 16px', fontSize: '0.84rem' }}
            onClick={() => setMode('ask')}
          >
            <Sparkles size={14} color="var(--flow-primary)" />
            <span>Ask KeepWork AI</span>
          </button>
          <button
            className={`tab-btn ${mode === 'agents' ? 'active' : ''}`}
            style={{ padding: '6px 16px', fontSize: '0.84rem' }}
            onClick={() => setMode('agents')}
          >
            <Bot size={14} />
            <span>Autonomous Agents ({agents.filter(a => a.status === 'active').length})</span>
          </button>
        </div>
      </div>

      {mode === 'ask' ? (
        <>
          {/* Main Input Prompt Card */}
          <div
            style={{
              background: 'var(--flow-bg-surface)',
              border: '1px solid var(--flow-border-subtle)',
              borderRadius: 14,
              padding: '16px 18px',
              boxShadow: 'var(--flow-shadow-md)',
              marginBottom: 20
            }}
          >
            <textarea
              style={{
                width: '100%',
                minHeight: 80,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.94rem',
                color: 'var(--flow-text-main)',
                resize: 'none',
                lineHeight: 1.5
              }}
              placeholder={isListening ? "Mendengarkan suara Anda... (Bicara sekarang)" : "Ask KeepWork AI anything about your tasks, velocity, or code..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleExecuteAI();
                }
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--flow-border-subtle)', paddingTop: 12, marginTop: 10 }}>
              <button
                className="tab-btn"
                style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                onClick={() => setShowSkillsModal(true)}
              >
                <Plus size={13} />
                <span>Productivity Skills</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
                {/* Model Selector */}
                <div style={{ position: 'relative' }}>
                  <button
                    className="tab-btn"
                    style={{ fontSize: '0.8rem', padding: '4px 10px', color: 'var(--flow-primary)', fontWeight: 600 }}
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                  >
                    <Sparkles size={13} />
                    <span>{selectedModel}</span>
                    <ChevronDown size={12} />
                  </button>

                  {showModelDropdown && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 38,
                        right: 0,
                        width: 220,
                        background: 'var(--flow-bg-surface)',
                        border: '1px solid var(--flow-border-subtle)',
                        borderRadius: 10,
                        boxShadow: 'var(--flow-shadow-lg)',
                        zIndex: 200,
                        padding: 6
                      }}
                    >
                      {['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro'].map((m) => (
                        <div
                          key={m}
                          style={{
                            padding: '8px 10px',
                            fontSize: '0.82rem',
                            fontWeight: selectedModel === m ? 700 : 500,
                            color: selectedModel === m ? 'var(--flow-primary)' : 'var(--flow-text-main)',
                            borderRadius: 6,
                            cursor: 'pointer',
                            background: selectedModel === m ? 'var(--flow-primary-light)' : 'transparent'
                          }}
                          onClick={() => {
                            setSelectedModel(m);
                            setShowModelDropdown(false);
                          }}
                        >
                          {m}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mic Button */}
                <button
                  className="icon-btn"
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: isListening ? 'var(--flow-accent-rose)' : undefined,
                    color: isListening ? '#fff' : undefined
                  }}
                  title="Voice dictation"
                  onClick={handleVoiceInput}
                >
                  <Mic size={15} />
                </button>

                <button
                  className="clickup-create-btn"
                  onClick={() => handleExecuteAI()}
                  disabled={isThinking}
                >
                  <Send size={14} />
                  <span>{isThinking ? 'Analyzing...' : 'Send'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Response Display */}
          {aiResponse && (
            <div
              style={{
                width: '100%',
                background: 'var(--flow-bg-surface)',
                border: '1px solid var(--flow-border-subtle)',
                borderRadius: 14,
                padding: '18px 22px',
                boxShadow: 'var(--flow-shadow-md)',
                animation: 'fadeIn 0.18s ease',
                marginBottom: 20
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Cpu size={16} color="var(--flow-primary)" />
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>
                  KeepWork AI Assistant ({selectedModel})
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--flow-text-subtle)', whiteSpace: 'pre-line' }}>
                {aiResponse}
              </div>
            </div>
          )}

          {/* Quick Starter Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            <button
              className="tab-btn"
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              onClick={() => {
                setPrompt('Ringkas tugas prioritas urgent');
                handleExecuteAI('Ringkas tugas prioritas urgent');
              }}
            >
              <AlertCircle size={13} color="var(--flow-accent-rose)" />
              <span>Cek Tugas Urgent</span>
            </button>
            <button
              className="tab-btn"
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              onClick={() => {
                setPrompt('Bagikan pembaruan progres tugas pekan ini');
                handleExecuteAI('Bagikan pembaruan progres tugas pekan ini');
              }}
            >
              <CheckCircle2 size={13} color="var(--flow-accent-emerald)" />
              <span>Progres Tugas</span>
            </button>
            <button
              className="tab-btn"
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              onClick={() => {
                setPrompt('Rekomendasi alokasi waktu dan fokus harian');
                handleExecuteAI('Rekomendasi alokasi waktu dan fokus harian');
              }}
            >
              <FileText size={13} color="var(--flow-accent-cyan)" />
              <span>Alokasi Waktu</span>
            </button>
          </div>
        </>
      ) : (
        /* Autonomous AI Agents View */
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ marginBottom: 4 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>
              Autonomous Workflow Agents
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--flow-text-subtle)' }}>
              Agen AI cerdas yang berjalan di latar belakang untuk mengotomasi alur kerja, pengujian, dan manajemen tugas.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {agents.map((agent) => {
              const Icon = agent.icon;
              const isActive = agent.status === 'active';

              return (
                <div
                  key={agent.id}
                  style={{
                    background: 'var(--flow-bg-surface)',
                    border: '1px solid var(--flow-border-subtle)',
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                    boxShadow: 'var(--flow-shadow-sm)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          backgroundColor: 'var(--flow-bg-elevated)',
                          color: agent.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon size={18} />
                      </div>

                      <button
                        onClick={() => toggleAgent(agent.id)}
                        className="tab-btn"
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          color: isActive ? 'var(--flow-accent-emerald)' : 'var(--flow-text-muted)'
                        }}
                      >
                        {isActive ? '● Active' : '○ Paused'}
                      </button>
                    </div>

                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--flow-text-main)', marginBottom: 4 }}>
                      {agent.name}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--flow-text-subtle)', lineHeight: 1.4 }}>
                      {agent.role}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--flow-border-subtle)', paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)' }}>
                      <span>{agent.stats}</span>
                    </div>

                    <button
                      className="clickup-create-btn"
                      style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                      onClick={() => runAgentNow(agent)}
                    >
                      <Play size={11} />
                      <span>Run Now</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {aiResponse && (
            <div
              style={{
                width: '100%',
                background: 'var(--flow-bg-surface)',
                border: '1px solid var(--flow-border-subtle)',
                borderRadius: 12,
                padding: '16px 20px',
                marginTop: 10
              }}
            >
              <div style={{ fontSize: '0.86rem', color: 'var(--flow-text-main)', whiteSpace: 'pre-line' }}>
                {aiResponse}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skills Selection Modal */}
      {showSkillsModal && (
        <div className="modal-backdrop" onClick={() => setShowSkillsModal(false)}>
          <div className="modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>KeepWork AI Productivity Skills</span>
              <button className="icon-btn" onClick={() => setShowSkillsModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {skillsList.map((skill) => (
                <div
                  key={skill.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    background: 'var(--flow-bg-elevated)',
                    border: '1px solid var(--flow-border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => {
                    setPrompt(skill.prompt);
                    setShowSkillsModal(false);
                    handleExecuteAI(skill.prompt);
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--flow-text-main)', marginBottom: 2 }}>
                    {skill.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--flow-text-subtle)' }}>
                    {skill.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
