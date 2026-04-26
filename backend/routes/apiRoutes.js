const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/analysisController');

// GET /api/market?symbol=BTC/USDT&timeframe=5m
router.get('/market', getMarketData);

// GET /api/orderflow?symbol=BTC/USDT
router.get('/orderflow', getOrderFlow);

// GET /api/score?symbol=BTC/USDT
router.get('/score', getScore);

// GET /api/analysis?symbol=BTC/USDT&timeframe=15m
router.get('/analysis', getFullAnalysis);

// GET /api/symbols
router.get('/symbols', getSymbols);

// GET /api/top-movers
router.get('/top-movers', getTopMovers);

// GET /api/signals
router.get('/signals', getSignals);

// POST /api/signals
router.post('/signals', saveSignal);

// DELETE /api/signals (Clear All)
router.delete('/signals', clearAllSignals);

// DELETE /api/signals/:id (Delete Single)
router.delete('/signals/:id', deleteSignal);

// POST /api/signals/:id/re-evaluate
router.post('/signals/:id/re-evaluate', reEvaluateSignal);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasGemini: !!process.env.GEMINI_API_KEY,
      hasNewsApi: !!process.env.NEWS_API_KEY,
      hasBinanceKey: !!process.env.BINANCE_API_KEY,
      hasMongo: !!process.env.MONGO_URI,
    },
  });
});

module.exports = router;