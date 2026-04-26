/**
 * Multi-Signal Confluence Scoring Engine
 * 
 * Combines technical indicators, order flow, and sentiment
 * into a single composite score with signal classification.
 */

const SCORE_WEIGHTS = {
  // RSI signals
  RSI_OVERSOLD: { score: +2, label: 'RSI Oversold (Bullish)' },
  RSI_OVERBOUGHT: { score: -2, label: 'RSI Overbought (Bearish)' },
  RSI_BULLISH_ZONE: { score: +1, label: 'RSI Bullish Zone (40-60)' },

  // Trend signals
  UPTREND: { score: +2, label: 'EMA Uptrend' },
  DOWNTREND: { score: -2, label: 'EMA Downtrend' },
  SIDEWAYS: { score: 0, label: 'Sideways Trend' },

  // MACD signals
  MACD_BULLISH: { score: +1, label: 'MACD Bullish Crossover' },
  MACD_BEARISH: { score: -1, label: 'MACD Bearish Crossover' },

  // Volume
  VOLUME_INCREASING: { score: +1, label: 'Increasing Volume' },
  VOLUME_DECREASING: { score: -1, label: 'Decreasing Volume' },

  // Bollinger Bands
  BB_OVERSOLD: { score: +1, label: 'Price at Lower Bollinger Band' },
  BB_OVERBOUGHT: { score: -1, label: 'Price at Upper Bollinger Band' },

  // Order flow (highest weight)
  ORDER_FLOW_STRONG_BULLISH: { score: +3, label: 'Strong Bullish Order Flow' },
  ORDER_FLOW_MODERATE_BULLISH: { score: +2, label: 'Moderate Bullish Order Flow' },
  ORDER_FLOW_STRONG_BEARISH: { score: -3, label: 'Strong Bearish Order Flow' },
  ORDER_FLOW_MODERATE_BEARISH: { score: -2, label: 'Moderate Bearish Order Flow' },

  // Sentiment
  SENTIMENT_POSITIVE: { score: +2, label: 'Positive News Sentiment' },
  SENTIMENT_NEGATIVE: { score: -2, label: 'Negative News Sentiment' },

  // Trade delta
  TRADE_DELTA_BULLISH: { score: +1, label: 'Positive Trade Delta' },
  TRADE_DELTA_BEARISH: { score: -1, label: 'Negative Trade Delta' },
};

/**
 * Calculate composite score from all signals
 */
function calculateScore(indicators, orderFlow, sentiment) {
  const signals = [];
  let totalScore = 0;

  // --- RSI ---
  if (indicators?.rsi !== null && indicators?.rsi !== undefined) {
    if (indicators.rsi < 30) {
      signals.push({ ...SCORE_WEIGHTS.RSI_OVERSOLD, value: indicators.rsi });
      totalScore += SCORE_WEIGHTS.RSI_OVERSOLD.score;
    } else if (indicators.rsi > 70) {
      signals.push({ ...SCORE_WEIGHTS.RSI_OVERBOUGHT, value: indicators.rsi });
      totalScore += SCORE_WEIGHTS.RSI_OVERBOUGHT.score;
    } else if (indicators.rsi >= 40 && indicators.rsi <= 60) {
      signals.push({ ...SCORE_WEIGHTS.RSI_BULLISH_ZONE, value: indicators.rsi });
      totalScore += SCORE_WEIGHTS.RSI_BULLISH_ZONE.score;
    }
  }

  // --- Trend ---
  if (indicators?.trend === 'uptrend') {
    signals.push(SCORE_WEIGHTS.UPTREND);
    totalScore += SCORE_WEIGHTS.UPTREND.score;
  } else if (indicators?.trend === 'downtrend') {
    signals.push(SCORE_WEIGHTS.DOWNTREND);
    totalScore += SCORE_WEIGHTS.DOWNTREND.score;
  }

  // --- MACD ---
  if (indicators?.macd === 'bullish') {
    signals.push(SCORE_WEIGHTS.MACD_BULLISH);
    totalScore += SCORE_WEIGHTS.MACD_BULLISH.score;
  } else if (indicators?.macd === 'bearish') {
    signals.push(SCORE_WEIGHTS.MACD_BEARISH);
    totalScore += SCORE_WEIGHTS.MACD_BEARISH.score;
  }

  // --- Volume ---
  if (indicators?.volume === 'increasing') {
    signals.push(SCORE_WEIGHTS.VOLUME_INCREASING);
    totalScore += SCORE_WEIGHTS.VOLUME_INCREASING.score;
  } else if (indicators?.volume === 'decreasing') {
    signals.push(SCORE_WEIGHTS.VOLUME_DECREASING);
    totalScore += SCORE_WEIGHTS.VOLUME_DECREASING.score;
  }

  // --- Bollinger Bands ---
  if (indicators?.bbSignal === 'oversold') {
    signals.push(SCORE_WEIGHTS.BB_OVERSOLD);
    totalScore += SCORE_WEIGHTS.BB_OVERSOLD.score;
  } else if (indicators?.bbSignal === 'overbought') {
    signals.push(SCORE_WEIGHTS.BB_OVERBOUGHT);
    totalScore += SCORE_WEIGHTS.BB_OVERBOUGHT.score;
  }

  // --- Order Flow (highest weight signals) ---
  const flowSignal = orderFlow?.combined?.orderFlowSignal;
  if (flowSignal === 'strong_bullish') {
    signals.push(SCORE_WEIGHTS.ORDER_FLOW_STRONG_BULLISH);
    totalScore += SCORE_WEIGHTS.ORDER_FLOW_STRONG_BULLISH.score;
  } else if (flowSignal === 'moderate_bullish') {
    signals.push(SCORE_WEIGHTS.ORDER_FLOW_MODERATE_BULLISH);
    totalScore += SCORE_WEIGHTS.ORDER_FLOW_MODERATE_BULLISH.score;
  } else if (flowSignal === 'strong_bearish') {
    signals.push(SCORE_WEIGHTS.ORDER_FLOW_STRONG_BEARISH);
    totalScore += SCORE_WEIGHTS.ORDER_FLOW_STRONG_BEARISH.score;
  } else if (flowSignal === 'moderate_bearish') {
    signals.push(SCORE_WEIGHTS.ORDER_FLOW_MODERATE_BEARISH);
    totalScore += SCORE_WEIGHTS.ORDER_FLOW_MODERATE_BEARISH.score;
  }

  // --- Trade Delta ---
  const deltaPct = orderFlow?.combined?.deltaPct;
  if (deltaPct !== undefined) {
    if (deltaPct > 5) {
      signals.push({ ...SCORE_WEIGHTS.TRADE_DELTA_BULLISH, value: `${deltaPct}%` });
      totalScore += SCORE_WEIGHTS.TRADE_DELTA_BULLISH.score;
    } else if (deltaPct < -5) {
      signals.push({ ...SCORE_WEIGHTS.TRADE_DELTA_BEARISH, value: `${deltaPct}%` });
      totalScore += SCORE_WEIGHTS.TRADE_DELTA_BEARISH.score;
    }
  }

  // --- Sentiment ---
  if (sentiment?.sentiment === 'positive') {
    signals.push(SCORE_WEIGHTS.SENTIMENT_POSITIVE);
    totalScore += SCORE_WEIGHTS.SENTIMENT_POSITIVE.score;
  } else if (sentiment?.sentiment === 'negative') {
    signals.push(SCORE_WEIGHTS.SENTIMENT_NEGATIVE);
    totalScore += SCORE_WEIGHTS.SENTIMENT_NEGATIVE.score;
  }

  // --- Normalize score to -10 to +10 range ---
  const maxPossibleScore = 16; // theoretical max
  const normalizedScore = parseFloat(
    Math.max(-10, Math.min(10, (totalScore / maxPossibleScore) * 10)).toFixed(1)
  );

  // --- Classify signal ---
  let signal = 'Neutral';
  let signalStrength = 'Weak';

  if (totalScore >= 6) {
    signal = 'Strong Bullish';
    signalStrength = 'Strong';
  } else if (totalScore >= 3) {
    signal = 'Bullish';
    signalStrength = 'Moderate';
  } else if (totalScore <= -6) {
    signal = 'Strong Bearish';
    signalStrength = 'Strong';
  } else if (totalScore <= -3) {
    signal = 'Bearish';
    signalStrength = 'Moderate';
  }

  // --- Confidence based on signal agreement ---
  const bullishSignals = signals.filter(s => s.score > 0).length;
  const bearishSignals = signals.filter(s => s.score < 0).length;
  const totalSignals = signals.length;
  const agreementRatio = totalSignals > 0
    ? Math.max(bullishSignals, bearishSignals) / totalSignals
    : 0;

  let confidenceLevel = 'Low';
  if (agreementRatio >= 0.75) confidenceLevel = 'High';
  else if (agreementRatio >= 0.5) confidenceLevel = 'Medium';

  return {
    score: totalScore,
    normalizedScore,
    signal,
    signalStrength,
    confidenceLevel,
    agreementRatio: parseFloat(agreementRatio.toFixed(2)),
    bullishSignals,
    bearishSignals,
    totalSignals,
    signals,
    scoredAt: new Date().toISOString(),
  };
}

module.exports = { calculateScore };