import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ChatWidget.css';

const API = import.meta.env.VITE_API_URL || 'https://vertex-living-server.vercel.app';

const WELCOME_TEXT = "👋 **Namaste!** Welcome to Vertex Living!\n\nI'm Vertex AI, your smart property assistant powered by real AI.\n\nAsk me anything — properties, budget, EMI, locations, site visits, or just explore!";
const INITIAL_CHIPS = ['Browse Properties', 'Check Budget', 'Book Site Visit', 'EMI Calculator'];

const FALLBACK_RESPONSES = [
  { triggers: ['hello','hi','hey','namaste'], reply: "👋 Hello! I'm Vertex AI. Ask me about properties, budget, EMI, or anything real estate!", chips: ['Browse Properties', 'Check Budget', 'Book Site Visit', 'Locations'] },
  { triggers: ['property','browse','find','show'], reply: "🏠 We have premium properties across Gurgaon — from ₹61 Lac to ₹15 Cr+. Use the search above or ask me to narrow it down!", chips: ['Under 2 Crore', '3 BHK Options', 'Luxury Properties', 'New Launches'] },
  { triggers: ['budget','price','cost','crore','lac'], reply: "💰 Our range: Budget (₹61L–₹1.5Cr) · Mid (₹1.5–5Cr) · Luxury (₹5Cr+). What's your range?", chips: ['Under 1 Crore', '1–3 Crore', '3–7 Crore', '7 Crore+'] },
  { triggers: ['emi','loan','finance','monthly'], reply: "🧮 Quick EMI at 8.5% for 20 yrs:\n• ₹1Cr → ~₹69K/month\n• ₹2Cr → ~₹1.38L/month\n• ₹5Cr → ~₹3.47L/month", chips: ['Open EMI Tool', 'Talk to Expert', 'Apply for Loan'] },
  { triggers: ['visit','site','tour','schedule'], reply: "📅 Book a FREE site visit! Call us at **+91 98765 43210** or scroll to the Contact section below.", chips: ['Call Now', 'WhatsApp Us', 'Contact Form'] },
];
const DEFAULT_FALLBACK = { reply: "I'm having trouble connecting right now. Here's what I can help with:", chips: ['Browse Properties', 'Check Budget', 'Book Site Visit', 'EMI Calculator'] };

function getFallback(input) {
  const lower = input.toLowerCase();
  return FALLBACK_RESPONSES.find(r => r.triggers.some(t => lower.includes(t))) || DEFAULT_FALLBACK;
}

function renderText(text) {
  return text.split('\n').map((line, lineIdx, arr) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={lineIdx}>
        {parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p)}
        {lineIdx < arr.length - 1 && <br />}
      </span>
    );
  });
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWidget() {
  const [chatOpen, setChatOpen]   = useState(false);
  const [messages, setMessages]   = useState([]);
  const [isTyping, setIsTyping]   = useState(false);
  const [inputVal, setInputVal]   = useState('');
  const [chips, setChips]         = useState([]);
  const [history, setHistory]     = useState([]); // OpenAI-format history
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const streamRef      = useRef(null); // interval ref for cleanup

  // Welcome message on mount
  useEffect(() => {
    const t = setTimeout(() => {
      setMessages([{ id: 1, sender: 'bot', text: WELCOME_TEXT, time: getTime() }]);
      setChips(INITIAL_CHIPS);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (chatOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 300);
  }, [chatOpen]);

  // Cleanup stream on unmount
  useEffect(() => () => clearInterval(streamRef.current), []);

  const streamBotMessage = useCallback((text, finalChips) => {
    const msgId = Date.now() + 1;
    const speed = Math.max(5, Math.round(3000 / text.length)); // adaptive speed

    setMessages(prev => [...prev, { id: msgId, sender: 'bot', text: '', time: getTime(), streaming: true }]);

    let i = 0;
    clearInterval(streamRef.current);
    streamRef.current = setInterval(() => {
      i = Math.min(i + (text.length > 200 ? 3 : 1), text.length);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: text.slice(0, i) } : m));
      if (i >= text.length) {
        clearInterval(streamRef.current);
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, streaming: false } : m));
        setChips(finalChips);
      }
    }, speed);
  }, []);

  const handleSend = useCallback(async (text) => {
    const trimmed = (text || inputVal).trim();
    if (!trimmed || isTyping) return;

    const userMsg = { id: Date.now(), sender: 'user', text: trimmed, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setChips([]);
    setIsTyping(true);

    const updatedHistory = [...history, { role: 'user', content: trimmed }];

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      setHistory([...updatedHistory, { role: 'assistant', content: data.reply }]);
      setIsTyping(false);
      streamBotMessage(data.reply, data.chips || INITIAL_CHIPS);
    } catch {
      // Fallback to keyword matching if AI unavailable
      const fallback = getFallback(trimmed);
      setHistory([...updatedHistory, { role: 'assistant', content: fallback.reply }]);
      setIsTyping(false);
      streamBotMessage(fallback.reply, fallback.chips);
    }
  }, [inputVal, isTyping, history, streamBotMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Variants ──────────────────────────────────────────────────────────────

  const windowVariants = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0,  transition: { type: 'spring', stiffness: 320, damping: 30 } },
    exit:    { opacity: 0, y: 24, transition: { type: 'spring', stiffness: 320, damping: 30 } },
  };
  const msgVariants = {
    initial: { opacity: 0, y: 10, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 25 } },
  };
  const chipVariants = {
    initial: { opacity: 0, x: -10 },
    animate: i => ({ opacity: 1, x: 0, transition: { delay: i * 0.07, type: 'spring', stiffness: 300, damping: 24 } }),
  };
  const dotVariants = {
    animate: i => ({ y: [0, -6, 0], transition: { delay: i * 0.15, duration: 0.6, repeat: Infinity, ease: 'easeInOut' } }),
  };

  const portalEl = typeof document !== 'undefined' ? document.getElementById('portal-fixed') : null;
  const content = (
    <>
      <AnimatePresence>
        {chatOpen && (
          <motion.div className="cw-window" variants={windowVariants} initial="initial" animate="animate" exit="exit">

            {/* Header */}
            <div className="cw-header">
              <div className="cw-header-left">
                <div className="cw-avatar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="white"/>
                  </svg>
                </div>
                <div className="cw-header-info">
                  <div className="cw-title-row">
                    <span className="cw-title">Vertex AI</span>
                    <span className="cw-ai-model-tag">GPT-4o</span>
                  </div>
                  <span className="cw-status">
                    <span className="cw-online-dot" />
                    Online · Always here to help
                  </span>
                </div>
              </div>
              <button className="cw-close-btn" onClick={() => setChatOpen(false)} aria-label="Close chat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="cw-messages">
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    className={`cw-msg-row cw-msg-row--${msg.sender}`}
                    variants={msgVariants} initial="initial" animate="animate"
                  >
                    {msg.sender === 'bot' && (
                      <div className="cw-bot-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="#8b5cf6"/>
                        </svg>
                      </div>
                    )}
                    <div className={`cw-bubble cw-bubble--${msg.sender}`}>
                      <div className="cw-bubble-text">
                        {renderText(msg.text)}
                        {msg.streaming && <span className="cw-cursor">|</span>}
                      </div>
                      {!msg.streaming && <div className="cw-bubble-time">{msg.time}</div>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div className="cw-msg-row cw-msg-row--bot"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
                  >
                    <div className="cw-bot-icon">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="#8b5cf6"/>
                      </svg>
                    </div>
                    <div className="cw-bubble cw-bubble--bot cw-typing-bubble">
                      {[0,1,2].map(i => (
                        <motion.span key={i} className="cw-typing-dot" custom={i} animate="animate" variants={dotVariants} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Chips */}
            <AnimatePresence>
              {chips.length > 0 && !isTyping && (
                <div className="cw-chips-row">
                  {chips.map((chip, i) => (
                    <motion.button key={chip} className="cw-chip" custom={i}
                      variants={chipVariants} initial="initial" animate="animate"
                      onClick={() => handleSend(chip)}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    >
                      {chip}
                    </motion.button>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="cw-input-row">
              <input
                ref={inputRef}
                className="cw-input"
                type="text"
                placeholder="Ask about properties, budget, EMI..."
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
              />
              <motion.button
                className="cw-send-btn"
                onClick={() => handleSend()}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                disabled={!inputVal.trim() || isTyping}
                aria-label="Send"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <div className="cw-fab-wrapper">
        {!chatOpen && <span className="cw-pulse-ring" />}
        <motion.button
          className="cw-fab"
          onClick={() => setChatOpen(p => !p)}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
          aria-label="Open Vertex AI"
        >
          <AnimatePresence mode="wait">
            {chatOpen ? (
              <motion.span key="close"
                initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </motion.span>
            ) : (
              <motion.span key="chat"
                initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.2 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
          {!chatOpen && <span className="cw-ai-badge">AI</span>}
        </motion.button>
      </div>
    </>
  );
  return portalEl ? createPortal(content, portalEl) : content;
}
