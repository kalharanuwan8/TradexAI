import React from 'react';

const IntelligenceCommand = ({ analysis, loading, onSaveSignal, onRunAnalysis, symbol, sentimentScore }) => {
  if (loading) {
    return (
      <div className="bg-surface-container border border-slate-800 rounded-lg p-6 shadow-xl animate-pulse space-y-6">
        <div className="flex justify-between">
          <div className="h-4 w-32 bg-slate-800 rounded"></div>
          <div className="h-4 w-24 bg-slate-800 rounded"></div>
        </div>
        <div className="h-12 w-3/4 bg-slate-800 rounded"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-800 rounded"></div>)}
        </div>
        <div className="h-32 w-full bg-slate-800 rounded"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-surface-container border border-slate-800 rounded-lg p-10 shadow-xl text-center flex flex-col items-center gap-6 group">
        <div className="relative">
           <div className="absolute inset-0 bg-secondary/20 blur-2xl rounded-full animate-pulse"></div>
           <span className="material-symbols-outlined text-5xl text-secondary relative z-10">psychology_alt</span>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-on-surface font-bold uppercase tracking-widest">Awaiting Market Intelligence</p>
          <p className="text-xs text-outline font-medium max-w-xs mx-auto">
            Deep-learning analysis is currently in standby. Initialize the neural link to generate strategic trade guidance.
          </p>
        </div>
        <button 
          onClick={onRunAnalysis}
          className="flex items-center gap-2 bg-secondary text-[#031427] px-8 py-3 text-xs font-black rounded-lg uppercase transition-all duration-300 hover:scale-[1.05] active:scale-95 shadow-[0_0_20px_rgba(0,255,135,0.3)]"
        >
          <span className="material-symbols-outlined text-sm">rocket_launch</span>
          Run AI Analysis
        </button>
      </div>
    );
  }

  const { recommendation, reasoning, risk, confidence, stabilityScore, summary, tradeSetup, direction } = analysis;

  const isBullish = direction === 'bullish';
  const isBearish = direction === 'bearish';
  const accentColor = isBullish ? 'secondary' : isBearish ? 'error' : 'primary';
  const accentHex = isBullish ? '#00ff87' : isBearish ? '#ffb4ab' : '#adc6ff';

  return (
    <div className="relative group transition-all duration-500">
      {/* Background Glow Effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-${accentColor}/20 to-transparent blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500`}></div>
      
      <section className="relative bg-surface-container border border-slate-800/50 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800/50 flex justify-between items-center bg-surface-container-high/30">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 bg-${accentColor}/10 rounded-md`}>
              <span className={`material-symbols-outlined text-${accentColor} text-lg`}>terminal</span>
            </div>
            <h2 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">AI Intelligence Command</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onRunAnalysis}
              className={`flex items-center gap-1.5 px-3 py-1 bg-${accentColor}/10 hover:bg-${accentColor}/20 text-${accentColor} border border-${accentColor}/30 rounded text-[9px] font-black uppercase transition-all mr-2`}
            >
              <span className="material-symbols-outlined text-[12px]">refresh</span>
              Re-Scan
            </button>
            <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
              <span className="text-[9px] font-black text-outline uppercase tracking-wider">Confidence</span>
              <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-${accentColor} transition-all duration-1000 ease-out`}
                  style={{ width: `${confidence === 'High' ? 90 : confidence === 'Medium' ? 60 : 30}%` }}
                ></div>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-black border border-${accentColor}/30 text-${accentColor} uppercase bg-${accentColor}/5`}>
              {risk} Risk
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-12 gap-8">
            {/* Left: Signal & Setup */}
            <div className="col-span-12 lg:col-span-7 space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full bg-${accentColor} animate-pulse shadow-[0_0_8px_${accentHex}]`}></span>
                  <span className={`text-[11px] font-black uppercase tracking-[0.2em] text-${accentColor}`}>
                    {direction} Signal Detected
                  </span>
                </div>
                <h1 className={`text-4xl font-black tracking-tighter text-on-surface leading-none`}>
                  {recommendation}
                </h1>
                <p className="text-sm font-medium text-outline leading-relaxed max-w-xl">
                  {summary}
                </p>
              </div>

              {/* Strategic Levels Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Entry Zone', value: tradeSetup?.entryPoint, color: 'on-surface' },
                  { label: 'Stop Loss', value: tradeSetup?.stopLoss, color: 'error' },
                  { label: 'Take Profit 1', value: tradeSetup?.takeProfit1, color: 'secondary' },
                  { label: 'Take Profit 2', value: tradeSetup?.takeProfit2, color: accentColor },
                ].map((level, i) => (
                  <div key={i} className="bg-surface/50 border border-slate-800/50 p-4 rounded-xl hover:border-slate-700 transition-colors group/item">
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2 group-hover/item:text-slate-400 transition-colors">{level.label}</p>
                    <p className={`text-base font-mono font-bold text-${level.color}`}>{level.value || '---'}</p>
                  </div>
                ))}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Stability</span>
                    <span className="text-sm font-mono font-bold text-on-surface">{stabilityScore || '--'}%</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800"></div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Horizon</span>
                    <span className="text-sm font-mono font-bold text-on-surface">{analysis.timeHorizon || 'Intraday'}</span>
                  </div>
                </div>

                <button 
                  onClick={onSaveSignal}
                  className={`flex items-center gap-2 bg-${accentColor}/10 hover:bg-${accentColor}/20 text-${accentColor} border border-${accentColor}/30 px-6 py-2.5 text-[10px] font-black rounded-lg uppercase transition-all duration-300 hover:scale-[1.02] active:scale-95 group/btn`}
                >
                  <span className="material-symbols-outlined text-sm group-hover/btn:rotate-12 transition-transform">bookmark_manager</span>
                  Institutional Save
                </button>
              </div>
            </div>

            {/* Right: Reasoning & Neural Feed */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
              {/* Reasoning Card */}
              <div className="bg-surface/30 rounded-xl border border-slate-800/50 p-5 relative overflow-hidden flex-1">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">analytics</span>
                  Market Reasoning
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                  {reasoning}
                </p>
                {analysis.riskReason && (
                  <div className="mt-4 p-3 bg-error/5 border border-error/10 rounded-lg flex gap-3">
                    <span className="material-symbols-outlined text-error text-sm mt-0.5">warning</span>
                    <p className="text-[10px] text-error font-bold leading-tight">
                      CRITICAL RISK: {analysis.riskReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Neural Thinking Log (Mini) */}
              <div className="bg-surface-container-lowest rounded-xl border border-slate-800/50 p-5 h-40 overflow-hidden relative group/neural">
                <div className="scan-line opacity-20"></div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500">Neural Thinking Log</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-secondary animate-pulse"></span>
                    <span className="text-[8px] font-mono text-secondary uppercase">Active</span>
                  </div>
                </div>
                <div className="space-y-2 font-mono text-[10px] text-slate-500 overflow-y-auto max-h-24 custom-scrollbar pr-2">
                  <p className="flex gap-2">
                    <span className="text-secondary opacity-50">[OK]</span>
                    <span>Deconstructing liquidity clusters for {symbol}...</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-secondary opacity-50">[OK]</span>
                    <span>Cross-referencing volume profiles with RSI divergence...</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-secondary opacity-50">[OK]</span>
                    <span>Volatility expansion detected at current price level.</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-primary opacity-50">[INFO]</span>
                    <span>Sentiment weighted at {sentimentScore || 50}% alignment.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IntelligenceCommand;
