import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchFullAnalysis, fetchOrderFlow, fetchSymbols, fetchTopMovers } from '../services/api';

const INITIAL_SYMBOLS = [
  'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT',
];

const TIMEFRAMES = [
  '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'
];

const REFRESH_INTERVAL = 30000; // 30 seconds

export function useDashboard() {
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('15m');
  const [data, setData] = useState(null);
  const [orderFlow, setOrderFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderFlowLoading, setOrderFlowLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [supportedSymbols, setSupportedSymbols] = useState(INITIAL_SYMBOLS);
  const [topMovers, setTopMovers] = useState([]);

  const intervalRef = useRef(null);
  const orderFlowIntervalRef = useRef(null);

  const loadAnalysis = useCallback(async (sym = symbol, tf = timeframe, includeAI = false) => {
    try {
      setError(null);
      if (includeAI) setAiLoading(true);
      const result = await fetchFullAnalysis(sym, tf, includeAI);
      if (result.success) {
        setData(prev => {
          // If we didn't request AI analysis this time, keep the old one so it doesn't vanish
          // UNLESS the symbol or timeframe has changed (handled in change functions)
          if (!includeAI && prev && prev.aiAnalysis) {
            return { ...result.data, aiAnalysis: prev.aiAnalysis };
          }
          return result.data;
        });
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError(err.message);
      console.error('[useDashboard] loadAnalysis error:', err.message);
    } finally {
      setLoading(false);
      if (includeAI) setAiLoading(false);
    }
  }, [symbol, timeframe]);

  const loadOrderFlow = useCallback(async (sym = symbol) => {
    try {
      setOrderFlowLoading(true);
      const result = await fetchOrderFlow(sym);
      if (result.success) {
        setOrderFlow(result.data);
      }
    } catch (err) {
      console.error('[useDashboard] loadOrderFlow error:', err.message);
    } finally {
      setOrderFlowLoading(false);
    }
  }, [symbol]);

  const metadataLoaded = useRef(false);

  // Load symbols once on mount
  useEffect(() => {
    if (metadataLoaded.current) return;
    
    const loadSymbols = async () => {
      try {
        const result = await fetchSymbols();
        if (result.success && Array.isArray(result.data)) {
          setSupportedSymbols(result.data);
        }
      } catch (err) {
        console.error('[useDashboard] loadSymbols error:', err.message);
      }
    };
    const loadTopMovers = async () => {
      try {
        const result = await fetchTopMovers();
        if (result.success && Array.isArray(result.data)) {
          setTopMovers(result.data);
          metadataLoaded.current = true;
        }
      } catch (err) {
        console.error('[useDashboard] loadTopMovers error:', err.message);
      }
    };
    loadSymbols();
    loadTopMovers();
  }, []);

  // Initial load - Do not run AI Analysis by default
  useEffect(() => {
    setLoading(true);
    loadAnalysis(symbol, timeframe, false);
    loadOrderFlow(symbol);
  }, [symbol, timeframe]);

  // Auto refresh - Disabled by default to prevent API bans
  useEffect(() => {
    if (!autoRefresh) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (orderFlowIntervalRef.current) clearInterval(orderFlowIntervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      loadAnalysis(symbol, timeframe, false);
    }, REFRESH_INTERVAL);

    orderFlowIntervalRef.current = setInterval(() => {
      loadOrderFlow(symbol);
    }, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (orderFlowIntervalRef.current) clearInterval(orderFlowIntervalRef.current);
    };
  }, [autoRefresh, symbol, timeframe, loadAnalysis, loadOrderFlow]);

  const refresh = useCallback(() => {
    setLoading(true);
    loadAnalysis(symbol, timeframe, false);
    loadOrderFlow(symbol);
  }, [symbol, timeframe, loadAnalysis, loadOrderFlow]);

  const runAIAnalysis = useCallback(() => {
    loadAnalysis(symbol, timeframe, true);
  }, [symbol, timeframe, loadAnalysis]);

  const changeSymbol = useCallback((newSymbol) => {
    setSymbol(newSymbol);
    setLoading(true);
    setData(null); // This clears aiAnalysis too
    setOrderFlow(null);
  }, []);

  const changeTimeframe = useCallback((newTf) => {
    setTimeframe(newTf);
    setLoading(true);
    setData(null); // Clear previous analysis/AI data when timeframe changes
  }, []);

  return {
    symbol,
    timeframe,
    data,
    orderFlow,
    loading,
    orderFlowLoading,
    aiLoading,
    error,
    lastUpdated,
    autoRefresh,
    setAutoRefresh,
    refresh,
    runAIAnalysis,
    changeSymbol,
    changeTimeframe,
    supportedSymbols,
    topMovers,
    timeframes: TIMEFRAMES,
  };
}