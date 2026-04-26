const { GoogleGenerativeAI } = require('@google/generative-ai');
const Signal = require('../models/Signal');
const { fetchMarketData } = require('./marketService');
const { computeIndicators } = require('./indicatorService');

class ChatService {
  constructor(io) {
    this.io = io;
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
    });
    this.sessions = new Map(); // Store chat objects per socket.id
    this.setupSocket();
  }

  setupSocket() {
    this.io.on('connection', (socket) => {
      console.log(`[ChatService] New client connected: ${socket.id}`);

      socket.on('chat_message', async (message) => {
        try {
          await this.handleChatMessage(socket, message);
        } catch (error) {
          console.error('[ChatService] Error:', error);
          socket.emit('chat_error', { message: 'Neural link interrupted. Please try again.' });
        }
      });

      socket.on('disconnect', () => {
        this.sessions.delete(socket.id);
        console.log(`[ChatService] Client disconnected: ${socket.id}`);
      });
    });
  }

  async getMarketContext() {
    try {
      // Fetch recent signals
      const recentSignals = await Signal.find().sort({ timestamp: -1 }).limit(10);
      
      // Fetch market data for key symbols
      const [btcData, ethData] = await Promise.all([
        fetchMarketData('BTC/USDT', '1h'),
        fetchMarketData('ETH/USDT', '1h')
      ]).catch(() => [null, null]);

      const marketContext = {};
      if (btcData) {
        marketContext.BTC = {
          price: btcData.price,
          trend: computeIndicators(btcData.candles).trend
        };
      }
      if (ethData) {
        marketContext.ETH = {
          price: ethData.price,
          trend: computeIndicators(ethData.candles).trend
        };
      }

      return {
        recentSignals: recentSignals.map(s => ({
          symbol: s.symbol,
          direction: s.direction,
          recommendation: s.recommendation,
          price: s.price,
          reasoning: s.reasoning,
          timestamp: s.timestamp
        })),
        marketContext
      };
    } catch (err) {
      console.error('[ChatService] Context gathering failed:', err.message);
      return { recentSignals: [], marketContext: {} };
    }
  }

  async handleChatMessage(socket, userMessage) {
    let chat = this.sessions.get(socket.id);
    
    if (!chat) {
      const context = await this.getMarketContext();
      const systemInstruction = `
        You are the "ANTIGRAVITY INTELLIGENCE" Trading Assistant. 
        Your goal is to provide institutional-grade insights on market flows, trade entries, and technical setups.
        
        USER DATA (CURRENT CONTEXT):
        - Recent Saved Signals: ${JSON.stringify(context.recentSignals)}
        - Live Market Pulse (BTC/ETH): ${JSON.stringify(context.marketContext)}
        
        RULES:
        1. PERSPECTIVE: You are an elite risk manager. Be objective, calm, and data-driven.
        2. DATA USAGE: If asked about "my entries" or "recent trades", use the "Recent Saved Signals" provided.
        3. MARKET FLOWS: If asked about the current market, use the "Live Market Pulse".
        4. FORMATTING: Use Markdown. Use bold for key levels and asset names.
        5. LIMITATIONS: If a symbol isn't in your context, explain that you are currently monitoring BTC and ETH for live flows but can analyze any asset based on general TA principles if provided with details.
        6. SHORT & SHARP: Avoid fluff. Get straight to the point.
      `;

      chat = this.model.startChat({
        history: [
          { role: "user", parts: [{ text: systemInstruction }] },
          { role: "model", parts: [{ text: "Neural link established. ANTIGRAVITY Intelligence is online. How can I assist your market operations today?" }] }
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });
      this.sessions.set(socket.id, chat);
    }

    const result = await chat.sendMessageStream(userMessage);
    
    socket.emit('chat_start');
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      socket.emit('chat_chunk', chunkText);
    }
    
    socket.emit('chat_end');
  }
}

module.exports = ChatService;
