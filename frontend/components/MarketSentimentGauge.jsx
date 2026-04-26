import React from 'react';

const MarketSentimentGauge = ({ score, loading }) => {
  // Map normalizedScore (-10 to 10) to 0-100
  const rawScore = score?.normalizedScore || 0;
  const displayScore = loading ? '-' : Math.round(((rawScore + 10) / 20) * 100);
  const bias = rawScore > 2 ? 'BULLISH BIAS' : rawScore < -2 ? 'BEARISH BIAS' : 'NEUTRAL';
  const colorClass = rawScore > 2 ? 'text-secondary' : rawScore < -2 ? 'text-error' : 'text-primary';

  // SVG Circle calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = loading ? circumference : circumference - (displayScore / 100) * circumference;

  return (
    <div className="bg-surface-800 rounded-xl border border-white/5 p-5 flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-mono text-white/50 tracking-widest uppercase">Market Sentiment</h3>
        <button className="text-white/30 hover:text-white">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative my-4">
        {/* SVG Gauge */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            {/* Background Circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="10"
            />
            {/* Foreground Circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`${colorClass} transition-all duration-1000 ease-out`}
            />
          </svg>
          
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-4xl font-display font-bold ${colorClass}`}>
              {displayScore}
            </span>
            <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest mt-1">
              {bias}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-white/5">
        <div>
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1">Fear/Greed</p>
          <p className="text-sm font-medium text-white/90">
            {displayScore > 60 ? '68 (Greed)' : displayScore < 40 ? '32 (Fear)' : '50 (Neutral)'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1">Volatility</p>
          <p className="text-sm font-medium text-white/90">Moderate</p>
        </div>
      </div>
    </div>
  );
};

export default MarketSentimentGauge;
