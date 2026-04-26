import React from 'react';

function ScoreGauge({ score, signal }) {
  // score: -10 to +10 mapped to 0-180 degrees
  const normalized = Math.max(-10, Math.min(10, score));
  const pct = ((normalized + 10) / 20); // 0 to 1
  const angle = pct * 180 - 90; // -90 to +90 degrees

  const getColor = (s) => {
    if (s >= 5) return '#00ff87';
    if (s >= 2) return '#7bffc4';
    if (s <= -5) return '#ff4d6d';
    if (s <= -2) return '#ff9aaa';
    return '#ffd700';
  };

  const color = getColor(normalized);

  // SVG arc
  const r = 70;
  const cx = 90;
  const cy = 90;
  const startAngle = Math.PI; // 180deg (left)
  const endAngle = 0;        // 0deg (right)

  // Background arc
  const bgPath = describeArc(cx, cy, r, 180, 0);
  // Fill arc
  const fillDeg = pct * 180;
  const fillPath = fillDeg > 0 ? describeArc(cx, cy, r, 180, 180 - fillDeg) : '';

  // Needle
  const needleAngle = (-90 + pct * 180) * (Math.PI / 180);
  const needleLen = 55;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy + needleLen * Math.sin(needleAngle);

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="105" viewBox="0 0 180 105">
        {/* Background arc */}
        <path d={bgPath} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round" />
        {/* Gradient fill */}
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff4d6d" />
            <stop offset="50%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#00ff87" />
          </linearGradient>
        </defs>
        <path d={describeArc(cx, cy, r, 180, 0)} fill="none" stroke="url(#scoreGradient)" strokeWidth="14" strokeLinecap="round" opacity="0.3" />
        {/* Active fill */}
        {fillPath && (
          <path d={fillPath} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" opacity="0.9" />
        )}
        {/* Zone markers */}
        {[-8, -4, 0, 4, 8].map((v, i) => {
          const a = (((v + 10) / 20) * 180 - 90) * (Math.PI / 180);
          return (
            <line
              key={i}
              x1={cx + (r - 10) * Math.cos(a)}
              y1={cy + (r - 10) * Math.sin(a)}
              x2={cx + (r + 3) * Math.cos(a)}
              y2={cy + (r + 3) * Math.sin(a)}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
          );
        })}
        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill={color} />
        <circle cx={cx} cy={cy} r="2" fill="#080c14" />
      </svg>

      {/* Score value */}
      <div className="text-3xl font-mono font-black -mt-2" style={{ color }}>
        {normalized > 0 ? '+' : ''}{normalized.toFixed(1)}
      </div>
      <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-0.5">
        Confluence Score
      </div>
    </div>
  );
}

function describeArc(x, y, radius, startDeg, endDeg) {
  const start = polarToCartesian(x, y, radius, endDeg);
  const end = polarToCartesian(x, y, radius, startDeg);
  const largeArcFlag = endDeg - startDeg <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function SignalRow({ signal, isPositive, isNeutral }) {
  const color = isNeutral ? 'text-white/40' : isPositive ? 'text-green-400' : 'text-red-400';
  const dot = isNeutral ? 'bg-white/20' : isPositive ? 'bg-green-400' : 'bg-red-400';
  const scoreColor = signal.score > 0 ? 'text-green-400' : signal.score < 0 ? 'text-red-400' : 'text-white/30';

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-none">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className={`text-[10px] font-mono ${color}`}>{signal.label}</span>
      </div>
      <span className={`text-[10px] font-mono font-semibold ${scoreColor}`}>
        {signal.score > 0 ? '+' : ''}{signal.score}
      </span>
    </div>
  );
}

export default function ScorePanel({ score, loading }) {
  if (loading && !score) {
    return (
      <div className="panel panel-glow p-4">
        <div className="skeleton h-4 w-28 rounded mb-4" />
        <div className="skeleton h-32 w-full rounded mb-4" />
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-6 w-full rounded mb-2" />)}
      </div>
    );
  }

  const s = score || {};
  const signals = s.signals || [];

  const signalColors = {
    'Strong Bullish': 'text-green-400 bg-green-500/10 border-green-500/30',
    'Bullish': 'text-green-300 bg-green-500/8 border-green-500/20',
    'Strong Bearish': 'text-red-400 bg-red-500/10 border-red-500/30',
    'Bearish': 'text-red-300 bg-red-500/8 border-red-500/20',
    'Neutral': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  };

  return (
    <div className="panel panel-glow p-4 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9945ff" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        <h2 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Confluence Score</h2>
      </div>

      {/* Gauge */}
      <ScoreGauge score={s.normalizedScore ?? 0} signal={s.signal} />

      {/* Signal badge */}
      <div className="flex justify-center mt-3 mb-4">
        <span className={`text-xs font-mono font-bold px-4 py-1.5 rounded-full border ${signalColors[s.signal] || signalColors['Neutral']}`}>
          {s.signal || 'NEUTRAL'}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Raw Score', value: `${s.score > 0 ? '+' : ''}${s.score ?? 0}` },
          { label: 'Agreement', value: `${((s.agreementRatio || 0) * 100).toFixed(0)}%` },
          { label: 'Strength', value: s.signalStrength || 'Weak' },
        ].map(item => (
          <div key={item.label} className="bg-surface-700 rounded-lg p-2 text-center border border-white/5">
            <div className="text-sm font-mono font-bold text-cyan-400">{item.value}</div>
            <div className="text-[8px] font-mono text-white/25 uppercase mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Bullish vs Bearish signals */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-green-500/5 border border-green-500/15 rounded-lg p-2 text-center">
          <div className="text-base font-mono font-bold text-green-400">{s.bullishSignals ?? 0}</div>
          <div className="text-[8px] font-mono text-green-400/40 uppercase">Bullish Signals</div>
        </div>
        <div className="flex-1 bg-red-500/5 border border-red-500/15 rounded-lg p-2 text-center">
          <div className="text-base font-mono font-bold text-red-400">{s.bearishSignals ?? 0}</div>
          <div className="text-[8px] font-mono text-red-400/40 uppercase">Bearish Signals</div>
        </div>
      </div>

      {/* Signal breakdown */}
      {signals.length > 0 && (
        <div>
          <div className="text-[9px] font-mono text-white/25 uppercase tracking-widest mb-2">Signal Breakdown</div>
          <div className="max-h-48 overflow-y-auto pr-1">
            {signals.map((sig, i) => (
              <SignalRow
                key={i}
                signal={sig}
                isPositive={sig.score > 0}
                isNeutral={sig.score === 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Confidence */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[9px] font-mono text-white/30">Confidence Level</span>
        <span className={`text-[10px] font-mono font-semibold ${
          s.confidenceLevel === 'High' ? 'text-purple-400' :
          s.confidenceLevel === 'Medium' ? 'text-blue-400' : 'text-orange-400'
        }`}>{s.confidenceLevel || 'Low'}</span>
      </div>
    </div>
  );
}