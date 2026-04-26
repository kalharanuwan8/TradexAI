import React from 'react';

const MarketFeedTable = ({ data, loading }) => {
  // Mocking multiple assets based on the design, integrating live data if it matches BTC/USDT
  const mockAssets = [
    { asset: 'BTC/USDT', price: data?.ticker?.price || '$64,281.40', change: data?.ticker?.changePercent24h || '+2.45%', signal: 'STRONG BUY', volume: '34.2B', isLive: true },
    { asset: 'ETH/USDT', price: '$3,452.12', change: '-0.82%', signal: 'HOLD', volume: '18.1B' },
    { asset: 'SOL/USDT', price: '$144.67', change: '+5.12%', signal: 'BUY', volume: '4.8B' },
    { asset: 'NVDA', price: '$894.20', change: '-1.15%', signal: 'SELL', volume: '12.5B' },
  ];

  return (
    <div className="bg-surface-800 rounded-xl border border-white/5 p-5 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-mono text-white/50 tracking-widest uppercase">Primary Assets Market Feed</h3>
        <button className="text-white/30 hover:text-white">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[10px] font-mono text-white/40 uppercase tracking-wider border-b border-white/5">
              <th className="pb-3 font-medium">Asset</th>
              <th className="pb-3 font-medium">Price</th>
              <th className="pb-3 font-medium">24h Change</th>
              <th className="pb-3 font-medium text-center">AI Signal</th>
              <th className="pb-3 font-medium text-right">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockAssets.map((row, idx) => {
              const isPositive = typeof row.change === 'number' ? row.change >= 0 : row.change.includes('+');
              const changeDisplay = typeof row.change === 'number' ? `${isPositive ? '+' : ''}${parseFloat(row.change).toFixed(2)}%` : row.change;
              const priceDisplay = typeof row.price === 'number' ? `$${parseFloat(row.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : row.price;
              
              let signalColor = 'text-white/50 border-white/20';
              if (row.signal.includes('BUY')) signalColor = 'text-accent-green border-accent-green/30 bg-accent-green/5';
              if (row.signal.includes('SELL')) signalColor = 'text-accent-red border-accent-red/30 bg-accent-red/5';

              return (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-accent-green' : 'bg-accent-red'}`} />
                    <span className="font-medium text-white/90">{row.asset}</span>
                  </td>
                  <td className="py-4 font-mono text-white/90">
                    {loading && row.isLive ? <div className="h-4 w-16 bg-white/10 animate-pulse rounded" /> : priceDisplay}
                  </td>
                  <td className={`py-4 font-mono ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
                    {loading && row.isLive ? <div className="h-4 w-12 bg-white/10 animate-pulse rounded" /> : changeDisplay}
                  </td>
                  <td className="py-4 text-center">
                    <span className={`text-[10px] px-2 py-1 rounded border font-mono tracking-wider ${signalColor}`}>
                      {row.signal}
                    </span>
                  </td>
                  <td className="py-4 text-right font-mono text-white/60">{row.volume}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketFeedTable;
