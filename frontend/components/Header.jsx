import React from 'react';

export default function Header({
  symbol,
  timeframe,
  supportedSymbols,
  timeframes,
  onSymbolChange,
  onTimeframeChange,
  onRefresh,
  autoRefresh,
  onToggleAutoRefresh,
  lastUpdated,
  loading,
}) {
  const coinBase = symbol.split('/')[0];

  return (
    <header className="sticky top-0 z-50 panel panel-glow border-b border-cyan-500/10 px-4 py-3">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4 flex-wrap">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-cyan-900/50 border border-cyan-500/30 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gradient-cyan tracking-wide font-display">
              CIPHER<span className="text-white/40">FLOW</span>
            </h1>
            <p className="text-[9px] text-white/30 tracking-[0.2em] uppercase font-mono">Market Intelligence</p>
          </div>
        </div>

        {/* Symbol Selector */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Pair</label>
          <select
            value={symbol}
            onChange={e => onSymbolChange(e.target.value)}
            className="bg-surface-700 border border-cyan-500/20 text-cyan-300 text-sm font-mono px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500/60 cursor-pointer appearance-none pr-7 relative"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2300d4ff' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
          >
            {supportedSymbols.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-surface-800 border border-cyan-500/10 rounded-lg p-1">
          {timeframes.map(tf => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-all duration-200 ${
                timeframe === tf
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Last updated */}
          {lastUpdated && (
            <span className="text-[10px] text-white/25 font-mono hidden sm:block">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}

          {/* Auto-refresh toggle */}
          <button
            onClick={onToggleAutoRefresh}
            className={`flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1.5 rounded-lg border transition-all ${
              autoRefresh
                ? 'border-green-500/30 text-green-400 bg-green-500/10'
                : 'border-white/10 text-white/30 bg-white/5'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`} />
            AUTO
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-[10px] font-mono px-3 py-1.5 rounded-lg border border-cyan-500/30 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all disabled:opacity-40"
          >
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={loading ? 'animate-spin' : ''}
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            REFRESH
          </button>
        </div>
      </div>
    </header>
  );
}