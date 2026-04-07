import React from "react";
import { ArrowUp, Paperclip, Square, X, StopCircle, Mic, Globe, BrainCog, FolderCode } from "lucide-react";
import "./ai-prompt-box.css";

/* ── Voice Recorder ── */
const VoiceRecorder = ({ isRecording, onStartRecording, onStopRecording, bars = 32 }) => {
  const [time, setTime] = React.useState(0);
  const timerRef = React.useRef(null);
  const isMounted = React.useRef(false); // prevent firing on initial mount
  const barsRef = React.useRef(
    Array.from({ length: bars }, () => Math.max(15, Math.random() * 100))
  );

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return; // skip first render — do NOT call onStopRecording on mount
    }
    if (isRecording) {
      onStartRecording?.();
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      onStopRecording?.(time);
      setTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className={`apb-recorder${isRecording ? '' : ' apb-rec-hidden'}`}>
      <div className="apb-rec-timer">
        <div className="apb-rec-dot" />
        <span className="apb-rec-time">{fmt(time)}</span>
      </div>
      <div className="apb-rec-bars">
        {barsRef.current.map((h, i) => (
          <div
            key={i}
            className="apb-rec-bar"
            style={{
              height: `${h}%`,
              animationDelay: `${i * 0.05}s`,
              animationDuration: `${0.5 + (i % 5) * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ── Image Dialog ── */
const ImageDialog = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div className="apb-dialog-overlay" onClick={onClose}>
      <div className="apb-dialog-content" onClick={e => e.stopPropagation()}>
        <button className="apb-dialog-close" onClick={onClose}>
          <X size={18} />
        </button>
        <img src={src} alt="Preview" />
      </div>
    </div>
  );
};

/* ── Divider ── */
const Divider = () => (
  <div className="apb-divider">
    <div className="apb-divider-inner" />
  </div>
);

/* ── Main PromptInputBox ── */
export const PromptInputBox = React.forwardRef(function PromptInputBox(
  { onSend = () => {}, isLoading = false, placeholder = "Type your message here...", className = "" },
  ref
) {
  const [input, setInput]           = React.useState("");
  const [files, setFiles]           = React.useState([]);
  const [previews, setPreviews]     = React.useState({});
  const [lightbox, setLightbox]     = React.useState(null);
  const [recording, setRecording]   = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);
  const [showThink, setShowThink]   = React.useState(false);
  const [showCanvas, setShowCanvas] = React.useState(false);

  const fileRef    = React.useRef(null);
  const textRef    = React.useRef(null);
  const containerRef = ref || React.useRef(null);

  /* ─── Auto-resize textarea ─── */
  React.useEffect(() => {
    if (!textRef.current) return;
    textRef.current.style.height = "auto";
    textRef.current.style.height = Math.min(textRef.current.scrollHeight, 240) + "px";
  }, [input]);

  /* ─── Paste image ─── */
  React.useEffect(() => {
    const handle = e => {
      const items = e.clipboardData?.items || [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const f = item.getAsFile();
          if (f) { e.preventDefault(); addFile(f); break; }
        }
      }
    };
    document.addEventListener("paste", handle);
    return () => document.removeEventListener("paste", handle);
  }, []);

  /* ─── File helpers ─── */
  const addFile = file => {
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) return;
    setFiles([file]);
    const reader = new FileReader();
    reader.onload = e => setPreviews({ [file.name]: e.target.result });
    reader.readAsDataURL(file);
  };

  const removeFile = () => { setFiles([]); setPreviews({}); };

  /* ─── Drag & Drop ─── */
  const onDragOver  = e => { e.preventDefault(); e.stopPropagation(); };
  const onDragLeave = e => { e.preventDefault(); e.stopPropagation(); };
  const onDrop      = e => {
    e.preventDefault(); e.stopPropagation();
    const f = Array.from(e.dataTransfer.files).find(f => f.type.startsWith("image/"));
    if (f) addFile(f);
  };

  /* ─── Toggle modes ─── */
  const toggleSearch = () => { setShowSearch(v => !v); setShowThink(false); };
  const toggleThink  = () => { setShowThink(v => !v); setShowSearch(false); };
  const toggleCanvas = () => setShowCanvas(v => !v);

  /* ─── Submit ─── */
  const hasContent = input.trim() !== "" || files.length > 0;

  const submit = () => {
    if (!hasContent) return;
    let msg = input;
    if (showSearch) msg = `[Search: ${msg}]`;
    else if (showThink) msg = `[Think: ${msg}]`;
    else if (showCanvas) msg = `[Canvas: ${msg}]`;
    onSend(msg, files);
    setInput("");
    setFiles([]);
    setPreviews({});
  };

  const onKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  /* ─── Placeholder text ─── */
  const activePlaceholder = showSearch ? "Search the web..."
    : showThink  ? "Think deeply..."
    : showCanvas ? "Create on canvas..."
    : placeholder;

  /* ─── Container classes ─── */
  const containerCls = [
    "apb-container",
    isLoading  && "apb-loading",
    recording  && "apb-recording",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className="apb-root" ref={containerRef} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <div className={containerCls}>

        {/* ── File previews ── */}
        {files.length > 0 && !recording && (
          <div className="apb-file-strip">
            {files.map((f, i) => previews[f.name] && (
              <div key={i} className="apb-file-thumb" onClick={() => setLightbox(previews[f.name])}>
                <img src={previews[f.name]} alt={f.name} />
                <button className="apb-file-remove" onClick={e => { e.stopPropagation(); removeFile(); }}>
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Textarea ── */}
        <div className={`apb-textarea-wrap${recording ? ' apb-hidden' : ''}`}>
          <textarea
            ref={textRef}
            className="apb-textarea"
            placeholder={activePlaceholder}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={isLoading || recording}
            rows={1}
          />
        </div>

        {/* ── Voice recorder ── */}
        <VoiceRecorder
          isRecording={recording}
          onStartRecording={() => {}}
          onStopRecording={dur => { setRecording(false); onSend(`[Voice message – ${dur}s]`, []); }}
        />

        {/* ── Bottom action bar ── */}
        <div className={`apb-actions${recording ? ' apb-recording-mode' : ''}`}>

          {/* Left: attach + toggles */}
          <div className="apb-left-icons">

            {/* Attach */}
            <div className="apb-tooltip-wrap">
              <button className="apb-icon-btn" onClick={() => fileRef.current?.click()} disabled={recording}>
                <Paperclip size={18} />
              </button>
              <span className="apb-tooltip">Attach image</span>
              <input ref={fileRef} type="file" accept="image/*" className="apb-file-input"
                onChange={e => { if (e.target.files?.[0]) addFile(e.target.files[0]); e.target.value = ""; }} />
            </div>

            {/* Toggle group */}
            <div className="apb-toggle-group">

              {/* Search */}
              <button
                type="button"
                className={`apb-toggle-btn${showSearch ? ' apb-search-active' : ''}`}
                onClick={toggleSearch}
              >
                <span className="apb-icon-inner"><Globe size={15} /></span>
                <span className="apb-toggle-label">Search</span>
              </button>

              <Divider />

              {/* Think */}
              <button
                type="button"
                className={`apb-toggle-btn${showThink ? ' apb-think-active' : ''}`}
                onClick={toggleThink}
              >
                <span className="apb-icon-inner"><BrainCog size={15} /></span>
                <span className="apb-toggle-label">Think</span>
              </button>

              <Divider />

              {/* Canvas */}
              <button
                type="button"
                className={`apb-toggle-btn${showCanvas ? ' apb-canvas-active' : ''}`}
                onClick={toggleCanvas}
              >
                <span className="apb-icon-inner"><FolderCode size={15} /></span>
                <span className="apb-toggle-label">Canvas</span>
              </button>

            </div>
          </div>

          {/* Right: send / mic button */}
          <div className="apb-tooltip-wrap">
            <button
              className={`apb-send-btn ${
                recording  ? 'apb-btn-stop'
                : isLoading ? 'apb-btn-loading'
                : hasContent ? 'apb-btn-send'
                : 'apb-btn-mic'
              }`}
              onClick={() => {
                if (recording) setRecording(false);
                else if (hasContent || isLoading) submit();
                else setRecording(true);
              }}
              disabled={isLoading && !hasContent}
            >
              {isLoading  ? <Square   size={15} style={{ fill: '#9CA3AF' }} />
              : recording  ? <StopCircle size={18} />
              : hasContent ? <ArrowUp  size={15} />
              : <Mic size={17} />}
            </button>
            <span className="apb-tooltip" style={{ right: 0, left: 'auto', transform: 'none' }}>
              {isLoading ? "Stop" : recording ? "Stop recording" : hasContent ? "Send" : "Voice input"}
            </span>
          </div>

        </div>
      </div>

      {/* ── Image lightbox ── */}
      <ImageDialog src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
});

PromptInputBox.displayName = "PromptInputBox";
