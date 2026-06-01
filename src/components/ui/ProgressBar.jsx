import React from 'react';

export default function ProgressBar({ value = 0, height = 8, className = '' }) {
  const pct = Math.max(0, Math.min(1, Number(value) || 0));
  return (
    <div className={`w-full rounded-full bg-bg/60 ${className}`} style={{ height }} aria-hidden>
      <div
        className="h-full rounded-full bg-primary transition-width duration-200"
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}
