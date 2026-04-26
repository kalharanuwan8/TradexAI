import React from 'react';

export default function ErrorBanner({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="mx-4 mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl fade-in">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4d6d" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-mono text-red-400 font-semibold">Connection Error</p>
          <p className="text-xs text-red-400/60 font-mono mt-0.5">{error}</p>
          <p className="text-[10px] text-white/30 font-mono mt-1">
            Make sure the backend server is running on port 3001. Run: <code className="text-cyan-400/60">cd backend && node server.js</code>
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-[10px] font-mono text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}