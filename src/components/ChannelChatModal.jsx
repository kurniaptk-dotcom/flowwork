import React, { useState, useEffect } from 'react';
import { X, Hash, Send, Smile, Paperclip } from 'lucide-react';

export const ChannelChatModal = ({ channelName, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // Load channel messages from localStorage whenever channelName or isOpen changes
  useEffect(() => {
    if (!isOpen || !channelName) return;
    try {
      const saved = localStorage.getItem(`flowwork_channel_${channelName}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        const initial = [
          {
            id: 'm-1',
            sender: 'Kurnia (You)',
            avatar: 'K',
            color: '#00a884',
            text: `Selamat datang di channel #${channelName}! Silakan bagikan pembaruan atau diskusi sprint di sini.`,
            time: '09:00'
          },
          {
            id: 'm-2',
            sender: 'Dimas Pratama',
            avatar: 'DP',
            color: '#10b981',
            text: 'Siap mas Kurnia! Task sudah saya sinkronkan dengan kanban board.',
            time: '09:15'
          }
        ];
        setMessages(initial);
        localStorage.setItem(`flowwork_channel_${channelName}`, JSON.stringify(initial));
      }
    } catch {
      // fallback
    }
  }, [channelName, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const newMsg = {
      id: 'm-' + Date.now(),
      sender: 'Kurnia (You)',
      avatar: 'K',
      color: '#00a884',
      text: userText,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setInputText('');
    try {
      localStorage.setItem(`flowwork_channel_${channelName}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    // Automated simulated team reply
    setTimeout(() => {
      const replies = [
        { sender: 'Sarah Chen', avatar: 'SC', color: '#ec4899', text: 'Catat mas! Segera saya update mockups dan asetnya.' },
        { sender: 'Dimas Pratama', avatar: 'DP', color: '#10b981', text: 'Oke mas, PR terkait fitur ini sudah siap direview.' },
        { sender: 'Elena Rostova', avatar: 'ER', color: '#f59e0b', text: 'Skenario testing sudah saya siapkan di QA board.' }
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const botMsg = {
        id: 'm-' + (Date.now() + 1),
        sender: randomReply.sender,
        avatar: randomReply.avatar,
        color: randomReply.color,
        text: randomReply.text,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => {
        const nextList = [...prev, botMsg];
        try {
          localStorage.setItem(`flowwork_channel_${channelName}`, JSON.stringify(nextList));
        } catch {}
        return nextList;
      });
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 580, height: '70vh' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Hash size={18} color="var(--cu-primary-blue)" />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{channelName}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--cu-text-muted)' }}>Channel Tim • Live Persistence</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Message Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: msg.color,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {msg.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--cu-text-main)' }}>
                    {msg.sender}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--cu-text-muted)' }}>{msg.time}</span>
                </div>
                <div
                  style={{
                    fontSize: '0.86rem',
                    color: 'var(--cu-text-subtle)',
                    background: 'var(--cu-main-bg)',
                    padding: '8px 12px',
                    borderRadius: 8,
                    display: 'inline-block'
                  }}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--cu-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--cu-sidebar-bg)'
          }}
        >
          <input
            type="text"
            className="meta-field-input"
            placeholder={`Kirim pesan ke #${channelName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            autoFocus
          />
          <button type="submit" className="clickup-create-btn" style={{ padding: '7px 14px' }}>
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
