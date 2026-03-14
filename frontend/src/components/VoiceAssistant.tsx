import { useState, useEffect, useRef, useCallback } from 'react';
import { chatAPI } from '../services/api';

type Status = 'idle' | 'listening' | 'processing' | 'speaking';

// Extend Window for browser speech APIs
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const WAKE_WORDS = ['hey assistant', 'hello assistant', 'hi assistant', 'ok assistant'];

function speak(text: string, onEnd?: () => void) {
  window.speechSynthesis.cancel();
  // Strip markdown bold markers for cleaner speech
  const clean = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/[•\-]/g, '').replace(/\n+/g, '. ');
  const utter = new SpeechSynthesisUtterance(clean);
  utter.rate = 1.0;
  utter.pitch = 1.1;
  utter.volume = 1;
  // Prefer a natural English voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang.startsWith('en') && v.localService) || voices[0];
  if (preferred) utter.voice = preferred;
  if (onEnd) utter.onend = onEnd;
  window.speechSynthesis.speak(utter);
}

export default function VoiceAssistant() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  // Check browser support
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  // Auto-scroll history
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  const processQuery = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setStatus('processing');
    setTranscript(query);
    setResponse('');
    setError('');

    try {
      const res = await chatAPI.send(query);
      const answer = res.data.text || 'Sorry, I could not get a response.';
      setResponse(answer);
      setStatus('speaking');
      setHistory(prev => [...prev, { q: query, a: answer }]);
      speak(answer, () => setStatus('idle'));
    } catch {
      const errMsg = 'Sorry, I encountered an error. Please try again.';
      setError(errMsg);
      setStatus('speaking');
      speak(errMsg, () => setStatus('idle'));
    }
  }, []);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    window.speechSynthesis.cancel();
    setStatus('listening');
    setTranscript('');
    setResponse('');
    setError('');

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (e: any) => {
      const interim = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setTranscript(interim);

      if (e.results[e.results.length - 1].isFinal) {
        const final = e.results[e.results.length - 1][0].transcript.trim();
        // Strip wake word if present
        let query = final;
        for (const w of WAKE_WORDS) {
          if (query.toLowerCase().startsWith(w)) {
            query = query.slice(w.length).trim();
            break;
          }
        }
        stopListening();
        processQuery(query || final);
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error === 'no-speech') {
        setStatus('idle');
        setTranscript('');
      } else {
        setError(`Mic error: ${e.error}`);
        setStatus('idle');
      }
    };

    recognition.onend = () => {
      if (status === 'listening') setStatus('idle');
    };

    recognition.start();
  }, [processQuery, stopListening, status]);

  const handleMicClick = () => {
    if (status === 'listening') {
      stopListening();
      setStatus('idle');
    } else if (status === 'speaking') {
      window.speechSynthesis.cancel();
      setStatus('idle');
    } else {
      startListening();
    }
  };

  const handleClose = () => {
    stopListening();
    window.speechSynthesis.cancel();
    setStatus('idle');
    setOpen(false);
  };

  const statusConfig = {
    idle:       { label: 'Tap mic to speak',    color: '#6B7280', bg: 'from-gray-100 to-gray-200',     ring: '' },
    listening:  { label: 'Listening...',         color: '#FF7096', bg: 'from-pink-400 to-pink-500',     ring: 'ring-4 ring-pink-300 ring-opacity-60 animate-pulse' },
    processing: { label: 'Thinking...',          color: '#60A5FA', bg: 'from-blue-400 to-blue-500',     ring: 'ring-4 ring-blue-300 ring-opacity-60' },
    speaking:   { label: 'Speaking — tap to stop', color: '#34D399', bg: 'from-teal-400 to-green-400', ring: 'ring-4 ring-teal-300 ring-opacity-60 animate-pulse' },
  };

  const cfg = statusConfig[status];

  if (!supported) return null;

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #FF9AB7 100%)' }}
        title="Voice Assistant"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        {status !== 'idle' && open && (
          <span className="absolute w-14 h-14 rounded-full animate-ping opacity-30"
            style={{ background: 'linear-gradient(135deg, #93C5FD, #FF9AB7)' }} />
        )}
      </button>

      {/* ── Voice Panel ── */}
      {open && (
        <div
          className="fixed bottom-44 right-6 z-50 w-88 max-w-[calc(100vw-2rem)] rounded-3xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col"
          style={{
            width: 360,
            maxHeight: 560,
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(147,197,253,0.3)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #FF9AB7 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-sm">Voice Assistant</p>
                <p className="text-white/70 text-xs">Powered by Web Speech API</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setHistory([])}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Clear history">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button onClick={handleClose}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0"
            style={{ maxHeight: 220, scrollbarWidth: 'thin' }}>
            {history.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                <p className="text-xs">Your conversation will appear here</p>
              </div>
            ) : (
              history.map((item, i) => (
                <div key={i} className="space-y-2 animate-fadeIn">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-br-sm text-xs text-white"
                      style={{ background: 'linear-gradient(135deg, #FF9AB7, #FF7096)' }}>
                      {item.q}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-bl-sm text-xs text-gray-700 bg-gray-50 border border-gray-100">
                      {item.a.replace(/\*\*(.*?)\*\*/g, '$1').substring(0, 200)}{item.a.length > 200 ? '...' : ''}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={historyEndRef} />
          </div>

          {/* Live Transcript / Response */}
          <div className="px-4 py-3 border-t border-gray-100 min-h-[80px] flex items-center justify-center">
            {status === 'idle' && !transcript && !response && !error && (
              <p className="text-gray-400 text-xs text-center">
                Say <span className="font-semibold text-pink-400">"Hey Assistant"</span> or tap the mic
              </p>
            )}
            {status === 'listening' && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className="w-1 rounded-full bg-pink-400"
                      style={{
                        height: `${12 + Math.random() * 20}px`,
                        animation: `bounce 0.6s ease-in-out ${i * 0.1}s infinite alternate`
                      }} />
                  ))}
                </div>
                <p className="text-pink-500 text-xs font-medium">
                  {transcript || 'Listening...'}
                </p>
              </div>
            )}
            {status === 'processing' && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
                <p className="text-blue-500 text-xs font-medium">Processing: "{transcript}"</p>
              </div>
            )}
            {status === 'speaking' && response && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[0,1,2,3,4,3,2,1].map((h, i) => (
                    <div key={i} className="w-1 rounded-full bg-teal-400"
                      style={{
                        height: `${8 + h * 4}px`,
                        animation: `bounce 0.4s ease-in-out ${i * 0.08}s infinite alternate`
                      }} />
                  ))}
                </div>
                <p className="text-teal-600 text-xs font-medium line-clamp-2">
                  {response.replace(/\*\*(.*?)\*\*/g, '$1').substring(0, 120)}...
                </p>
              </div>
            )}
            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}
          </div>

          {/* Mic Button */}
          <div className="px-4 pb-5 pt-2 flex flex-col items-center gap-3 flex-shrink-0">
            <button
              onClick={handleMicClick}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br ${cfg.bg} ${cfg.ring}`}
            >
              {status === 'listening' ? (
                <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : status === 'speaking' ? (
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              ) : status === 'processing' ? (
                <div className="spinner w-8 h-8 border-4 border-white/30 border-t-white" />
              ) : (
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
            <p className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</p>

            {/* Quick voice commands */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {['Show courses', 'My results', 'How to submit'].map(cmd => (
                <button key={cmd} onClick={() => processQuery(cmd)}
                  disabled={status !== 'idle'}
                  className="text-xs px-2.5 py-1 rounded-full border transition-all duration-200 hover:scale-105 disabled:opacity-40"
                  style={{ borderColor: '#93C5FD', color: '#0277BD', background: 'rgba(147,197,253,0.1)' }}>
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
