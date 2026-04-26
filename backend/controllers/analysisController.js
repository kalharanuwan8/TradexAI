const { fetchMarketData } = require('../services/marketService');
const { computeIndicators } = require('../services/indicatorService');
const { getOrderFlowAnalysis } = require('../services/orderflowService');
const { getSentimentAnalysis } = require('../services/sentimentService');
const { getAIAnalysis, getReEvaluationAdvice } = require('../services/aiService');
const { calculateScore } = require('../services/scoringService');
const { fetchLiquidityMetrics } = require('../services/liquidityService');
const Signal = require('../models/Signal');

/**
 * GET /api/market?symbol=BTC/USDT&timeframe=5m
 * Returns raw market data (ticker + candles)
 */
async function getMarketData(req, res) {
  try {
    const symbol = req.query.symbol || 'BTC/USDT';
    const timeframe = req.query.timeframe || '5m';

    const data = await fetchMarketData(symbol, timeframe);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[Controller] getMarketData error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/orderflow?symbol=BTC/USDT
 * Returns order book imbalance + trade flow analysis
 */
async function getOrderFlow(req, res) {
  try {
    const symbol = req.query.symbol || 'BTC/USDT';
    const data = await getOrderFlowAnalysis(symbol);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[Controller] getOrderFlow error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/score?symbol=BTC/USDT
 * Returns confluence score + signal
 */
async function getScore(req, res) {
  try {
    const symbol = req.query.symbol || 'BTC/USDT';

    const [marketData, orderFlow, sentiment] = await Promise.all([
      fetchMarketData(symbol, '15m'),
      getOrderFlowAnalysis(symbol),
      getSentimentAnalysis(symbol),
    ]);

    const indicators = computeIndicators(marketData.candles);
    const score = calculateScore(indicators, orderFlow, sentiment);

    res.json({ success: true, data: { score, indicators, symbol } });
  } catch (err) {
    console.error('[Controller] getScore error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/analysis?symbol=BTC/USDT&timeframe=15m
 * Full analysis: indicators + order flow + sentiment + AI + score
 * This is the primary endpoint for the dashboard
 */
async function getFullAnalysis(req, res) {
  try {
    const symbol = req.query.symbol || 'BTC/USDT';
    const timeframe = req.query.timeframe || '15m';

    console.log(`[Controller] Full analysis request: ${symbol} ${timeframe}`);

    // Fetch all data concurrently
    const [marketData, orderFlow, sentiment] = await Promise.all([
      fetchMarketData(symbol, timeframe),
      getOrderFlowAnalysis(symbol),
      getSentimentAnalysis(symbol),
    ]);

    // Compute indicators
    const indicators = computeIndicators(marketData.candles);

    // Get AI analysis only if explicitly requested
    let aiAnalysis = null;
    if (req.query.includeAI === 'true') {
      try {
        // Fetch higher timeframe context for accuracy and STABILITY
        const [context1h, context4h, context1d, liquidity] = await Promise.all([
          fetchMarketData(symbol, '1h'),
          fetchMarketData(symbol, '4h'),
          fetchMarketData(symbol, '1d'),
          fetchLiquidityMetrics(symbol)
        ]);

        const multiTimeframeContext = {
          h1: { indicators: computeIndicators(context1h.candles) },
          h4: { indicators: computeIndicators(context4h.candles) },
          d1: { indicators: computeIndicators(context1d.candles) },
          liquidity
        };

        aiAnalysis = await getAIAnalysis(
          symbol,
          marketData.price,
          indicators,
          orderFlow,
          sentiment,
          multiTimeframeContext
        );
      } catch (aiErr) {
        console.warn('[Controller] AI context/analysis failed, using fallback:', aiErr.message);
        aiAnalysis = await getAIAnalysis(symbol, marketData.price, indicators, orderFlow, sentiment, null);
      }
      
      // AUTO-SAVE REMOVED per user request. Signals are now only saved via explicit manual action.
    }

    // Calculate confluence score
    const score = calculateScore(indicators, orderFlow, sentiment);

    const response = {
      symbol,
      timeframe,
      price: marketData.price,
      ticker: marketData.ticker,
      candles: marketData.candles,
      indicators: {
        rsi: indicators.rsi,
        rsiSignal: indicators.rsiSignal,
        trend: indicators.trend,
        macd: indicators.macd,
        macdData: indicators.macdData,
        emaShort: indicators.emaShort,
        emaLong: indicators.emaLong,
        ema50: indicators.ema50,
        bollingerBands: indicators.bollingerBands,
        bbSignal: indicators.bbSignal,
        volume: indicators.volume,
      },
      orderFlow,
      sentiment,
      aiAnalysis,
      score,
      fetchedAt: new Date().toISOString(),
    };

    res.json({ success: true, data: response });
  } catch (err) {
    console.error('[Controller] getFullAnalysis error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/symbols
 * Returns all available symbols
 */
async function getSymbols(req, res) {
  try {
    const { fetchAllSymbols } = require('../services/marketService');
    const symbols = await fetchAllSymbols();
    res.json({ success: true, data: symbols });
  } catch (err) {
    console.error('[Controller] getSymbols error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/top-movers
 * Returns top 10 symbols by volume
 */
async function getTopMovers(req, res) {
  try {
    const { fetchTopSymbols } = require('../services/marketService');
    const symbols = await fetchTopSymbols(10);
    res.json({ success: true, data: symbols });
  } catch (err) {
    console.error('[Controller] getTopMovers error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/signals
 * Returns all saved signals
 */
async function getSignals(req, res) {
  try {
    const signals = await Signal.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: signals });
  } catch (err) {
    console.error('[Controller] getSignals error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/signals
 * Saves a manual trade signal
 */
async function saveSignal(req, res) {
  try {
    const signalData = req.body;
    const newSignal = new Signal(signalData);
    await newSignal.save();
    console.log(`[Database] Manual signal saved for ${signalData.symbol}`);
    res.json({ success: true, data: newSignal });
  } catch (err) {
    console.error('[Controller] saveSignal error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * DELETE /api/signals/:id
 */
async function deleteSignal(req, res) {
  try {
    await Signal.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[Controller] deleteSignal error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * DELETE /api/signals
 * Clears all saved signals
 */
async function clearAllSignals(req, res) {
  try {
    await Signal.deleteMany({});
    console.log('[Database] All signals cleared');
    res.json({ success: true });
  } catch (err) {
    console.error('[Controller] clearAllSignals error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/signals/:id/re-evaluate
 * Real-time re-evaluation of a saved signal
 */
async function reEvaluateSignal(req, res) {
  try {
    const signalId = req.params.id;
    const signal = await Signal.findById(signalId);
    if (!signal) return res.status(404).json({ success: false, error: 'Signal not found' });

    // Fetch current market data for this symbol
    const [marketData, orderFlow] = await Promise.all([
      fetchMarketData(signal.symbol, '15m'),
      getOrderFlowAnalysis(signal.symbol)
    ]);

    const indicators = computeIndicators(marketData.candles);
    
    // Get AI advice
    const advice = await getReEvaluationAdvice(signal, marketData, indicators, orderFlow);

    res.json({ 
      success: true, 
      data: {
        advice,
        currentMarket: {
          price: marketData.price,
          indicators
        }
      } 
    });
  } catch (err) {
    console.error('[Controller] reEvaluateSignal error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { 
  getMarketData, 
  getOrderFlow, 
  getScore, 
  getFullAnalysis, 
  getSymbols, 
  getTopMovers, 
  getSignals, 
  saveSignal,
  deleteSignal,
  clearAllSignals,
  reEvaluateSignal
};