import React, { useState, useRef, useEffect } from 'react';

const SymbolSearch = ({ symbol, onSymbolChange, supportedSymbols }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  const filteredSymbols = supportedSymbols?.filter(s => 
    s.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 50) || []; // Limit to 50 for performance

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-sm border border-outline-variant hover:border-blue-500/50 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
        <span className="font-['Work_Sans'] text-xs font-medium uppercase tracking-wider text-blue-400">
          {symbol}
        </span>
        <span className="material-symbols-outlined text-[14px] text-slate-500">expand_more</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-[#0F172A] border border-slate-800 rounded-md shadow-2xl z-[100] overflow-hidden">
          <div className="p-2 border-b border-slate-800">
            <input
              autoFocus
              type="text"
              placeholder="Search coins..."
              className="w-full bg-[#031427] text-xs text-white border border-slate-700 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredSymbols.length > 0 ? (
              filteredSymbols.map((s) => (
                <div
                  key={s}
                  onClick={() => {
                    onSymbolChange(s);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`px-3 py-2 text-xs font-mono cursor-pointer hover:bg-blue-500/10 hover:text-blue-400 transition-colors ${s === symbol ? 'bg-blue-500/5 text-blue-500' : 'text-slate-400'}`}
                >
                  {s}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-xs text-slate-600 text-center">No matches found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SymbolSearch;
