require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');
const http = require('http');
const { Server } = require('socket.io');
const ChatService = require('./services/chatService');


// Initialize Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
});

// Initialize Chat Service
new ChatService(io);

const PORT = process.env.PORT;


// Middleware
app.use(cors({
  origin: '*',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}${Object.keys(req.query).length ? ' ' + JSON.stringify(req.query) : ''}`);
  next();
});

// Routes
app.use('/api', apiRoutes);

// Root
app.get('/', (req, res) => {
  res.json({
    name: 'Crypto Market Intelligence API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'GET /api/market?symbol=BTC/USDT&timeframe=5m',
      'GET /api/analysis?symbol=BTC/USDT&timeframe=15m',
      'GET /api/orderflow?symbol=BTC/USDT',
      'GET /api/score?symbol=BTC/USDT',
    ],
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.path} not found` });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ [DEPLOYMENT] TRADEX-AI Backend is successfully running!`);
  console.log(`🌐 Server Address: http://0.0.0.0:${PORT}`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`📊 Socket.io: Connected and Listening`);
  console.log(`📊 Binance Public API: ${process.env.BINANCE_API_KEY ? '✅ Authenticated' : '✅ Public Mode'}`);
  console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? '✅ Connected' : '⚠️  Mock Mode (add GEMINI_API_KEY)'}`);
  console.log(`📰 NewsAPI: ${process.env.NEWS_API_KEY ? '✅ Connected' : '⚠️  Mock Mode (add NEWS_API_KEY)'}\n`);
});


module.exports = app;