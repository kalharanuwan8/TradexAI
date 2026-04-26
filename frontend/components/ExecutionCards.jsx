import React from 'react';

const ExecutionCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Card 1 */}
      <div className="bg-surface-container border border-slate-800 rounded-xl p-5 shadow-lg group hover:border-secondary/30 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-sm font-bold text-on-surface">Long BTC Execution</h4>
            <p className="text-[10px] font-mono text-outline uppercase tracking-widest mt-1">Neural Strategy V4.2</p>
          </div>
          <span className="text-[9px] px-2 py-0.5 bg-secondary/10 text-secondary font-black uppercase tracking-wider rounded border border-secondary/30">
            Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Entry Price</p>
            <p className="text-sm font-mono font-bold text-on-surface">$78,120.00</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Current P/L</p>
            <p className="text-sm font-mono font-bold text-secondary">+$1,240.40 (1.6%)</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 bg-surface-container-high hover:bg-slate-700 text-on-surface text-[10px] font-black py-2 px-4 rounded border border-slate-700 transition-all uppercase tracking-widest">
            Adjust SL/TP
          </button>
          <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-outline text-[10px] font-black py-2 px-4 rounded transition-all uppercase tracking-widest border border-slate-700">
            Details
          </button>
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-surface-container border border-slate-800 rounded-xl p-5 shadow-lg group hover:border-primary/30 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-sm font-bold text-on-surface">Short ETH Hedge</h4>
            <p className="text-[10px] font-mono text-outline uppercase tracking-widest mt-1">Market Imbalance AI</p>
          </div>
          <span className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary font-black uppercase tracking-wider rounded border border-primary/30">
            Pending
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Trigger Price</p>
            <p className="text-sm font-mono font-bold text-on-surface">$3,150.20</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Est. Confidence</p>
            <p className="text-sm font-mono font-bold text-on-surface">88.4%</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 bg-primary text-[#031427] text-[10px] font-black py-2 px-4 rounded transition-all uppercase tracking-widest hover:scale-[1.02]">
            Cancel Order
          </button>
          <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-outline text-[10px] font-black py-2 px-4 rounded transition-all uppercase tracking-widest border border-slate-700">
            Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExecutionCards;
