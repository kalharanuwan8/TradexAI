    import React, { useEffect, useState } from 'react';

function StatItem({ label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 border-r border-white/5 last:border-none">
      <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono">{label}</span>
      <span className={`text-sm font-mono font-semibold ${color || 'text-white/80'}`}>{value}</span>
    </div>
  );
}

export default function PriceBar({ ticker, symbol, loading }) {
  const [prevPrice, setPrevPrice] = useState(null);
  const [flash, setFlash] = useState(null); // 'up' | 'down'

  useEffect(() => {
    if (!ticker?.price || !prevPrice) {
      setPrevPrice(ticker?.price);
      return;
    }
    if (ticker.price > prevPrice) {
      setFlash('up');
    } else if (ticker.price < prevPrice) {
      setFlash('down');
    }
    setPrevPrice(ticker.price);
    const t = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(t);
  }, [ticker?.price]);

  const fmt = (n, decimals = 2) =>
    n != null ? Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : '—';

  const changeColor =
    ticker?.changePercent24h > 0 ? 'text-green-400' : ticker?.changePercent24h < 0 ? 'text-red-400' : 'text-yellow-400';

  const priceColor = flash === 'up' ? 'text-green-400' : flash === 'down' ? 'text-red-400' : 'text-white';

  if (loading && !ticker) {
    return (
      <div className="panel panel-glow border-b border-cyan-500/10 px-4 py-2.5">
        <div className="max-w-[1800px] mx-auto flex items-center gap-6">
          <div className="skeleton h-7 w-40 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="panel border-b border-cyan-500/10 px-4 py-2.5 overflow-x-auto">
      <div className="max-w-[1800px] mx-auto flex items-center gap-0 min-w-max">

        {/* Main price */}
        <div className="flex items-baseline gap-2 pr-6 border-r border-white/5 mr-2">
          <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">{symbol}</span>
          <span
            className={`text-2xl font-mono font-bold transition-colors duration-300 ${priceColor}`}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            ${fmt(ticker?.price)}
          </span>
          <span className={`text-sm font-mono font-medium ${changeColor}`}>
            {ticker?.changePercent24h > 0 ? '+' : ''}{fmt(ticker?.changePercent24h)}%
          </span>
          <span className={`text-xs font-mono ${changeColor}`}>
            {ticker?.change24h > 0 ? '+' : ''}{fmt(ticker?.change24h)}
          </span>
        </div>

        <StatItem label="24h High" value={`$${fmt(ticker?.high24h)}`} color="text-green-400/80" />
        <StatItem label="24h Low" value={`$${fmt(ticker?.low24h)}`} color="text-red-400/80" />
        <StatItem label="Bid" value={`$${fmt(ticker?.bid)}`} color="text-cyan-400/70" />
        <StatItem label="Ask" value={`$${fmt(ticker?.ask)}`} color="text-orange-400/70" />
        <StatItem label="Volume 24h" value={`${(ticker?.volume24h / 1000).toFixed(1)}K`} color="text-white/60" />
      </div>
    </div>
  );
}