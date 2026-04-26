import React, { useEffect, useRef } from 'react';
import { Chart, LinearScale, BarElement, BarController, CategoryScale, Tooltip } from 'chart.js';
Chart.register(LinearScale, BarElement, BarController, CategoryScale, Tooltip);

function ImbalanceMeter({ value }) {
  // value: -1 to +1
  const pct = ((value + 1) / 2) * 100; // map to 0-100
  const color = value > 0.2 ? '#00ff87' : value < -0.2 ? '#ff4d6d' : '#ffd700';
  const label = value > 0.2 ? 'BIDS DOMINANT' : value < -0.2 ? 'ASKS DOMINANT' : 'BALANCED';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-mono text-white/30">ASKS</span>
        <div className="flex items-center gap-2">
          <span className="text-base font-mono font-bold" style={{ color }}>{value > 0 ? '+' : ''}{(value * 100).toFixed(1)}%</span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded border" style={{ color, borderColor: `${color}33`, background: `${color}11` }}>{label}</span>
        </div>
        <span className="text-[9px] font-mono text-white/30">BIDS</span>
      </div>
      <div className="relative h-3 bg-surface-600 rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
        {value >= 0 ? (
          <div
            className="absolute inset-y-0 left-1/2 rounded-r-full transition-all duration-700"
            style={{ width: `${Math.min(50, (value / 2) * 100)}%`, background: `linear-gradient(90deg, #00ff8750, #00ff87)` }}
          />
        ) : (
          <div
            className="absolute inset-y-0 right-1/2 rounded-l-full transition-all duration-700"
            style={{ width: `${Math.min(50, (Math.abs(value) / 2) * 100)}%`, background: `linear-gradient(90deg, #ff4d6d, #ff4d6d50)` }}
          />
        )}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all duration-700"
          style={{ left: `calc(${pct}% - 6px)`, background: color }}
        />
      </div>
    </div>
  );
}

function BuyVsSell({ buyRatio, sellRatio, buyVolume, sellVolume, pressure }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] font-mono text-green-400">BUY {buyRatio?.toFixed(1)}%</span>
        <span className="text-[10px] font-mono text-white/30 uppercase">{pressure}</span>
        <span className="text-[9px] font-mono text-red-400">SELL {sellRatio?.toFixed(1)}%</span>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden">
        <div
          className="transition-all duration-700"
          style={{ width: `${buyRatio}%`, background: 'linear-gradient(90deg, #00ff87aa, #00ff87)' }}
        />
        <div
          className="transition-all duration-700"
          style={{ width: `${sellRatio}%`, background: 'linear-gradient(90deg, #ff4d6d, #ff4d6daa)' }}
        />
      </div>
      <div className="flex justify-between text-[9px] font-mono text-white/25 mt-1">
        <span>{(buyVolume / 1000).toFixed(1)}K BTC bought</span>
        <span>{(sellVolume / 1000).toFixed(1)}K BTC sold</span>
      </div>
    </div>
  );
}

function OrderBookDepth({ bids, asks }) {
  if (!bids?.length || !asks?.length) return null;

  const allVols = [...bids, ...asks].map(l => l.volume);
  const maxVol = Math.max(...allVols);

  return (
    <div className="mt-3">
      <div className="text-[9px] font-mono text-white/25 uppercase tracking-widest mb-2">Order Book Depth (Top 10)</div>
      <div className="grid grid-cols-2 gap-2">
        {/* Bids */}
        <div>
          <div className="text-[9px] font-mono text-green-400/60 mb-1">BIDS</div>
          {bids.slice(0, 8).map((level, i) => (
            <div key={i} className="relative flex items-center justify-between py-0.5 overflow-hidden">
              <div
                className="absolute inset-y-0 right-0 opacity-20"
                style={{ width: `${(level.volume / maxVol) * 100}%`, background: '#00ff87' }}
              />
              <span className="text-[9px] font-mono text-green-400 relative z-10">${level.price?.toLocaleString()}</span>
              <span className="text-[9px] font-mono text-white/40 relative z-10">{level.volume?.toFixed(3)}</span>
            </div>
          ))}
        </div>
        {/* Asks */}
        <div>
          <div className="text-[9px] font-mono text-red-400/60 mb-1">ASKS</div>
          {asks.slice(0, 8).map((level, i) => (
            <div key={i} className="relative flex items-center justify-between py-0.5 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 opacity-20"
                style={{ width: `${(level.volume / maxVol) * 100}%`, background: '#ff4d6d' }}
              />
              <span className="text-[9px] font-mono text-red-400 relative z-10">${level.price?.toLocaleString()}</span>
              <span className="text-[9px] font-mono text-white/40 relative z-10">{level.volume?.toFixed(3)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeltaInfo({ netDelta, deltaPct, totalTrades, buyCount, sellCount }) {
  const isPositive = netDelta >= 0;
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {[
        { label: 'Net Delta', value: `${isPositive ? '+' : ''}${netDelta?.toFixed(2)}`, color: isPositive ? 'text-green-400' : 'text-red-400' },
        { label: 'Delta %', value: `${isPositive ? '+' : ''}${deltaPct?.toFixed(1)}%`, color: isPositive ? 'text-green-400' : 'text-red-400' },
        { label: 'Total Trades', value: totalTrades?.toLocaleString(), color: 'text-cyan-400' },
      ].map(item => (
        <div key={item.label} className="bg-surface-700 rounded-lg p-2 text-center border border-white/5">
          <div className={`text-sm font-mono font-bold ${item.color}`}>{item.value}</div>
          <div className="text-[8px] font-mono text-white/25 uppercase mt-0.5">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function OrderFlowPanel({ orderFlow, loading }) {
  if (loading && !orderFlow) {
    return (
      <div className="panel panel-glow p-4">
        <div className="skeleton h-4 w-36 rounded mb-4" />
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 w-full rounded mb-3" />)}
      </div>
    );
  }

  const ob = orderFlow?.orderBook || {};
  const tf = orderFlow?.tradeFlow || {};
  const combined = orderFlow?.combined || {};

  const signalColors = {
    strong_bullish: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', dot: 'bg-green-400' },
    moderate_bullish: { text: 'text-green-400/70', bg: 'bg-green-500/5', border: 'border-green-500/20', dot: 'bg-green-400/70' },
    strong_bearish: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400' },
    moderate_bearish: { text: 'text-red-400/70', bg: 'bg-red-500/5', border: 'border-red-500/20', dot: 'bg-red-400/70' },
    neutral: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', dot: 'bg-yellow-400' },
  };

  const sigStyle = signalColors[combined.orderFlowSignal] || signalColors.neutral;

  return (
    <div className="panel panel-glow p-4 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff7a1a" strokeWidth="2">
            <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
          </svg>
          <h2 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Order Flow</h2>
        </div>
        {/* Signal badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${sigStyle.bg} ${sigStyle.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${sigStyle.dot}`} />
          <span className={`text-[9px] font-mono font-semibold uppercase tracking-wider ${sigStyle.text}`}>
            {(combined.orderFlowSignal || 'neutral').replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Order book imbalance */}
        <div className="pb-3 border-b border-white/5">
          <div className="text-[9px] font-mono text-white/25 uppercase tracking-widest mb-2">Book Imbalance</div>
          <ImbalanceMeter value={combined.imbalance ?? 0} />
        </div>

        {/* Buy vs Sell pressure */}
        <div className="pb-3 border-b border-white/5">
          <div className="text-[9px] font-mono text-white/25 uppercase tracking-widest mb-2">Trade Pressure</div>
          <BuyVsSell
            buyRatio={tf.buyRatio ?? 50}
            sellRatio={tf.sellRatio ?? 50}
            buyVolume={tf.buyVolume ?? 0}
            sellVolume={tf.sellVolume ?? 0}
            pressure={combined.pressure ?? 'neutral'}
          />
        </div>

        {/* Delta stats */}
        <DeltaInfo
          netDelta={tf.netDelta}
          deltaPct={combined.deltaPct}
          totalTrades={tf.totalTrades}
          buyCount={tf.buyCount}
          sellCount={tf.sellCount}
        />

        {/* Spread info */}
        {ob.spread != null && (
          <div className="flex items-center justify-between text-[10px] font-mono border-t border-white/5 pt-3">
            <span className="text-white/30">Spread</span>
            <span className="text-cyan-400">${ob.spread?.toFixed(2)} ({ob.spreadPct?.toFixed(4)}%)</span>
          </div>
        )}

        {/* Order book depth */}
        {ob.bidsTop20?.length > 0 && (
          <OrderBookDepth bids={ob.bidsTop20} asks={ob.asksTop20} />
        )}

        {/* Walls */}
        {(ob.bidWalls?.length > 0 || ob.askWalls?.length > 0) && (
          <div className="border-t border-white/5 pt-3">
            <div className="text-[9px] font-mono text-white/25 uppercase tracking-widest mb-2">Large Walls Detected</div>
            <div className="space-y-1">
              {ob.bidWalls?.map((w, i) => (
                <div key={`bid-${i}`} className="flex justify-between text-[9px] font-mono">
                  <span className="text-green-400">🟢 Bid Wall</span>
                  <span className="text-white/50">${w.price?.toLocaleString()} — {w.volume?.toFixed(2)}</span>
                </div>
              ))}
              {ob.askWalls?.map((w, i) => (
                <div key={`ask-${i}`} className="flex justify-between text-[9px] font-mono">
                  <span className="text-red-400">🔴 Ask Wall</span>
                  <span className="text-white/50">${w.price?.toLocaleString()} — {w.volume?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}