const axios = require('axios');

/**
 * Helper to call Gemini with retry and model fallback
 */
async function callGemini(payload, primaryModel = 'gemini-2.5-flash') {
  const apiKey = process.env.GEMINI_API_KEY;
  const models = [primaryModel];
  
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await axios.post(url, payload, { timeout: 45000 });
      
      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return {
          text: response.data.candidates[0].content.parts[0].text,
          model: model
        };
      }
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      console.warn(`[AI Service] Model ${model} failed with ${status || err.message}. Trying next...`);
      
      // If it's a 400 (Bad Request), trying another model might not help if the payload is wrong,
      // but if it's 503 or 404, the next model might work.
      if (status === 400) {
         console.error('[AI Service] 400 Detail:', JSON.stringify(err.response?.data));
         break; // Don't try other models if payload is fundamentally broken
      }
      continue;
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

async function getAIAnalysis(symbol, currentPrice, indicators, orderFlow, sentiment, mtContext) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return getMockAnalysis(symbol, currentPrice, indicators);
    }

    const systemInstruction = `
      You are a MASTER INSTITUTIONAL FUTURES TRADER with a focus on HIGH-MARGIN, PRACTICAL, and DATA-DRIVEN setups. 
      Your objective is to provide high-probability trading signals utilizing Advanced Liquidity Metrics (Funding Rates, Open Interest, Long/Short Ratios).
      
      LIQUIDITY & FUTURES RULES:
      1. FUNDING RATES: Pay extreme attention to funding. If Funding is highly positive (>0.05%), be cautious of Longs as a "long unwind" or "long squeeze" is likely. If Funding is highly negative, look for "short squeeze" opportunities.
      2. OPEN INTEREST (OI): Increasing OI with increasing price confirms a strong Bullish trend. Increasing OI with decreasing price confirms a strong Bearish trend. Decreasing OI suggests a trend reversal or profit-taking.
      3. LONG/SHORT RATIO: Use this to identify retail vs institutional positioning. If retail is heavily long (high ratio) while price is at resistance, look for a reversal.
      4. PRACTICAL STOP LOSS: Use 2.5x to 3.0x ATR. Always place SL beyond structural pivots and away from "liquidity wicks".
      
      PRACTICAL RISK & REWARD RULES:
      1. MINIMUM TARGETS: Aim for at least 4% to 5% price move for TP1 (40%+ PnL at 10x).
      2. RISK:REWARD: Maintain a minimum R:R ratio of 1:2.5 or 1:3.
      
      SELECTIVITY RULES:
      1. NO JUNK SIGNALS: Focus on the "True Trend" across Daily and 4H timeframes.
      2. CONFLUENCE: Requires alignment across timeframes AND Futures Liquidity metrics.
      
      PRECISION RULES:
      1. VOLATILITY ADAPTATION: Use ATR with practical multipliers. 
      2. NO PERCENTAGES: ALWAYS provide absolute price values.
    `;

    const userPrompt = `
      Analyze ${symbol} at current price ${currentPrice}.
      
      MARKET CONTEXT:
      Local Timeframe (15m): ${JSON.stringify(indicators)}
      1H Macro: ${JSON.stringify(mtContext?.h1?.indicators)}
      4H Macro: ${JSON.stringify(mtContext?.h4?.indicators)}
      DAILY ANCHOR (Absolute Truth): ${JSON.stringify(mtContext?.d1?.indicators)}
      Liquidity Metrics (Futures): ${JSON.stringify(mtContext?.liquidity)}
      Order Flow: ${JSON.stringify(orderFlow?.combined)}
      Sentiment: ${JSON.stringify(sentiment)}
      
      INSTRUCTIONS FOR TRADE SETUP:
      - recommendation: Use "STRONG BUY" or "STRONG SELL" if at least 3 timeframes align and Order Flow is supportive. Use "LIMIT ORDER" to catch pullbacks into structural support/resistance.
      - reasoning: Explain the confluence across timeframes and why the entry zone is high-probability.
      - entryPoint/stopLoss/takeProfit: Provide precise PRICE values based on ATR and SR.
      
      Provide a JSON output with the exact following structure:
      {
        "summary": "Professional market summary.",
        "direction": "bullish" | "bearish" | "neutral",
        "risk": "Low" | "Medium" | "High",
        "confidence": "Low" | "Medium" | "High",
        "recommendation": "STRONG BUY" | "STRONG SELL" | "STAY PATIENT" | "LIMIT ORDER @ [PRICE]",
        "reasoning": "Institutional reasoning including ATR and SR levels used. If STAY PATIENT, explain the missing confluence.",
        "stabilityScore": number,
        "riskReason": "Specific risk factor",
        "keyLevels": { "support": "PRICE", "resistance": "PRICE" },
        "tradeSetup": {
          "tradeType": "string",
          "entryPoint": "PRICE",
          "stopLoss": "PRICE",
          "takeProfit1": "PRICE",
          "takeProfit2": "PRICE",
          "takeProfit3": "PRICE"
        },
        "timeHorizon": "string"
      }
    `;

    const payload = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    };

    const result = await callGemini(payload, 'gemini-2.5-flash');
    const parsed = JSON.parse(result.text);
    
    return {
      ...parsed,
      model: result.model
    };

  } catch (error) {
    console.error('[AI Service] Error generating analysis:', error.message);
    return getMockAnalysis(symbol, currentPrice, indicators);
  }
}

async function getReEvaluationAdvice(originalSignal, currentMarketData, indicators, orderFlow) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not found');

    const systemInstruction = `
      You are an INSTITUTIONAL RISK MANAGER and POSITION MANAGER. 
      Your goal is to help a trader manage an EXISTING saved trade signal. 
      You must provide PRECISE advice on long-term holding and Stop Loss (SL) adjustments.
      Return JSON ONLY.
    `;

    const userPrompt = `
      ORIGINAL SIGNAL:
      - Asset: ${originalSignal.symbol}
      - Direction: ${originalSignal.direction}
      - Type/Rec: ${originalSignal.recommendation}
      - Saved Price (Entry Zone): ${originalSignal.price}
      - Initial SL: ${originalSignal.tradeSetup?.stopLoss}
      - Initial TP: ${originalSignal.tradeSetup?.takeProfit1}

      CURRENT MARKET STATE:
      - Current Price: ${currentMarketData.price}
      - Trend (Current): ${indicators.trend}
      - RSI/MACD State: ${indicators.rsiSignal} / ${indicators.macdData?.histogram > 0 ? 'Bullish Hist' : 'Bearish Hist'}
      - Order Flow: ${JSON.stringify(orderFlow?.combined)}

      YOUR TASK:
      Analyze if the setup is still valid.
      
      TRADER COOPERATION RULES:
      1. PENDING ORDERS: If the original recommendation was a 'LIMIT ORDER' and the price has NOT triggered the entry yet, focus on whether the entry zone is still attractive.
      2. PENDING ACTION: For untriggered limit orders, use actions like 'WAIT FOR ENTRY', 'RE-ADJUST LIMIT', or 'CANCEL LIMIT'. Do NOT suggest moving SL or trailing if the trade is not yet live.
      3. LIVE TRADES: If the trade is live, provide precise SL management (e.g., 'MOVE SL TO BREAKEVEN', 'TRAIL SL TO [PRICE]').
      4. STATUS: Is the setup still 'valid', 'warning' (risky), or 'invalid'?
      5. ADVICE: Provide reasoning from a professional trader's perspective.

      Return JSON:
      {
        "status": "valid" | "warning" | "invalid",
        "action": "string",
        "advice": "string",
        "currentPnlEstimate": "string (e.g. 'Pending' or '+2.5%')",
        "riskAdjustment": "string",
        "stopLossManagement": "string",
        "holdingPerspective": "string"
      }
    `;

    const payload = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json"
      }
    };

    const result = await callGemini(payload, 'gemini-2.5-flash');
    return JSON.parse(result.text);

  } catch (err) {
    console.error('[AI Service] Re-evaluation error:', err.message);
    return {
      status: 'warning',
      action: 'WAIT AND WATCH',
      advice: 'Neural link offline. Monitor price action manually.',
      currentPnlEstimate: 'Unknown',
      riskAdjustment: 'Maintain original SL',
      stopLossManagement: 'No change',
      holdingPerspective: 'Neutral'
    };
  }
}

function getMockAnalysis(symbol, currentPrice, indicators) {
  // 3/4 Confluence rule: Trend + (RSI or MACD)
  const isBullish = (indicators?.trend === 'uptrend' && (indicators?.rsi > 45 || indicators?.macd === 'bullish'));
  const isBearish = (indicators?.trend === 'downtrend' && (indicators?.rsi < 55 || indicators?.macd === 'bearish'));
  
  const direction = isBullish ? 'bullish' : isBearish ? 'bearish' : 'neutral';
  const atr = indicators?.atr || (currentPrice * 0.01); // Fallback to 1% if ATR missing
  
  let recommendation = 'STAY PATIENT';
  let reasoning = 'Market setup is currently fragmented. Awaiting higher-conviction alignment across macro timeframes.';
  
  if (isBullish) {
    recommendation = 'STRONG BUY';
    reasoning = 'High-probability bullish confluence: Trend alignment supported by positive momentum indicators.';
  } else if (isBearish) {
    recommendation = 'STRONG SELL';
    reasoning = 'High-conviction bearish setup: Macro trend weakness confirmed by momentum breakdown.';
  }

  // Precision helper for low-value assets
  const formatPrice = (val) => {
    if (!val) return 'N/A';
    const num = parseFloat(val);
    if (num < 0.0001) return num.toFixed(8);
    if (num < 0.01) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    if (num < 100) return num.toFixed(3);
    return num.toFixed(2);
  };

  // Institutional-style calculation for HIGH MARGINS & PRACTICAL SL
  // SL = Entry +/- 2.5x ATR (Practical breathing room)
  // TP1 = Entry +/- MAX(4% price move, 5.0x ATR) -> Aiming for 40%+ PnL at 10x
  const entry = currentPrice || 0;
  const slOffset = atr * 2.5;
  const minTp1Move = entry * 0.04; // 4% move
  const minTp2Move = entry * 0.08; // 8% move
  const minTp3Move = entry * 0.15; // 15% move

  const tp1Offset = Math.max(minTp1Move, atr * 5.0);
  const tp2Offset = Math.max(minTp2Move, atr * 8.0);
  const tp3Offset = Math.max(minTp3Move, atr * 15.0);

  return {
    model: 'mock',
    summary: `Market structure for ${symbol} shows a ${direction} bias with volatility (ATR) currently at ${formatPrice(atr)}.`,
    direction: direction,
    risk: 'Medium',
    confidence: 'Medium',
    recommendation: recommendation,
    reasoning: `${reasoning} Using volatility-adjusted targets. SL set at 2.0x ATR (${formatPrice(slOffset)}). Support at ${formatPrice(indicators?.support)}, Resistance at ${formatPrice(indicators?.resistance)}.`,
    stabilityScore: 82,
    riskReason: 'Volatility expansion pending',
    keyLevels: {
      support: formatPrice(indicators?.support || entry - tp2Offset),
      resistance: formatPrice(indicators?.resistance || entry + tp2Offset)
    },
    tradeSetup: {
      tradeType: 'Intraday Setup',
      entryPoint: formatPrice(entry),
      stopLoss: formatPrice(isBullish ? entry - slOffset : entry + slOffset),
      takeProfit1: formatPrice(isBullish ? entry + tp1Offset : entry - tp1Offset),
      takeProfit2: formatPrice(isBullish ? entry + tp2Offset : entry - tp2Offset),
      takeProfit3: formatPrice(isBullish ? entry + tp3Offset : entry - tp3Offset),
    },
    timeHorizon: 'Next 12-24 Hours'
  };
}

module.exports = {
  getAIAnalysis,
  getReEvaluationAdvice
};
