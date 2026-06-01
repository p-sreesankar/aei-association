import React from 'react';

function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function Timer({ secondsLeft = 0, totalSeconds = 0, className = '', paused = false }) {
  const pct = totalSeconds > 0 ? Math.max(0, Math.min(1, secondsLeft / totalSeconds)) : 0;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`} role="timer" aria-live="polite">
      <div className="flex items-center gap-2 rounded-full border border-border bg-bg/70 px-3 py-1 text-text-primary shadow-card">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary" aria-hidden>
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="font-semibold">{formatTime(secondsLeft)}</span>
        {paused && <span className="ml-2 text-xs text-text-secondary">Paused</span>}
      </div>

      <div className="w-36 sm:w-48 h-2 rounded-full bg-bg/60 overflow-hidden" aria-hidden>
        <div className="h-full bg-primary transition-all" style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  );
}
