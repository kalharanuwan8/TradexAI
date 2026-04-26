import React from 'react';

const AIThinkingLog = ({ aiAnalysis, loading }) => {
  // Convert standard aiAnalysis text into a feed of log items for visual effect
  // If no data, use mock logs based on the design
  const logs = [
    {
      time: '12:44:02',
      type: 'ANALYSIS_COMPLETED',
      content: 'Detecting bullish divergence on BTC 15m timeframe. Volume profiles confirming support at $63.2k level.',
      iconColor: 'text-accent-green',
      iconBg: 'bg-accent-green/10'
    },
    {
      time: '12:42:55',
      type: 'CORRELATION_SCAN',
      content: 'Inverse correlation between DXY and SPX strengthening. Adjusting risk parameters for tech assets.',
      iconColor: 'text-accent-cyan',
      iconBg: 'bg-accent-cyan/10'
    },
    {
      time: '12:40:12',
      type: 'LIQUIDITY_GAP',
      content: 'Warning: Liquidity gap detected on ETH/USDT order book below $3,410. Slippage probability increased to 0.4%.',
      iconColor: 'text-accent-red',
      iconBg: 'bg-accent-red/10'
    }
  ];

  return (
    <div className="bg-surface-800 rounded-xl border border-white/5 flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-white/5 flex justify-between items-center bg-surface-900/50">
        <h3 className="text-xs font-mono text-white/50 tracking-widest uppercase">AI Thinking Log</h3>
        <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-5 h-5 rounded-full bg-white/10 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-white/10 rounded w-1/3" />
                  <div className="h-3 bg-white/10 rounded w-full" />
                  <div className="h-3 bg-white/10 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {logs.map((log, idx) => (
              <div key={idx} className="flex gap-3 relative">
                {idx !== logs.length - 1 && (
                  <div className="absolute left-2.5 top-6 bottom-[-1.5rem] w-px bg-white/5" />
                )}
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${log.iconBg} ${log.iconColor}`}>
                  {log.type === 'ANALYSIS_COMPLETED' && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  )}
                  {log.type === 'CORRELATION_SCAN' && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                  )}
                  {log.type === 'LIQUIDITY_GAP' && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-white/40">{log.time}</span>
                    <span className={`text-[10px] font-mono tracking-wider ${log.iconColor}`}>{log.type}</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {log.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-surface-900/50">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Query AI Copilot..." 
            className="w-full bg-surface-700 border border-white/10 rounded-lg py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-accent-cyan/50 transition-colors placeholder:text-white/30"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/30 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIThinkingLog;
