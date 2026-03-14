import { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
  suggestions?: string[];
  time: string;
}

const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const WELCOME: Message = {
  id: 0,
  role: 'bot',
  text: "👋 Hi! I'm your **Course Allocation Assistant**.\n\nI can help you with courses, preferences, results, and more. What would you like to know?",
  suggestions: ['Show available courses', 'How to submit preferences', 'Check my results', 'How does allocation work?'],
  time: now(),
};

// Render markdown-lite: **bold**, bullet lines, newlines
function renderText(text: string) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={i} className="block">
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="font-semibold text-gray-900">{part}</strong> : part
        )}
      </span>
    );
  });
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now(), role: 'user', text: text.trim(), time: now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatAPI.send(text.trim());
      const botMsg: Message = {
        id: Date.now() + 1,
        role: 'bot',
        text: res.data.text,
        suggestions: res.data.suggestions,
        time: now(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        text: '⚠️ Sorry, something went wrong. Please try again.',
        time: now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #FF9AB7 0%, #93C5FD 100%)' }}
        aria-label="Open chatbot"
      >
        {open ? (
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        {/* Pulse ring */}
        {!open && (
          <span className="absolute w-16 h-16 rounded-full animate-ping opacity-30"
            style={{ background: 'linear-gradient(135deg, #FF9AB7, #93C5FD)' }} />
        )}
      </button>

      {/* ── Chat Window ── */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] flex flex-col rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${
          open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
        }`}
        style={{ height: 560, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,154,183,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #FF9AB7 0%, #93C5FD 100%)' }}>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">Course Assistant</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <p className="text-white/80 text-xs">Online — ready to help</p>
            </div>
          </div>
          <button onClick={() => setMessages([WELCOME])}
            className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            title="Clear chat">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#FF9AB7 transparent' }}>
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              {msg.role === 'bot' && (
                <div className="w-8 h-8 rounded-full flex-shrink-0 mr-2 flex items-center justify-center self-end mb-1"
                  style={{ background: 'linear-gradient(135deg, #FF9AB7, #93C5FD)' }}>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                </div>
              )}
              <div className="max-w-[78%]">
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'text-white rounded-br-sm'
                    : 'bg-gray-50 text-gray-800 rounded-bl-sm border border-gray-100'
                }`}
                  style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #FF9AB7, #FF7096)' } : {}}>
                  {renderText(msg.text)}
                </div>
                <p className={`text-xs text-gray-400 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.time}
                </p>
                {/* Suggestion chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.suggestions.map(s => (
                      <button key={s} onClick={() => send(s)}
                        className="text-xs px-3 py-1.5 rounded-full border transition-all duration-200 hover:scale-105 font-medium"
                        style={{ borderColor: '#FF9AB7', color: '#E91E63', background: 'rgba(255,154,183,0.08)' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="w-8 h-8 rounded-full flex-shrink-0 mr-2 flex items-center justify-center self-end"
                style={{ background: 'linear-gradient(135deg, #FF9AB7, #93C5FD)' }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                </svg>
              </div>
              <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0 bg-white/80">
          <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              disabled={loading}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40 hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #FF9AB7, #93C5FD)' }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">Powered by Course Allocation AI</p>
        </div>
      </div>
    </>
  );
}
