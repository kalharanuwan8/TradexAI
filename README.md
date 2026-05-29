# TradexAI

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#cicd-pipeline)
[![JavaScript](https://img.shields.io/badge/javascript-95%25-yellow.svg)](https://github.com/kalharanuwan8/TradexAI)
[![Docker Support](https://img.shields.io/badge/docker-supported-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](#license)

TradexAI is an institutional-grade, full-stack market intelligence dashboard built to assist cryptocurrency traders. By combining raw market feeds, order flow metrics, and technical indicators with Gemini's reasoning capabilities, it provides traders with multi-timeframe confluence scoring, real-time AI trade insights, and automated position management tools.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [CI/CD Pipeline](#cicd-pipeline)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Features

- **Gemini AI-Powered Market Intelligence** — Integrates with `gemini-2.5-flash` to evaluate local & macro structures (15m, 1h, 4h, Daily), order book flow, and sentiment to formulate volatility-adapted trade setups (using absolute prices rather than percentages, with ATR-based Stop Loss & Take Profit targets).
- **Real-Time Market Feeds & Confluence Scoring** — Uses the `ccxt` library to pull live candlestick and ticker data from Binance. Computes technical indicators (RSI, MACD, EMAs, Bollinger Bands) and derives a custom Normalized Confluence Score out of 100 representing market consensus.
- **Order Flow & Liquidity Monitoring** — Computes real-time order book imbalances, spreads, trade volume distribution, and advanced futures metrics including Funding Rates, Open Interest, and Long/Short ratios.
- **Institutional Signal Log & Active Management** — Enables traders to save high-probability trade setups directly to MongoDB. Provides a real-time re-evaluation endpoint where Gemini analyzes current price actions against initial entry/exit targets to recommend trailing SL adjustments, breakeven moves, or order cancellations.
- **Socket.io Interactive AI ChatBot** — Features a real-time conversational interface where traders can discuss active setups and live market pulses. The chatbot retrieves current DB signal records and key BTC/ETH metrics as live context.
- **Dual Chart Visualization** — Offers a toggle between a custom React Chart.js financial candlestick chart (rendering local EMAs and Bollinger Bands) and a high-performance integrated TradingView Widget.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, Chart.js (`react-chartjs-2`, financial candlestick charts), Lucide React, Framer Motion, Socket.io-client, React Markdown |
| **Backend** | Node.js, Express, Socket.io, `@google/generative-ai` (Gemini SDK), `ccxt` (Binance integration), `technicalindicators`, Mongoose, Axios, Cors, Dotenv |
| **Database** | MongoDB Atlas / local MongoDB instance |
| **DevOps** | Docker, Docker Compose, Nginx (Alpine), GitHub Actions, Azure Container Apps |

---

## Project Structure

```
TradexAI/
├── .github/workflows/
│   └── deploy.yml          # CI/CD deployment pipeline to Azure Container Apps
├── backend/                # Node.js + Express API server (port 3001)
│   ├── config/             # Database connection setup (db.js)
│   ├── controllers/        # Express request handlers (analysis, signals, evaluation)
│   ├── models/             # Mongoose schemas (Signal.js)
│   ├── routes/             # Express API endpoints (apiRoutes.js)
│   ├── services/           # Services (AI, CCXT market data, indicators, orderflow, chatbot, etc.)
│   ├── server.js           # Server startup and socket initialization
│   ├── .env                # Backend local environment variables
│   └── Dockerfile          # Backend container image setup
├── frontend/               # React + Vite frontend served via Nginx (port 8080)
│   ├── components/         # Modular dashboard visual components (Charts, Panels, Chatbot)
│   ├── hooks/              # Custom React hooks (useDashboard.js)
│   ├── services/           # Frontend API and socket communication logic
│   ├── src/                # App entrypoint (App.jsx, index.css)
│   ├── nginx.conf          # Nginx routing configuration
│   └── Dockerfile          # Multi-stage frontend container build
├── scratch/                # Prototypes and experimental scripts
├── docker-compose.yml      # Container orchestration
└── README.md               # Project documentation
```

---

## Getting Started

### Prerequisites

- Node.js v20+
- Docker & Docker Compose (recommended)
- MongoDB Database URI (Atlas or local instance)
- Google Gemini API Key (`GEMINI_API_KEY` & `CHAT_API_KEY`)
- NewsAPI Key (`NEWS_API_KEY` - optional)

---

### Option A — Docker Compose (Recommended)

1. Create a `backend/.env` file in the `backend/` directory (see configuration below).
2. Start all containers:
   ```bash
   docker-compose up -d --build
   ```
3. Open the app:
   - Frontend: `http://localhost:8080`
   - Backend API: `http://localhost:3001`

---

### Option B — Manual Local Setup

#### Backend

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env`:

```env
PORT=3001

# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/tradexai

# AI / External APIs
GEMINI_API_KEY=your_gemini_api_key
CHAT_API_KEY=your_gemini_api_key_for_chatbot
NEWS_API_KEY=your_news_api_key
```

> ⚠️ Never commit `.env` to version control. Add it to `.gitignore`.

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

---

## CI/CD Pipeline

Pushing to the `main` branch triggers an automated GitHub Actions deployment workflow:

1. **Docker Build & Push**: GitHub Actions logs into Docker Hub using repository secrets, builds the backend and frontend Docker images, and pushes them to Docker Hub with the Git commit SHA as tag.
2. **Azure Credentials Authentication**: Signs into Microsoft Azure using service principal credentials (`AZURE_CREDENTIALS`).
3. **Azure Container Apps Deployment**: Automatically updates the running container instances (`tradex-backend` and `tradex-frontend`) under the resource group `kalhara` with the newly pushed Docker images.

---

## Known Limitations

- **Exchange API Rate Limits**: Public API access to Binance via `ccxt` may experience rate limits if volume tracking or ticker calls are requested too frequently.
- **State Persistence**: The WebSocket sessions for the chat assistant are stored in-memory (`Map` in the Express server), meaning server restarts clear active chat histories.
- **Database Dependency**: The Signal Log requires a connection to MongoDB; without a valid DB connection, signal features will fail.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
