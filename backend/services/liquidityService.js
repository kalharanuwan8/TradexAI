const { getExchange } = require('../config/exchange');

/**
 * Fetch advanced liquidity metrics from Binance Futures
 */
async function fetchLiquidityMetrics(symbol) {
  try {
    const exchange = getExchange();
    
    // Convert symbol for CCXT if needed (e.g. BTC/USDT)
    const [fundingRate, openInterest] = await Promise.all([
      exchange.fetchFundingRate(symbol).catch(() => null),
      exchange.fetchOpenInterest(symbol).catch(() => null)
    ]);

    // Binance specific: Long/Short Ratio (top traders)
    // We use exchange.fapiPrivateGetTopLongShortAccountRatio or similar if needed
    // But for public, we can use public stats
    let longShortRatio = null;
    try {
      // CCXT might not have a direct unified method for this yet, so we use the implicit API
      const base = symbol.split('/')[0];
      const stats = await exchange.fapiPublicGetGlobalLongShortAccountRatio({
        symbol: base + 'USDT',
        period: '1h'
      });
      if (stats && stats.length > 0) {
        longShortRatio = parseFloat(stats[stats.length - 1].longShortRatio);
      }
    } catch (e) {
      console.warn(`[Liquidity] Could not fetch Long/Short Ratio for ${symbol}:`, e.message);
    }

    return {
      fundingRate: fundingRate ? fundingRate.fundingRate : null,
      openInterest: openInterest ? openInterest.openInterestAmount : null,
      longShortRatio,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Liquidity Service] Error:', error.message);
    return null;
  }
}

module.exports = { fetchLiquidityMetrics };
