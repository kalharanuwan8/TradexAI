const ti = require('technicalindicators');

/**
 * Calculate RSI (14-period)
 */
function calcRSI(closes, period = 14) {
  const result = ti.RSI.calculate({ values: closes, period });
  return result.length ? parseFloat(result[result.length - 1].toFixed(2)) : null;
}

/**
 * Calculate EMA
 */
function calcEMA(closes, period) {
  const result = ti.EMA.calculate({ values: closes, period });
  return result.length ? parseFloat(result[result.length - 1].toFixed(4)) : null;
}

/**
 * Calculate MACD
 */
function calcMACD(closes) {
  const result = ti.MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  if (!result.length) return null;
  const last = result[result.length - 1];
  return {
    macd: parseFloat((last.MACD || 0).toFixed(4)),
    signal: parseFloat((last.signal || 0).toFixed(4)),
    histogram: parseFloat((last.histogram || 0).toFixed(4)),
  };
}

/**
 * Calculate Bollinger Bands
 */
function calcBollingerBands(closes, period = 20) {
  const result = ti.BollingerBands.calculate({
    values: closes,
    period,
    stdDev: 2,
  });
  if (!result.length) return null;
  const last = result[result.length - 1];
  return {
    upper: parseFloat(last.upper.toFixed(4)),
    middle: parseFloat(last.middle.toFixed(4)),
    lower: parseFloat(last.lower.toFixed(4)),
  };
}

/**
 * Detect volume trend (compare last 5 candles avg vs prior 5)
 */
function detectVolumeTrend(volumes) {
  if (volumes.length < 10) return 'neutral';
  const recent = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const prior = volumes.slice(-10, -5).reduce((a, b) => a + b, 0) / 5;
  return recent > prior * 1.1 ? 'increasing' : recent < prior * 0.9 ? 'decreasing' : 'neutral';
}

/**
 * Detect price trend using EMA crossover
 */
function detectTrend(emaShort, emaLong, closes) {
  if (!emaShort || !emaLong) return 'neutral';
  const lastPrice = closes[closes.length - 1];
  if (emaShort > emaLong && lastPrice > emaShort) return 'uptrend';
  if (emaShort < emaLong && lastPrice < emaShort) return 'downtrend';
  return 'sideways';
}

/**
 * Calculate ATR (Average True Range)
 */
function calcATR(highs, lows, closes, period = 14) {
  const result = ti.ATR.calculate({ high: highs, low: lows, close: closes, period });
  return result.length ? parseFloat(result[result.length - 1].toFixed(4)) : null;
}

/**
 * Find recent Support and Resistance based on local extrema
 */
function findSupportResistance(highs, lows, period = 20) {
  const recentHighs = highs.slice(-period);
  const recentLows = lows.slice(-period);
  
  return {
    resistance: parseFloat(Math.max(...recentHighs).toFixed(4)),
    support: parseFloat(Math.min(...recentLows).toFixed(4))
  };
}

/**
 * Compute all indicators from candle data
 */
function computeIndicators(candles) {
  if (!candles || candles.length < 30) {
    throw new Error('Insufficient candle data for indicator computation');
  }

  const closes = candles.map(c => c.close);
  const volumes = candles.map(c => c.volume);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);

  const rsi = calcRSI(closes);
  const emaShort = calcEMA(closes, 9);
  const emaLong = calcEMA(closes, 21);
  const ema50 = calcEMA(closes, 50);
  const macdData = calcMACD(closes);
  const bb = calcBollingerBands(closes);
  const atr = calcATR(highs, lows, closes);
  const sr = findSupportResistance(highs, lows);
  const volumeTrend = detectVolumeTrend(volumes);
  const trend = detectTrend(emaShort, emaLong, closes);

  const currentPrice = closes[closes.length - 1];
  const macdSignal = macdData
    ? macdData.histogram > 0
      ? 'bullish'
      : 'bearish'
    : 'neutral';

  // RSI signals
  let rsiSignal = 'neutral';
  if (rsi < 30) rsiSignal = 'oversold';
  else if (rsi > 70) rsiSignal = 'overbought';

  // Price vs Bollinger Bands
  let bbSignal = 'neutral';
  if (bb) {
    if (currentPrice <= bb.lower) bbSignal = 'oversold';
    else if (currentPrice >= bb.upper) bbSignal = 'overbought';
  }

  return {
    rsi,
    rsiSignal,
    trend,
    macd: macdSignal,
    macdData,
    emaShort,
    emaLong,
    ema50,
    bollingerBands: bb,
    bbSignal,
    atr,
    support: sr.support,
    resistance: sr.resistance,
    volume: volumeTrend,
    currentPrice,
    // Pass full series for chart
    emaShortSeries: ti.EMA.calculate({ values: closes, period: 9 }),
    emaLongSeries: ti.EMA.calculate({ values: closes, period: 21 }),
  };
}

module.exports = { computeIndicators };