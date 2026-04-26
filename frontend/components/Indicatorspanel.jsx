import React from 'react';

function RSIGauge({ value }) {
  if (value == null) return <div className="skeleton h-6 w-full rounded" />;
  const pct = Math.min(100, Math.max(0, value));
  const color = value < 30 ? '#00ff87' : value > 70 ? '#ff4d6d' : '#ffd700';
  const zone = value < 30 ? 'OVERSOLD' : value > 70 ? 'OVERBOUGHT' : 'NEUTRAL';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-lg font-mono font-bold" style={{ color }}>{value.toFixed(1)}</span>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border" style={{ color, borderColor: `${color}33`, background: `${color}11` }}>{zone}</span>
      </div>
      <div className="relative h-2 bg-surface-600 rounded-full overflow-hidden">
        {/* Zone markers */}
        <div className="absolute inset-y-0 left-[30%] w-px bg-green-500/30" />
        <div className="absolute inset-y-0 left-[70%] w-px bg-red-500/30" />
        {/* Fill */}
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, #00ff87, ${color})` }}
        />
        {/* Cursor */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white shadow-lg transition-all duration-700"
          style={{ left: `calc(${pct}% - 5px)`, background: color }}
        />
      </div>
      <div className="flex justify-between text-[8px] font-mono text-white/20 mt-1">
        <span>0</span><span>30</span><span>50</span><span>70</span><span>100</span>
      </div>
    </div>
  );
}

function IndicatorRow({ label, value, badge, badgeColor }) {
  const colors = {
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  };

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-none">
      <span className="text-[11px] text-white/40 font-mono">{label}</span>
      <div className="flex items-center gap-2">
        {value && <span className="text-[11px] text-white/60 font-mono">{value}</span>}
        {badge && (
          <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded border ${colors[badgeColor] || colors.yellow}`}>
            {badge.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}

export default function IndicatorsPanel({ indicators, loading }) {
  if (loading && !indicators) {
    return (
      <div className="panel panel-glow p-4">
        <div className="skeleton h-4 w-32 rounded mb-4" />
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-8 w-full rounded mb-2" />)}
      </div>
    );
  }

  const i = indicators || {};

  const trendColor = i.trend === 'uptrend' ? 'green' : i.trend === 'downtrend' ? 'red' : 'yellow';
  const macdColor = i.macd === 'bullish' ? 'green' : i.macd === 'bearish' ? 'red' : 'yellow';
  const volColor = i.volume === 'increasing' ? 'green' : i.volume === 'decreasing' ? 'red' : 'yellow';
  const bbColor = i.bbSignal === 'oversold' ? 'green' : i.bbSignal === 'overbought' ? 'red' : 'yellow';

  return (
    <div className="panel panel-glow p-4 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <h2 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Technical Indicators</h2>
      </div>

      {/* RSI Gauge */}
      <div className="mb-4 pb-4 border-b border-white/5">
        <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-2">RSI (14)</div>
        <RSIGauge value={i.rsi} />
      </div>

      {/* Indicator rows */}
      <div>
        <IndicatorRow
          label="Trend (EMA 9/21)"
          value={`${i.emaShort?.toFixed(2)} / ${i.emaLong?.toFixed(2)}`}
          badge={i.trend}
          badgeColor={trendColor}
        />
        <IndicatorRow
          label="MACD"
          value={i.macdData ? `${i.macdData.histogram > 0 ? '+' : ''}${i.macdData.histogram?.toFixed(2)}` : null}
          badge={i.macd}
          badgeColor={macdColor}
        />
        <IndicatorRow
          label="Volume Trend"
          badge={i.volume}
          badgeColor={volColor}
        />
        <IndicatorRow
          label="Bollinger Bands"
          value={i.bollingerBands ? `${i.bollingerBands.lower?.toFixed(0)} – ${i.bollingerBands.upper?.toFixed(0)}` : null}
          badge={i.bbSignal}
          badgeColor={bbColor}
        />
        {i.ema50 && (
          <IndicatorRow
            label="EMA 50"
            value={`$${i.ema50?.toLocaleString()}`}
            badge={i.currentPrice > i.ema50 ? 'above' : 'below'}
            badgeColor={i.currentPrice > i.ema50 ? 'green' : 'red'}
          />
        )}
      </div>

      {/* MACD histogram mini-chart */}
      {i.macdData && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="text-[9px] font-mono text-white/25 uppercase tracking-widest mb-1.5">MACD Histogram</div>
          <div className="flex items-end gap-px h-8">
            {/* Mini bar visual */}
            {[...Array(20)].map((_, idx) => {
              const h = Math.random() * 100;
              const isPos = Math.random() > 0.5;
              return (
                <div
                  key={idx}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${Math.max(10, h)}%`,
                    background: idx === 19
                      ? (i.macdData.histogram > 0 ? '#00ff87' : '#ff4d6d')
                      : (isPos ? 'rgba(0,255,135,0.25)' : 'rgba(255,77,109,0.25)'),
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}