'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { MessageCircle, X, Send, Bot, RotateCcw } from 'lucide-react';
import { getBotReply, SUGGESTED_QUESTIONS, type ChatMessage } from '@/lib/chatEngine';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'bot',
  text: "Habari! 👋 I'm your TAFUTA CAREER assistant.\n\nAsk me anything — career matches, pathways, salaries, or how to use this site. Try one of the suggestions below!",
  links: [],
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, messages]);

  function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Small delay so the UI feels responsive
    setTimeout(() => {
      const reply = getBotReply(msg);
      setMessages(prev => [...prev, reply]);
      setLoading(false);
    }, 400);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleReset() {
    setMessages([INITIAL_MESSAGE]);
    setInput('');
  }

  const showSuggestions = messages.length <= 1;

  return (
    <>
      {/* Floating toggle button */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close chat' : 'Open career assistant chat'}
        className="fixed bottom-8 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-400"
        style={{ background: open ? '#BB0000' : '#006600' }}
      >
        {open
          ? <X className="w-6 h-6 text-white" />
          : <MessageCircle className="w-6 h-6 text-white" />
        }
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chatpanel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-40px)] sm:w-96 flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
            style={{ maxHeight: 'min(560px, calc(100vh - 130px))' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 text-white" style={{ background: '#006600' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm leading-none">TAFUTA Assistant</p>
                  <p className="text-xs text-white/70 leading-none mt-0.5">Career Guidance Bot</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  aria-label="Reset conversation"
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-white/80" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white/80" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-white rounded-br-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-sm shadow-sm'
                    }`}
                    style={msg.role === 'user' ? { background: '#006600' } : {}}
                  >
                    {/* Render text with bold markdown support */}
                    {msg.text.split('\n').map((line, li) => {
                      const parts = line.split(/\*\*(.+?)\*\*/g);
                      return (
                        <p key={li} className={li > 0 ? 'mt-1' : ''}>
                          {parts.map((part, pi) =>
                            pi % 2 === 1
                              ? <strong key={pi}>{part}</strong>
                              : <span key={pi}>{part}</span>
                          )}
                        </p>
                      );
                    })}

                    {/* Quick links */}
                    {msg.links && msg.links.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {msg.links.map(link => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors"
                            style={{
                              borderColor: '#006600',
                              color: '#006600',
                            }}
                          >
                            {link.label} →
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-slate-400"
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested questions (only at start) */}
              {showSuggestions && !loading && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTED_QUESTIONS.map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSend(q)}
                      className="text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-colors hover:text-white"
                      style={{ borderColor: '#006600', color: '#006600' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#006600'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.color = '#006600'; }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about careers, subjects, pathways…"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-green-500 dark:focus:border-green-400 transition-colors"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
                  style={{ background: '#006600' }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-center text-xs text-slate-400 mt-2">
                Powered by TAFUTA CAREER data • 1,252 careers
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
