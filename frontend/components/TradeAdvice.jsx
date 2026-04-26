import React from 'react';

const TradeAdvice = ({ analysis, loading }) => {
  if (loading) {
    return (
      <div className="bg-surface-container border border-slate-800 rounded-lg p-6 shadow-xl animate-pulse">
        <div className="h-4 w-32 bg-slate-800 rounded mb-4"></div>
        <div className="h-10 w-full bg-slate-800 rounded mb-2"></div>
        <div className="h-4 w-full bg-slate-800 rounded opacity-50"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-surface-container border border-slate-800 rounded-lg p-6 shadow-xl text-center">
        <p className="text-xs text-outline italic">Run AI Analysis to get trade guidance</p>
      </div>
    );
  }

  const { recommendation, reasoning, risk, confidence } = analysis;

  const getColors = (rec = '') => {
    if (rec.startsWith('ENTER NOW')) return 'text-secondary border-secondary bg-secondary/10';
    if (rec.startsWith('WAIT / WATCH')) return 'text-amber-400 border-amber-400 bg-amber-400/10';
    if (rec.startsWith('LIMIT ORDER')) return 'text-blue-400 border-blue-400 bg-blue-400/10';
    return 'text-outline border-outline bg-outline/10';
  };

  const isLimit = recommendation?.startsWith('LIMIT ORDER');

  return (
    <div className="bg-surface-container border border-slate-800 rounded-lg p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-16 translate-y-[-16px] blur-[60px] opacity-20 ${recommendation?.startsWith('ENTER NOW') ? 'bg-secondary' : 'bg-primary'}`}></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-outline">Trading Signal</h3>
        <div className="flex gap-2">
          <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${risk === 'Low' ? 'text-secondary border-secondary/30' : risk === 'High' ? 'text-error border-error/30' : 'text-amber-400 border-amber-400/30'}`}>
            RISK: {risk?.toUpperCase()}
          </span>
          <span className={`px-2 py-0.5 rounded text-[8px] font-bold border border-blue-500/30 text-blue-400 uppercase`}>
            CONFIDENCE: {confidence?.toUpperCase()}
          </span>
          {analysis.stabilityScore && (
            <span className="px-2 py-0.5 rounded text-[8px] font-bold border border-secondary/30 text-secondary uppercase">
              STABILITY: {analysis.stabilityScore}%
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div>
          <h2 className={`text-3xl font-black tracking-tighter ${getColors(recommendation).split(' ')[0]}`}>
            {recommendation}
          </h2>
          <p className="text-sm font-medium text-on-surface-variant mt-1 leading-relaxed">
            {reasoning}
          </p>
          {analysis.riskReason && (
            <div className="mt-2 flex items-start gap-2 bg-error/5 p-2 rounded border border-error/10">
              <span className="material-symbols-outlined text-[14px] text-error mt-0.5">warning</span>
              <p className="text-[10px] text-error font-medium italic leading-tight">
                Risk: {analysis.riskReason}
              </p>
            </div>
          )}
        </div>

        {isLimit && (
          <div className="bg-blue-500/5 border border-blue-500/20 p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400 text-lg">potted_plant</span>
              <span className="text-[10px] font-bold uppercase text-blue-300">Target Entry</span>
            </div>
            <span className="font-mono text-lg font-black text-blue-400">{analysis.tradeSetup?.entryPoint || recommendation.split('@')[1]?.trim()}</span>
          </div>
        )}

        <div className="pt-4 border-t border-slate-800/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-secondary">
              {recommendation?.startsWith('ENTER NOW') ? 'trending_up' : recommendation?.startsWith('WAIT / WATCH') ? 'visibility' : 'schedule'}
            </span>
          </div>
          <p className="text-[10px] text-outline font-bold uppercase leading-tight">
            Strategy: {analysis.tradeSetup?.tradeType || 'Standard'} <br/>
            Horizon: {analysis.timeHorizon || 'Intraday'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TradeAdvice;
