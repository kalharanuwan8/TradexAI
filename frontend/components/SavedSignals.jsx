import React, { useEffect, useState } from 'react';
import { fetchSignals, deleteSignal, clearAllSignals, reEvaluateSignal } from '../services/api';

const SavedSignals = ({ refreshTrigger, onSelectSignal }) => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluatingId, setEvaluatingId] = useState(null);
  const [evaluationAdvice, setEvaluationAdvice] = useState({});

  const loadSignals = async () => {
    try {
      setLoading(true);
      const res = await fetchSignals();
      if (res.success) {
        setSignals(res.data);
      }
    } catch (err) {
      console.error('Failed to load signals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();
  }, [refreshTrigger]);

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent card click
    if (!window.confirm('Are you sure you want to delete this signal?')) return;
    try {
      await deleteSignal(id);
      loadSignals();
      if (evaluatingId === id) setEvaluatingId(null);
    } catch (err) {
      alert('Failed to delete signal');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear ALL saved signals? This cannot be undone.')) return;
    try {
      await clearAllSignals();
      setSignals([]);
      setEvaluatingId(null);
    } catch (err) {
      alert('Failed to clear signals');
    }
  };

  const handleEvaluate = async (id) => {
    if (evaluatingId === id) {
      setEvaluatingId(null);
      return;
    }
    
    try {
      setEvaluatingId(id);
      setEvaluationAdvice(prev => ({ ...prev, [id]: { loading: true } }));
      
      const res = await reEvaluateSignal(id);
      if (res.success) {
        setEvaluationAdvice(prev => ({ 
          ...prev, 
          [id]: { loading: false, ...res.data.advice, currentPrice: res.data.currentMarket.price } 
        }));
      }
    } catch (err) {
      console.error('Evaluation failed:', err);
      setEvaluationAdvice(prev => ({ 
        ...prev, 
        [id]: { loading: false, error: true } 
      }));
    }
  };

  if (loading && signals.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        {[1, 2].map(i => (
          <div key={i} className="bg-surface-container border border-slate-800 rounded-xl p-5 h-40"></div>
        ))}
      </div>
    );
  }

  if (signals.length === 0) {
    return (
      <div className="bg-surface-container border border-slate-800 rounded-xl p-10 text-center">
        <p className="text-outline text-xs font-black uppercase tracking-widest">No Saved Signals Found</p>
        <p className="text-[10px] text-slate-600 mt-2">Generate and save analysis to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          History Count: {signals.length}
        </span>
        <button 
          onClick={handleClearAll}
          className="text-[9px] font-black uppercase tracking-widest text-error/60 hover:text-error flex items-center gap-1.5 transition-colors border border-error/20 hover:border-error/40 px-2 py-1 rounded"
        >
          <span className="material-symbols-outlined text-[12px]">delete_sweep</span>
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {signals.map((signal) => {
          const isBullish = signal.direction === 'bullish';
          const isBearish = signal.direction === 'bearish';
          const accentColor = isBullish ? 'secondary' : isBearish ? 'error' : 'primary';
          const evaluation = evaluationAdvice[signal._id];
          const isEvaluating = evaluatingId === signal._id;
          
          return (
            <div 
              key={signal._id} 
              className={`bg-surface-container border ${isEvaluating ? 'border-primary' : 'border-slate-800'} rounded-xl p-5 shadow-lg group hover:border-slate-600 transition-all relative overflow-hidden`}
            >
              {/* Background Accent */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${accentColor}/5 rounded-full -mr-8 -mt-8 blur-2xl`}></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <h4 className="text-sm font-bold text-on-surface flex items-center gap-2">
                    {signal.symbol}
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-blue-400 font-mono font-bold uppercase">{signal.timeframe || '??'}</span>
                    <span className="text-[9px] text-slate-500 font-mono">@{signal.price?.toLocaleString()}</span>
                  </h4>
                  <p className="text-[9px] font-mono text-outline uppercase tracking-widest mt-1">
                    {new Date(signal.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-2 py-0.5 bg-${accentColor}/10 text-${accentColor} font-black uppercase tracking-wider rounded border border-${accentColor}/30`}>
                    {signal.direction}
                  </span>
                  <button 
                    onClick={(e) => handleDelete(e, signal._id)}
                    className="p-1 hover:text-error text-slate-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Confidence</p>
                  <p className="text-xs font-mono font-bold text-on-surface">{signal.confidence || '--'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Risk Level</p>
                  <p className={`text-xs font-mono font-bold text-${accentColor}`}>{signal.risk || '--'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mb-4 relative z-10">
                <button 
                  onClick={() => onSelectSignal && onSelectSignal(signal)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                  Load Context
                </button>
                <button 
                  onClick={() => handleEvaluate(signal._id)}
                  className={`flex-1 ${isEvaluating ? 'bg-primary text-white' : 'bg-primary/10 text-primary'} py-1.5 rounded text-[10px] font-black uppercase tracking-widest border border-primary/30 hover:bg-primary/20 transition-all flex items-center justify-center gap-2`}
                >
                  <span className="material-symbols-outlined text-xs">psychology</span>
                  {isEvaluating ? 'Close Audit' : 'Neural Audit'}
                </button>
              </div>

              {/* RE-EVALUATION SECTION (Visible on click) */}
              {isEvaluating && (
                <div className="mt-2 mb-4 space-y-4 relative z-10 fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                       <span className="material-symbols-outlined text-[12px] animate-spin">psychology</span>
                       Neural Risk Audit
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">Live: ${evaluation?.currentPrice?.toLocaleString() || '...'}</span>
                  </div>

                  {evaluation?.loading ? (
                     <div className="py-6 flex flex-col items-center gap-2">
                        <div className="w-5 h-5 border-2 border-slate-700 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Calculating Optimal Exit...</p>
                     </div>
                  ) : (
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg border ${evaluation?.status === 'invalid' ? 'bg-error/10 border-error/30' : evaluation?.status === 'warning' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-secondary/10 border-secondary/30'}`}>
                         <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${evaluation?.status === 'invalid' ? 'text-error' : evaluation?.status === 'warning' ? 'text-orange-400' : 'text-secondary'}`}>
                               {evaluation?.action}
                            </span>
                            <span className="text-[8px] font-mono text-slate-500">{evaluation?.currentPnlEstimate}</span>
                         </div>
                         <p className="text-[10px] font-bold text-on-surface leading-snug mb-2">
                            {evaluation?.advice}
                         </p>
                         
                         {/* Precision Advice */}
                         <div className="pt-2 mt-2 border-t border-white/5 space-y-1.5">
                            <div className="flex items-start gap-2">
                               <span className="material-symbols-outlined text-[12px] text-primary mt-0.5">security</span>
                               <p className="text-[9px] text-on-surface-variant"><span className="font-bold text-primary uppercase">SL MGMT:</span> {evaluation?.stopLossManagement}</p>
                            </div>
                            <div className="flex items-start gap-2">
                               <span className="material-symbols-outlined text-[12px] text-secondary mt-0.5">timeline</span>
                               <p className="text-[9px] text-on-surface-variant"><span className="font-bold text-secondary uppercase">PERSPECTIVE:</span> {evaluation?.holdingPerspective}</p>
                            </div>
                         </div>
                      </div>

                      <div className="bg-slate-800/30 p-2.5 rounded border border-slate-800/50">
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Risk Adjustment Note</p>
                        <p className="text-[9px] font-medium text-slate-300 italic">"{evaluation?.riskAdjustment}"</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer Setup */}
              <div className={`mt-4 flex gap-2 relative z-10 transition-all ${isEvaluating ? 'opacity-50 scale-95' : ''}`}>
                 <div className="flex-1 text-center py-2 bg-slate-800/50 rounded border border-slate-800">
                    <p className="text-[8px] text-slate-500 uppercase font-black">Entry</p>
                    <p className="text-[10px] font-mono text-on-surface">{signal.tradeSetup?.entryPoint || '--'}</p>
                 </div>
                 <div className="flex-1 text-center py-2 bg-slate-800/50 rounded border border-slate-800">
                    <p className="text-[8px] text-slate-500 uppercase font-black">Target</p>
                    <p className="text-[10px] font-mono text-secondary">{signal.tradeSetup?.takeProfit1 || '--'}</p>
                 </div>
                 <div className="flex-1 text-center py-2 bg-slate-800/50 rounded border border-slate-800">
                    <p className="text-[8px] text-slate-500 uppercase font-black">Stop</p>
                    <p className="text-[10px] font-mono text-error">{signal.tradeSetup?.stopLoss || '--'}</p>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavedSignals;
