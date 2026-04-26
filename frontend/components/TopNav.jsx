import React from 'react';

const TopNav = ({ symbol, onSymbolChange, supportedSymbols, loading, data }) => {
  const d = data || {};
  const currentPrice = d.ticker?.lastPrice || 0;
  const change24h = d.ticker?.priceChangePercent || 0;
  const isPositive = change24h >= 0;

  return (
    <header className="h-16 border-b border-white/5 bg-surface-900/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Ticker Tape Left */}
      <div className="flex items-center gap-6 overflow-hidden flex-1">
        <div className="flex items-center gap-2">
          <select 
            value={symbol}
            onChange={(e) => onSymbolChange(e.target.value)}
            className="bg-transparent text-sm font-mono text-white/80 outline-none cursor-pointer"
          >
            {supportedSymbols?.map(s => (
              <option key={s} value={s} className="bg-surface-800">{s}</option>
            ))}
          </select>
          {loading ? (
            <div className="w-4 h-4 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className={`text-xs font-mono font-bold ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
              {isPositive ? '+' : ''}{parseFloat(change24h).toFixed(2)}%
            </span>
          )}
        </div>
        
        {/* Mock other assets */}
        <div className="flex items-center gap-4 opacity-50">
           <span className="text-xs font-mono">ETH -0.8%</span>
           <span className="text-xs font-mono">TSLA +1.2%</span>
           <span className="text-xs font-mono">SPY +0.5%</span>
        </div>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-4">
        <button className="text-white/50 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <button className="text-white/50 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </button>
        <div className="w-8 h-8 rounded-full bg-surface-700 border border-white/10 flex items-center justify-center overflow-hidden ml-2 cursor-pointer">
          <svg className="w-4 h-4 text-accent-cyan" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
