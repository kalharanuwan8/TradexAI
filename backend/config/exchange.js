const ccxt = require('ccxt');

// Singleton instance
let exchangeInstance = null;
let marketsLoaded = false;
let loadPromise = null;

/**
 * Get or create the shared Binance CCXT instance
 */
function getExchange() {
  if (!exchangeInstance) {
    console.log('[Exchange] Initializing shared Binance instance...');
    exchangeInstance = new ccxt.binance({
      enableRateLimit: true,
      options: { defaultType: 'swap' },
      apiKey: process.env.BINANCE_API_KEY || '',
      secret: process.env.BINANCE_SECRET_KEY || '',
      timeout: 60000, // 60s timeout to handle slow exchangeInfo calls
    });
  }
  return exchangeInstance;
}

/**
 * Load markets with a longer timeout and shared promise to prevent redundant calls
 */
async function loadMarkets(force = false) {
  const exchange = getExchange();
  
  if (marketsLoaded && !force) return exchange.markets;

  // If already loading, wait for that promise
  if (loadPromise && !force) return loadPromise;

  loadPromise = (async () => {
    try {
      console.log('[Exchange] Loading Binance markets (exchangeInfo)...');
      await exchange.loadMarkets();
      marketsLoaded = true;
      console.log('[Exchange] Markets loaded successfully');
      return exchange.markets;
    } catch (err) {
      console.error('[Exchange] Error loading markets:', err.message);
      loadPromise = null; // Allow retry
      throw err;
    }
  })();

  return loadPromise;
}

module.exports = { getExchange, loadMarkets };
