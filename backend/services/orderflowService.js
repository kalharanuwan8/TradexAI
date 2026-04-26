const { getExchange } = require('../config/exchange');

const exchange = getExchange();


/**
 * Fetch and analyze order book
 * Computes bid/ask volume imbalance across top N levels
 */
async function analyzeOrderBook(symbol = 'BTC/USDT', depth = 50) {
  try {
    const orderBook = await exchange.fetchOrderBook(symbol, depth);

    const bids = orderBook.bids; // [[price, volume], ...]
    const asks = orderBook.asks;

    // Compute total volume on each side
    const bidVolume = bids.reduce((sum, [, vol]) => sum + vol, 0);
    const askVolume = asks.reduce((sum, [, vol]) => sum + vol, 0);
    const totalVolume = bidVolume + askVolume;

    // Imbalance: +1 = fully bid-side, -1 = fully ask-side
    const imbalance =
      totalVolume > 0
        ? parseFloat(((bidVolume - askVolume) / totalVolume).toFixed(4))
        : 0;

    // Bid/Ask walls (largest single levels)
    const topBid = bids[0] ? { price: bids[0][0], volume: bids[0][1] } : null;
    const topAsk = asks[0] ? { price: asks[0][0], volume: asks[0][1] } : null;

    // Spread
    const spread = topAsk && topBid ? parseFloat((topAsk.price - topBid.price).toFixed(4)) : null;
    const spreadPct = topBid ? parseFloat(((spread / topBid.price) * 100).toFixed(4)) : null;

    // Detect large walls (> 3x average)
    const avgBidVol = bidVolume / (bids.length || 1);
    const avgAskVol = askVolume / (asks.length || 1);
    const bidWalls = bids
      .filter(([, v]) => v > avgBidVol * 3)
      .slice(0, 3)
      .map(([p, v]) => ({ price: p, volume: parseFloat(v.toFixed(4)) }));
    const askWalls = asks
      .filter(([, v]) => v > avgAskVol * 3)
      .slice(0, 3)
      .map(([p, v]) => ({ price: p, volume: parseFloat(v.toFixed(4)) }));

    // Signal
    let signal = 'neutral';
    if (imbalance > 0.2) signal = 'bullish';
    else if (imbalance < -0.2) signal = 'bearish';

    return {
      bidVolume: parseFloat(bidVolume.toFixed(4)),
      askVolume: parseFloat(askVolume.toFixed(4)),
      totalVolume: parseFloat(totalVolume.toFixed(4)),
      imbalance,
      signal,
      spread,
      spreadPct,
      topBid,
      topAsk,
      bidWalls,
      askWalls,
      // Pass top 20 levels for visualization
      bidsTop20: bids.slice(0, 20).map(([p, v]) => ({ price: p, volume: v })),
      asksTop20: asks.slice(0, 20).map(([p, v]) => ({ price: p, volume: v })),
    };
  } catch (err) {
    console.error('[orderFlowService] analyzeOrderBook error:', err.message);
    throw new Error(`Failed to analyze order book: ${err.message}`);
  }
}

/**
 * Fetch recent trades and compute buy/sell pressure
 */
async function analyzeTradeFlow(symbol = 'BTC/USDT', limit = 500) {
  try {
    const trades = await exchange.fetchTrades(symbol, undefined, limit);

    let buyVolume = 0;
    let sellVolume = 0;
    let buyCount = 0;
    let sellCount = 0;
    let buyVolumeQuote = 0;
    let sellVolumeQuote = 0;

    // Compute cumulative delta
    const cumulativeDeltaSeries = [];
    let delta = 0;

    for (const trade of trades) {
      const isBuy = trade.side === 'buy';
      const vol = trade.amount;
      const quoteVol = trade.cost || trade.amount * trade.price;

      if (isBuy) {
        buyVolume += vol;
        buyVolumeQuote += quoteVol;
        buyCount++;
        delta += vol;
      } else {
        sellVolume += vol;
        sellVolumeQuote += quoteVol;
        sellCount++;
        delta -= vol;
      }

      cumulativeDeltaSeries.push({
        timestamp: trade.timestamp,
        delta: parseFloat(delta.toFixed(4)),
      });
    }

    const totalTradeVolume = buyVolume + sellVolume;
    const buyRatio =
      totalTradeVolume > 0
        ? parseFloat(((buyVolume / totalTradeVolume) * 100).toFixed(2))
        : 50;
    const sellRatio = parseFloat((100 - buyRatio).toFixed(2));

    // Net delta
    const netDelta = parseFloat((buyVolume - sellVolume).toFixed(4));
    const deltaPct =
      totalTradeVolume > 0
        ? parseFloat(((netDelta / totalTradeVolume) * 100).toFixed(2))
        : 0;

    // Pressure signal
    let pressure = 'neutral';
    if (buyRatio > 55) pressure = 'buying';
    else if (sellRatio > 55) pressure = 'selling';

    return {
      buyVolume: parseFloat(buyVolume.toFixed(4)),
      sellVolume: parseFloat(sellVolume.toFixed(4)),
      buyVolumeQuote: parseFloat(buyVolumeQuote.toFixed(2)),
      sellVolumeQuote: parseFloat(sellVolumeQuote.toFixed(2)),
      buyCount,
      sellCount,
      totalTrades: trades.length,
      buyRatio,
      sellRatio,
      netDelta,
      deltaPct,
      pressure,
      cumulativeDeltaSeries: cumulativeDeltaSeries.slice(-50), // last 50 for chart
    };
  } catch (err) {
    console.error('[orderFlowService] analyzeTradeFlow error:', err.message);
    throw new Error(`Failed to analyze trade flow: ${err.message}`);
  }
}

/**
 * Combined order flow signal using both order book + trade flow
 */
function combineOrderFlowSignals(orderBook, tradeFlow) {
  const { imbalance, signal: bookSignal } = orderBook;
  const { pressure, deltaPct, buyRatio } = tradeFlow;

  let orderFlowSignal = 'neutral';
  let strength = 0;

  // Strong bullish: book imbalance favors bids + buying pressure
  if (imbalance > 0.2 && pressure === 'buying') {
    orderFlowSignal = 'strong_bullish';
    strength = Math.min(Math.abs(imbalance) * 5 + buyRatio / 20, 5);
  }
  // Strong bearish: book imbalance favors asks + selling pressure
  else if (imbalance < -0.2 && pressure === 'selling') {
    orderFlowSignal = 'strong_bearish';
    strength = Math.min(Math.abs(imbalance) * 5 + (100 - buyRatio) / 20, 5);
  }
  // Moderate signals
  else if (imbalance > 0.1 || pressure === 'buying') {
    orderFlowSignal = 'moderate_bullish';
    strength = 2;
  } else if (imbalance < -0.1 || pressure === 'selling') {
    orderFlowSignal = 'moderate_bearish';
    strength = 2;
  }

  return {
    orderFlowSignal,
    strength: parseFloat(strength.toFixed(2)),
    imbalance,
    pressure,
    deltaPct,
    bookSignal,
  };
}

/**
 * Main order flow analysis entry point
 */
async function getOrderFlowAnalysis(symbol = 'BTC/USDT') {
  const [orderBookResult, tradeFlowResult] = await Promise.allSettled([
    analyzeOrderBook(symbol),
    analyzeTradeFlow(symbol),
  ]);

  const orderBook = orderBookResult.status === 'fulfilled' ? orderBookResult.value : null;
  const tradeFlow = tradeFlowResult.status === 'fulfilled' ? tradeFlowResult.value : null;

  let combined = { orderFlowSignal: 'neutral', strength: 0 };
  if (orderBook && tradeFlow) {
    combined = combineOrderFlowSignals(orderBook, tradeFlow);
  }


  return {
    orderBook,
    tradeFlow,
    combined,
    analyzedAt: new Date().toISOString(),
  };
}

module.exports = { getOrderFlowAnalysis, analyzeOrderBook, analyzeTradeFlow };