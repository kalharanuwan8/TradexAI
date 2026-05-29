# TradexAI

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#cicd-pipeline)
[![JavaScript](https://img.shields.io/badge/javascript-95%25-yellow.svg)](https://github.com/kalharanuwan8/TradexAI)
[![Docker Support](https://img.shields.io/badge/docker-supported-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](#license)

TradexAI is a full-stack web application built to assist cryptocurrency traders. It provides [**add your core feature summary here** — e.g. real-time market insights, AI-powered trade analysis, portfolio tracking, etc.].

> **Note to author:** Fill in the feature description above and any `[placeholder]` sections below with your actual implementation details.

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

> Replace this section with your actual features. Some examples based on the project's scope:

- **AI-Powered Analysis** — [Describe what the AI does, e.g. sentiment analysis, price prediction, trade signals]
- **Real-Time Data** — [e.g. Live crypto price feeds via WebSocket or REST polling]
- **Portfolio Tracking** — [e.g. Track holdings, PnL, and asset allocation]
- **[Feature 4]** — [Description]
- **[Feature 5]** — [Description]

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, [add libraries — e.g. Tailwind CSS, Axios, Recharts] |
| **Backend** | Node.js, Express, [add — e.g. Mongoose, OpenAI SDK, JWT] |
| **Database** | [e.g. MongoDB Atlas / PostgreSQL] |
| **DevOps** | Docker, Docker Compose, Nginx, GitHub Actions |

---

## Project Structure

```
TradexAI/
├── .github/workflows/
│   └── deploy.yml          # CI/CD deployment pipeline
├── backend/                # Node.js + Express API server (port 3001)
│   ├── [your folders]
│   └── Dockerfile
├── frontend/               # React frontend served via Nginx (port 8080)
│   ├── [your folders]
│   └── Dockerfile
├── scratch/                # Prototypes and experimental scripts
├── docker-compose.yml      # Container orchestration
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- Docker & Docker Compose (recommended)
- [Any API keys needed — e.g. CoinGecko, OpenAI, Binance]

---

### Option A — Docker Compose (Recommended)

1. Create `backend/.env` using the template below.
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

# Auth
JWT_SECRET=your_jwt_secret

# AI / External APIs
GEMINI_API_KEY=your_key        # or whichever AI provider you use
CRYPTO_API_KEY=your_key        # e.g. CoinGecko, Binance, etc.

# [Add any other environment variables your app needs]
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
# [Add any other frontend environment variables]
```

---

## CI/CD Pipeline

Pushing to the `main` branch triggers an automated GitHub Actions deployment:

1. GitHub Actions connects to the production server via SSH.
2. Pulls the latest code from the repository.
3. Runs `docker-compose up -d --build` to rebuild changed containers.
   - The frontend is compiled and served via Nginx Alpine.
   - The Express API container is restarted with the latest build.

> Note: This single-server setup involves a brief restart window during deploys. A load balancer with rolling updates would be needed for true zero-downtime deployments.

---

## Known Limitations

- **Single-node deployment:** No horizontal scaling or automatic failover configured.
- **[Add any other known limitations specific to your app]**

---

## License

MIT
