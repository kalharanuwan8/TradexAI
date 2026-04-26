import React, { useState, useEffect } from 'react';

function TypewriterText({ text, speed = 20 }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!text) return;
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(prev => prev + text[i]);
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayed}<span className="animate-pulse">▋</span></span>;
}

function RiskBadge({ level }) {
  const styles = {
    Low: 'text-green-400 bg-green-500/10 border-green-500/30',
    Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    High: 'text-red-400 bg-red-500/10 border-red-500/30',
  };
  const icons = { Low: '🟢', Medium: '🟡', High: '🔴' };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border ${styles[level] || styles.Medium}`}>
      {icons[level]} {level}
    </span>
  );
}

function ConfidenceBadge({ level }) {
  const styles = {
    Low: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    Medium: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    High: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };
  const bars = { Low: 1, Medium: 2, High: 3 };
  const n = bars[level] || 1;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border ${styles[level] || styles.Low}`}>
      <span className="flex gap-0.5">
        {[1, 2, 3].map(i => (
          <span key={i} className={`w-1 h-2.5 rounded-sm ${i <= n ? 'opacity-100' : 'opacity-20'}`} style={{ background: 'currentColor' }} />
        ))}
      </span>
      {level}
    </span>
  );
}

function DirectionArrow({ direction }) {
  const config = {
    bullish: { color: '#00ff87', rotate: '-45deg', label: 'BULLISH' },
    bearish: { color: '#ff4d6d', rotate: '135deg', label: 'BEARISH' },
    neutral: { color: '#ffd700', rotate: '0deg', label: 'NEUTRAL' },
  };
  const c = config[direction] || config.neutral;

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
        style={{ borderColor: `${c.color}40`, background: `${c.color}10` }}
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={c.color} strokeWidth="2.5"
          style={{ transform: `rotate(${c.rotate})` }}
        >
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </div>
      <span className="text-sm font-mono font-bold" style={{ color: c.color }}>{c.label}</span>
    </div>
  );
}

function NewsItem({ headline }) {
  const scoreColor = headline.score > 0 ? 'text-green-400' : headline.score < 0 ? 'text-red-400' : 'text-yellow-400';
  return (
    <div className="flex items-start gap-2 py-2 border-b border-white/5 last:border-none">
      <span className={`text-[9px] font-mono mt-0.5 w-4 text-center ${scoreColor}`}>
        {headline.score > 0 ? '▲' : headline.score < 0 ? '▼' : '●'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-white/60 leading-relaxed line-clamp-2">{headline.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[8px] text-white/25 font-mono">{headline.source}</span>
          {headline.publishedAt && (
            <span className="text-[8px] text-white/20 font-mono">
              {new Date(headline.publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AIInsightsPanel({ aiAnalysis, sentiment, loading }) {
  const [showTypewriter, setShowTypewriter] = useState(false);

  useEffect(() => {
    if (aiAnalysis?.summary) {
      setShowTypewriter(true);
      const t = setTimeout(() => setShowTypewriter(false), aiAnalysis.summary.length * 25 + 500);
      return () => clearTimeout(t);
    }
  }, [aiAnalysis?.summary]);

  if (loading && !aiAnalysis) {
    return (
      <div className="panel panel-glow p-4">
        <div className="skeleton h-4 w-28 rounded mb-4" />
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-8 w-full rounded mb-3" />)}
      </div>
    );
  }

  const ai = aiAnalysis || {};
  const sent = sentiment || {};

  const sentColor = sent.sentiment === 'positive' ? 'text-green-400' : sent.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400';

  return (
    <div className="panel panel-glow p-4 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-purple-500/20 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9945ff" strokeWidth="2">
              <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </div>
          <h2 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">AI Analysis</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-mono text-purple-400/50">
            {ai.model === 'mock' ? 'DEMO MODE' : 'GEMINI 1.5'}
          </span>
          {ai.model !== 'mock' && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />}
        </div>
      </div>

      {/* Direction */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
        <DirectionArrow direction={ai.direction} />
        <div className="flex items-center gap-2">
          <RiskBadge level={ai.risk || 'Medium'} />
          <ConfidenceBadge level={ai.confidence || 'Low'} />
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <div className="text-[9px] font-mono text-white/25 uppercase tracking-widest mb-2">Market Summary</div>
        <p className="text-[11px] text-white/65 leading-relaxed font-mono">
          {showTypewriter && ai.summary
            ? <TypewriterText text={ai.summary} />
            : ai.summary || 'Awaiting analysis...'}
        </p>
      </div>

      {/* Buyer/Seller Strength */}
      {ai.buyerSellerStrength && (
        <div className="mb-4 p-3 bg-surface-700 rounded-lg border border-white/5">
          <div className="text-[9px] font-mono text-cyan-400/50 uppercase tracking-widest mb-1">Order Flow Assessment</div>
          <p className="text-[10px] text-white/55 font-mono leading-relaxed">{ai.buyerSellerStrength}</p>
        </div>
      )}

      {/* Risk reason */}
      {ai.riskReason && (
        <div className="mb-3 flex gap-2">
          <span className="text-[9px] font-mono text-white/25 shrink-0 pt-0.5">⚠</span>
          <p className="text-[10px] text-white/45 font-mono leading-relaxed">{ai.riskReason}</p>
        </div>
      )}

      {/* Key levels */}
      {ai.keyLevels && (ai.keyLevels.support !== 'N/A' || ai.keyLevels.resistance !== 'N/A') && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-green-500/5 border border-green-500/15 rounded-lg p-2 text-center">
            <div className="text-[8px] font-mono text-green-400/50 uppercase mb-0.5">Support</div>
            <div className="text-xs font-mono text-green-400">{ai.keyLevels.support}</div>
          </div>
          <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-2 text-center">
            <div className="text-[8px] font-mono text-red-400/50 uppercase mb-0.5">Resistance</div>
            <div className="text-xs font-mono text-red-400">{ai.keyLevels.resistance}</div>
          </div>
        </div>
      )}

      {/* Time horizon */}
      {ai.timeHorizon && (
        <div className="text-[9px] font-mono text-white/25 mb-4">
          📅 {ai.timeHorizon}
        </div>
      )}

      {/* Sentiment section */}
      <div className="border-t border-white/5 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[9px] font-mono text-white/25 uppercase tracking-widest">News Sentiment</div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-semibold uppercase ${sentColor}`}>{sent.sentiment}</span>
            <div className="flex gap-2 text-[9px] font-mono">
              <span className="text-green-400">▲{sent.bullishCount}</span>
              <span className="text-red-400">▼{sent.bearishCount}</span>
            </div>
          </div>
        </div>

        {sent.headlines?.length > 0 && (
          <div className="max-h-40 overflow-y-auto pr-1">
            {sent.headlines.slice(0, 5).map((h, i) => (
              <NewsItem key={i} headline={h} />
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-[8px] text-white/15 font-mono mt-4 pt-3 border-t border-white/5">
        ⚠ Not financial advice. For informational purposes only.
      </p>
    </div>
  );
}