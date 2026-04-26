import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
  api.get('/market', { params: { symbol, timeframe } });

export const fetchFullAnalysis = (symbol = 'BTC/USDT', timeframe = '15m', includeAI = false) =>
  api.get('/analysis', { params: { symbol, timeframe, includeAI } });

export const fetchOrderFlow = (symbol = 'BTC/USDT') =>
  api.get('/orderflow', { params: { symbol } });

export const fetchScore = (symbol = 'BTC/USDT') =>
  api.get('/score', { params: { symbol } });

export const fetchSymbols = () => api.get('/symbols');

export const fetchTopMovers = () => api.get('/top-movers');

export const fetchHealth = () => api.get('/health');

export const saveSignal = (signalData) => api.post('/signals', signalData);

export const fetchSignals = () => api.get('/signals');

export const deleteSignal = (id) => api.delete(`/signals/${id}`);

export const clearAllSignals = () => api.delete('/signals');

export const reEvaluateSignal = (id) => api.post(`/signals/${id}/re-evaluate`);

export default api;