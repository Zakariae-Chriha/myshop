import { useState, useRef, useEffect } from 'react';
import BASE_URL from '../api/config';

const CHAT_URL = `${BASE_URL}/api/chat`;

const ChatWidget = () => {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! 👋 How can I help you today?' }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { from: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const reply = data.reply || data.output || 'Sorry, I could not process your request.';
      setMessages(prev => [...prev, { from: 'bot', text: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        from: 'bot',
        text: 'Sorry, I am currently unavailable. Please email us at chrihazakaria@gmail.com',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className="chat-window" style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 9999,
          width: 340, height: 480,
          background: 'rgba(10,10,20,0.97)',
          border: '1px solid rgba(108,99,255,0.3)',
          borderRadius: 16,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(255,101,132,0.2))',
            borderBottom: '1px solid rgba(108,99,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem',
              }}>🤖</div>
              <div>
                <div style={{ color: '#F1F5F9', fontWeight: 700, fontSize: '0.9rem' }}>ZC Brands Support</div>
                <div style={{ color: '#22C55E', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                  Online
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'transparent', border: 'none',
              color: '#475569', cursor: 'pointer', fontSize: '1.1rem',
              padding: '0.25rem',
            }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '0.6rem 0.875rem',
                  borderRadius: msg.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.from === 'user'
                    ? 'linear-gradient(135deg, #6C63FF, #8B5CF6)'
                    : 'rgba(255,255,255,0.07)',
                  color: '#F1F5F9',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  border: msg.from === 'bot' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '0.6rem 0.875rem',
                  borderRadius: '16px 16px 16px 4px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', gap: 4, alignItems: 'center',
                }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: '#6C63FF',
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', gap: '0.5rem',
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type your message..."
              disabled={loading}
              style={{
                flex: 1, padding: '0.6rem 0.875rem',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20, color: '#F1F5F9',
                fontSize: '0.85rem', outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, #6C63FF, #FF6584)'
                  : 'rgba(255,255,255,0.1)',
                border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: '0 4px 20px rgba(108,99,255,0.5)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? '✕' : '💬'}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
};

export default ChatWidget;
