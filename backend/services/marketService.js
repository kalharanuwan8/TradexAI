const { getExchange, loadMarkets } = require('../config/exchange');

// Simple in-memory cache
const marketCache = new Map();
const CACHE_DURATION = {
  TICKER: 10000,      // 10 seconds
  CANDLES: 15000,    // 15 seconds
  TOP_SYMBOLS: 300000 // 5 minutes (reduced frequency for slow endpoints)
};

// Use shared Binance API
const exchange = getExchange();

/**
 * Fetch current ticker price for a symbol
 */
async function fetchTicker(symbol = 'BTC/USDT') {
  const cacheKey = `ticker_${symbol}`;
  const cached = marketCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION.TICKER)) {
    return cached.data;
  }

  try {
    const ticker = await exchange.fetchTicker(symbol);
    const data = {
      symbol,
      price: ticker.last,
      bid: ticker.bid,
      ask: ticker.ask,
      high24h: ticker.high,
      low24h: ticker.low,
      volume24h: ticker.baseVolume,
      change24h: ticker.change,
      changePercent24h: ticker.percentage,
      timestamp: ticker.timestamp,
    };
    marketCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    console.error('[marketService] fetchTicker error:', err.message);
    if (cached) return cached.data;
    throw new Error(`Failed to fetch ticker for ${symbol}: ${err.message}`);
  }
}

/**
 * Fetch OHLCV candlestick data
 */
async function fetchCandles(symbol = 'BTC/USDT', timeframe = '5m', limit = 100) {
  const cacheKey = `candles_${symbol}_${timeframe}`;
  const cached = marketCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION.CANDLES)) {
    return cached.data;
  }

  try {
    const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit);
    const data = ohlcv.map(([timestamp, open, high, low, close, volume]) => ({
      timestamp,
      open: Number(open) || 0,
      high: Number(high) || 0,
      low: Number(low) || 0,
      close: Number(close) || 0,
      volume: Number(volume) || 0,
    })).filter(c => !isNaN(c.open) && !isNaN(c.close));

    marketCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    console.error('[marketService] fetchCandles error:', err.message);
    if (cached) return cached.data;
    throw new Error(`Failed to fetch candles for ${symbol}: ${err.message}`);
  }
}

/**
 * Fetch full market data (ticker + candles)
 */
async function fetchMarketData(symbol = 'BTC/USDT', timeframe = '5m') {
  const [ticker, candles] = await Promise.all([
    fetchTicker(symbol),
    fetchCandles(symbol, timeframe, 200),
  ]);

  return {
    symbol,
    timeframe,
    price: ticker.price,
    ticker,
    candles,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Fetch top N symbols by volume
 */
async function fetchTopSymbols(limit = 20) {
  const cacheKey = 'top_symbols';
  const cached = marketCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION.TOP_SYMBOLS)) {
    return cached.data;
  }

  try {
    // Add a promise race to prevent hanging the whole server
    // Increased timeout for fetchTickers which is a heavy call
    const fetchPromise = exchange.fetchTickers();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('CCXT Timeout')), 25000)
    );

    const tickers = await Promise.race([fetchPromise, timeoutPromise]);
    
    const data = Object.values(tickers)
      .filter(t => t.symbol && (t.symbol.includes('/USDT') || t.symbol.includes('USDT')))
      .sort((a, b) => (b.quoteVolume || 0) - (a.quoteVolume || 0))
      .slice(0, limit)
      .map(t => ({
        symbol: t.symbol,
        volume: t.quoteVolume,
        change: t.percentage,
        price: t.last
      }));
    
    if (data.length > 0) {
      marketCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    }
    throw new Error('No tickers found after filtering');
  } catch (err) {
    console.error('[marketService] fetchTopSymbols error:', err.message);
    if (cached) return cached.data;
    
    // Static fallback to prevent frontend crash
    return [
      { symbol: 'BTC/USDT', volume: 1000000000, change: 0.5, price: 65000 },
      { symbol: 'ETH/USDT', volume: 500000000, change: -0.2, price: 3500 },
      { symbol: 'BNB/USDT', volume: 200000000, change: 1.2, price: 600 },
      { symbol: 'SOL/USDT', volume: 300000000, change: -2.5, price: 150 },
      { symbol: 'XRP/USDT', volume: 100000000, change: 0.1, price: 0.5 }
    ];
  }
}

/**
 * Fetch all available USDT trading pairs
 */
async function fetchAllSymbols() {
  try {
    await loadMarkets();
    return Object.values(exchange.markets)
      .filter(m => m.active && m.quote === 'USDT' && (m.type === 'swap' || m.type === 'future'))
      .map(m => m.symbol)
      .sort();
  } catch (err) {
    console.error('[marketService] fetchAllSymbols error:', err.message);
    return ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT'];
  }
}

module.exports = { fetchTicker, fetchCandles, fetchMarketData, fetchTopSymbols, fetchAllSymbols };