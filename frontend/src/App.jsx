import React, { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { saveSignal } from '../services/api';
import IndicatorsPanel from '../components/Indicatorspanel';
import CandlestickChart from '../components/CandlestickChart';
import OrderFlowPanel from '../components/OrderFlowPanel';
import SymbolSearch from '../components/SymbolSearch';
import IntelligenceCommand from '../components/IntelligenceCommand';
import SavedSignals from '../components/SavedSignals';
import TradingViewChart from '../components/TradingViewChart';
import ChatBot from '../components/ChatBot';



export default function App() {
  const {
    symbol, timeframe,
    data, orderFlow,
    loading, orderFlowLoading, aiLoading, error,
    lastUpdated, autoRefresh, setAutoRefresh,
    refresh, runAIAnalysis, changeSymbol, changeTimeframe,
    supportedSymbols, timeframes, topMovers = [],
  } = useDashboard();

  const [signalsRefreshTrigger, setSignalsRefreshTrigger] = useState(0);
  const [chartMode, setChartMode] = useState('normal'); // 'normal' or 'tradingview'


  const handleSaveSignal = async () => {
    if (!data?.aiAnalysis) return;
    try {
      await saveSignal({
        symbol,
        price: data.ticker?.price,
        direction: data.aiAnalysis.direction,
        recommendation: data.aiAnalysis.recommendation,
        confidence: data.aiAnalysis.confidence,
        risk: data.aiAnalysis.risk,
        stabilityScore: data.aiAnalysis.stabilityScore,
        summary: data.aiAnalysis.summary,
        reasoning: data.aiAnalysis.reasoning,
        tradeSetup: data.aiAnalysis.tradeSetup,
        timeframe: timeframe
      });
      alert('Signal saved successfully!');
      // Trigger a refresh of the SavedSignals component
      setSignalsRefreshTrigger(prev => prev + 1);
    } catch (err) {
      alert('Failed to save signal: ' + err.message);
    }
  };

  const handleGlobalRefresh = () => {
    refresh();
    // Also refresh the saved signals log per user request
    setSignalsRefreshTrigger(prev => prev + 1);
  };
  
  const d = data || {};
  const currentPrice = d.ticker?.price || 0;
  const change24h = d.ticker?.changePercent24h || 0;
  const isPositive = change24h >= 0 || change24h.toString().includes('+');
  
  const rawScore = d.score?.normalizedScore || 0;
  const displayScore = Math.round(((rawScore + 10) / 20) * 100);

  const activeOrderFlow = orderFlow || d.orderFlow;

  return (
    <div className="min-h-screen bg-[#031427] text-on-surface font-['Inter'] overflow-hidden">
      {/* TopAppBar */}
      <header className="bg-[#0F172A] border-b border-slate-800 flex justify-between items-center w-full px-4 h-12 z-50 fixed top-0">
        <div className="flex items-center gap-6">
          <span className="text-blue-500 font-bold text-lg tracking-tighter">TRADEX AI</span>
          <nav className="flex items-center gap-4">
            <SymbolSearch 
              symbol={symbol} 
              onSymbolChange={changeSymbol} 
              supportedSymbols={supportedSymbols} 
            />
            
            <div className="flex items-center bg-surface-container rounded-sm border border-outline-variant overflow-hidden">
              <select
                value={timeframe}
                onChange={(e) => changeTimeframe(e.target.value)}
                className="bg-transparent px-3 py-1 text-[10px] font-bold uppercase text-outline outline-none cursor-pointer hover:bg-white/5 transition-colors"
              >
                {timeframes.map(tf => (
                  <option key={tf} value={tf} className="bg-[#0F172A] text-white">{tf}</option>
                ))}
              </select>
            </div>

            <span className={`font-['Work_Sans'] text-xs font-medium uppercase tracking-wider ${isPositive ? 'text-secondary' : 'text-error'}`}>
              {isPositive ? '+' : ''}{typeof change24h === 'number' ? change24h.toFixed(2) : change24h}%
            </span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleGlobalRefresh}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1 text-[10px] font-bold rounded uppercase transition-colors"
          >
            <span className="material-symbols-outlined text-[12px]">refresh</span>
            Refresh
          </button>
          <div className="text-[10px] text-outline uppercase font-bold px-2 py-1 border border-outline-variant rounded">
            Backend: Online
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-12 h-[calc(100vh-48px)] w-[260px] bg-[#1E293B] border-r border-slate-800 flex flex-col py-4 gap-2 z-40">
        <div className="px-6 mb-6">
          <h2 className="text-blue-500 font-black font-headline text-lg tracking-tight">TRADING DESK</h2>
          <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">Institutional Grade</p>
        </div>
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto custom-scrollbar">
          <a className="flex items-center gap-3 px-4 py-3 bg-slate-800 text-blue-500 border-r-2 border-blue-500 font-['Work_Sans'] text-sm font-semibold tracking-tight transition-all duration-200" href="#">
            <span className="material-symbols-outlined text-sm">dashboard</span>
            <span>Command Center</span>
          </a>

          <div className="mt-8 px-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[12px] text-secondary">analytics</span>
              Coins to Watch
            </h3>
            <div className="space-y-1">
              {topMovers.length > 0 ? topMovers.map(m => {
                const s = typeof m === 'string' ? m : m.symbol;
                const change = typeof m === 'string' ? 0 : (m.change || 0);
                const isPos = change >= 0;
                
                return (
                  <button 
                    key={s}
                    onClick={() => changeSymbol(s)}
                    className={`w-full group flex flex-col gap-1 px-3 py-2.5 rounded transition-all duration-200 border ${
                      s === symbol 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                        : 'text-slate-400 hover:bg-slate-800/50 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-xs font-bold">{s.split('/')[0]}</span>
                      {typeof m !== 'string' && (
                        <span className={`text-[10px] font-bold ${isPos ? 'text-secondary' : 'text-error'}`}>
                          {isPos ? '+' : ''}{change.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </button>
                );
              }) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="w-4 h-4 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-[10px] text-slate-600 italic">Tracking market volume...</p>
                </div>
              )}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[260px] mt-12 p-4 h-[calc(100vh-48px)] overflow-y-auto custom-scrollbar relative z-10 bg-[#031427]">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="grid grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Main Analysis (8 cols) */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-2xl font-semibold text-on-surface">Command Center</h1>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase border border-outline-variant ${autoRefresh ? 'text-secondary bg-secondary/5' : 'text-orange-400 bg-orange-400/5'}`}>
                    FEED: {autoRefresh ? 'ACTIVE' : 'MANUAL'}
                  </span>
                  <span className="bg-surface-container-highest px-3 py-1 text-[10px] font-bold uppercase text-outline border border-outline-variant">LATENCY: 14MS</span>
                </div>
              </div>

              {/* Chart Section */}
              <section className="bg-surface-container border border-slate-800 rounded-lg shadow-2xl relative flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-blue-500">monitoring</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Market Analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex bg-[#031427] p-1 rounded-full border border-slate-700/50">
                      <button 
                        onClick={() => setChartMode('normal')}
                        className={`px-4 py-1 text-[9px] font-black uppercase transition-all duration-300 rounded-full ${chartMode === 'normal' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Institutional
                      </button>
                      <button 
                        onClick={() => setChartMode('tradingview')}
                        className={`px-4 py-1 text-[9px] font-black uppercase transition-all duration-300 rounded-full ${chartMode === 'tradingview' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        TradingView
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4 h-[510px]">
                  {chartMode === 'normal' ? (
                    <CandlestickChart candles={d.candles} indicators={d.indicators} timeframe={timeframe} loading={loading} />
                  ) : (
                    <TradingViewChart symbol={symbol} timeframe={timeframe} />
                  )}
                </div>
              </section>


              {/* Intelligence Section */}
              <section className="fade-in">
                <IntelligenceCommand 
                  analysis={d.aiAnalysis} 
                  loading={aiLoading} 
                  onSaveSignal={handleSaveSignal}
                  onRunAnalysis={runAIAnalysis}
                  symbol={symbol}
                  sentimentScore={displayScore}
                />
              </section>

              {/* Saved Signals Section */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Institutional Signal Log</h3>
                   <div className="h-px flex-1 bg-slate-800/50"></div>
                </div>
                <SavedSignals 
                  refreshTrigger={signalsRefreshTrigger} 
                  onSelectSignal={(s) => {
                    changeSymbol(s.symbol);
                    changeTimeframe(s.timeframe);
                  }} 
                />
              </section>
            </div>

            {/* RIGHT COLUMN: Market Context (4 cols) */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              
              {/* Asset Snapshot (Mini Market Feed) */}
              <section className="bg-surface-container border border-slate-800 rounded-lg overflow-hidden shadow-xl">
                <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-surface-container-high/50">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-on-surface">Asset Snapshot</h3>
                  <span className={`text-[10px] font-mono font-bold ${isPositive ? 'text-secondary' : 'text-error'}`}>
                    {symbol}
                  </span>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                    <span className="text-[10px] text-outline uppercase font-bold">Price</span>
                    <span className="font-mono text-base font-bold text-on-surface">
                      {loading ? '...' : (typeof currentPrice === 'number' ? `$${currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : currentPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                    <span className="text-[10px] text-outline uppercase font-bold">24h Change</span>
                    <span className={`font-mono text-sm font-bold ${isPositive ? 'text-secondary' : 'text-error'}`}>
                      {loading ? '...' : (typeof change24h === 'number' ? `${isPositive ? '+' : ''}${change24h.toFixed(2)}%` : change24h)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-outline uppercase font-bold">AI Signal</span>
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase border ${isPositive ? 'bg-secondary/10 text-secondary border-secondary/30' : 'bg-error/10 text-error border-error/30'}`}>
                       {d.aiAnalysis?.direction || 'NEUTRAL'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Order Flow Focus */}
              <section className="h-fit">
                <OrderFlowPanel orderFlow={activeOrderFlow} loading={orderFlowLoading && !activeOrderFlow} />
              </section>

              {/* Technical Indicators Sidebar */}
              <section>
                <IndicatorsPanel indicators={d.indicators} loading={loading} />
              </section>

            </div>

          </div>
        </div>
      </main>

      {/* Decorative Blur Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full"></div>
      </div>

      {/* ChatBot Widget */}
      <ChatBot />
    </div>

  );
}