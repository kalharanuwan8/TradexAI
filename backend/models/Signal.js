const mongoose = require('mongoose');

const SignalSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  price: { type: Number, required: true },
  direction: { type: String, required: true },
  recommendation: { type: String, required: true },
  confidence: { type: String },
  risk: { type: String },
  stabilityScore: { type: Number },
  summary: { type: String },
  reasoning: { type: String },
  tradeSetup: {
    tradeType: String,
    entryPoint: String,
    stopLoss: String,
    takeProfit1: String,
    takeProfit2: String,
    takeProfit3: String
  },
  timeframe: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Signal', SignalSchema);
