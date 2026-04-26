import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

// Request interceptor
api.interceptors.request.use(config => {
  return config;
});

// Response interceptor
api.interceptors.response.use(
  res => res.data,
  err => {
    const message = err.response?.data?.error || err.message || 'Unknown error';
    console.error('[API Error]', message);
    throw new Error(message);
  }
);

export const fetchMarketData = (symbol = 'BTC/USDT', timeframe = '5m') =>
  api.get('/api/market', { params: { symbol, timeframe } });

export const fetchFullAnalysis = (symbol = 'BTC/USDT', timeframe = '15m', includeAI = false) =>
  api.get('/api/analysis', { params: { symbol, timeframe, includeAI } });

export const fetchOrderFlow = (symbol = 'BTC/USDT') =>
  api.get('/api/orderflow', { params: { symbol } });

export const fetchScore = (symbol = 'BTC/USDT') =>
  api.get('/api/score', { params: { symbol } });

export const fetchSymbols = () => api.get('/api/symbols');

export const fetchTopMovers = () => api.get('/api/top-movers');

export const fetchHealth = () => api.get('/api/health');

export const saveSignal = (signalData) => api.post('/api/signals', signalData);

export const fetchSignals = () => api.get('/api/signals');

export const deleteSignal = (id) => api.delete(`/api/signals/${id}`);

export const clearAllSignals = () => api.delete('/api/signals');

export const reEvaluateSignal = (id) => api.post(`/api/signals/${id}/re-evaluate`);

export default api;