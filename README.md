# 🌐 ASTRYX - Autonomous Anomaly Detection System

<div align="center">

![ASTRYX Logo](https://img.shields.io/badge/ASTRYX-Autonomous%20Anomaly%20Detection-blue?style=for-the-badge&logo=satellite)

**Enterprise-grade autonomous system for real-time global anomaly detection and response**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Workflows](#workflows)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

**ASTRYX** (**A**utonomous **S**ystem for **T**hreat **R**ecognition & **Y**ielded e**X**ecution) is a fully autonomous, enterprise-grade system powered by **Google Gemini multimodal AI** and **Opus workflow orchestration** for real-time global anomaly detection and response.

The system continuously monitors multiple data sources worldwide, detects anomalies using AI, verifies findings across sources, and orchestrates responses through configurable workflows.

### Key Capabilities

- 🔍 **Real-time Detection**: Continuous monitoring of global data sources
- 🤖 **AI-Powered Analysis**: Gemini multimodal AI for intelligent anomaly assessment
- ✅ **Cross-Verification**: Multi-source verification for high accuracy
- ⚡ **Autonomous Mode**: Auto-approve high-confidence anomalies
- 🔄 **Workflow Orchestration**: Opus engine for complex response workflows
- 📊 **Live Dashboard**: Real-time visualization with interactive maps

---

## ✨ Features

### Backend Features

| Feature | Description |
|---------|-------------|
| **Autonomous Data Ingestion** | Scheduled collection from USGS, NASA EONET, OpenWeather, GDELT, and more |
| **Multimodal AI Processing** | Google Gemini 1.5 Pro for text, image, and satellite data analysis |
| **Anomaly Detection** | Intelligent detection with confidence scoring and severity classification |
| **Opus Workflow Engine** | Configurable multi-step workflows with human-in-the-loop support |
| **PostgreSQL Database** | Robust data persistence with Sequelize ORM |
| **Real-time WebSocket** | Live updates via Socket.io for instant notifications |
| **RESTful API** | Comprehensive API with authentication and rate limiting |
| **Audit Logging** | Complete audit trail for compliance and debugging |

### Frontend Features

| Feature | Description |
|---------|-------------|
| **Live Dashboard** | Real-time stats, alerts, and anomaly feed |
| **Interactive Map** | Leaflet-powered global map with severity-coded markers |
| **Editable Anomaly Panels** | Inline editing with approve/reject actions |
| **Autonomous Mode Toggle** | One-click toggle for autonomous processing |
| **Workflow Status** | Visual workflow progress tracking |
| **Notification System** | Real-time alerts with toast notifications |
| **Report Generation** | Download detailed anomaly reports |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ASTRYX Architecture                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Frontend   │    │   Backend    │    │  Database    │       │
│  │   (React)    │◄──►│  (Express)   │◄──►│ (PostgreSQL) │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                                    │
│         │            ┌──────┴──────┐                            │
│         │            │             │                            │
│         ▼            ▼             ▼                            │
│  ┌──────────────┐ ┌──────────┐ ┌──────────┐                    │
│  │  WebSocket   │ │  Gemini  │ │   Opus   │                    │
│  │  (Socket.io) │ │    AI    │ │ Workflows│                    │
│  └──────────────┘ └──────────┘ └──────────┘                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Data Sources                          │   │
│  │  USGS │ NASA EONET │ OpenWeather │ GDELT │ TomTom │ ... │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.21
- **Language**: TypeScript 5.5
- **Database**: PostgreSQL 15 with Sequelize ORM
- **Cache**: Redis 7
- **AI**: Google Gemini 1.5 Pro
- **WebSocket**: Socket.io 4.7
- **Logging**: Winston

### Frontend
- **Framework**: React 18.3
- **Language**: TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: TailwindCSS 3.4
- **Maps**: Leaflet 1.9
- **State**: Zustand 4.5
- **HTTP Client**: Axios

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 15
- Redis 7 (optional, for caching)
- Google Gemini API key

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/astryx.git
cd astryx

# Copy environment file
cp backend/.env.example backend/.env

# Edit .env with your API keys
# GEMINI_API_KEY=your-gemini-api-key

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:3000
```

### Option 2: Manual Setup

```bash
# Clone and install backend
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev

# In another terminal, install frontend
cd frontend
npm install
npm run dev
```

### Generate Sample Data

```bash
cd scripts
node generate-sample-data.js
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgres://user:password@localhost:5432/astryx

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# External APIs
OPENWEATHER_API_KEY=your-openweather-key
NEWS_API_KEY=your-newsapi-key
TOMTOM_API_KEY=your-tomtom-key
AIRVISUAL_API_KEY=your-airvisual-key
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All protected endpoints require a Bearer token:
```
Authorization: Bearer <jwt_token>
```

### Endpoints

#### Anomalies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/anomalies` | List all anomalies |
| GET | `/anomalies/:id` | Get anomaly details |
| POST | `/anomalies` | Create new anomaly |
| PATCH | `/anomalies/:id` | Update anomaly |
| POST | `/anomalies/:id/analyze` | Trigger AI analysis |
| POST | `/anomalies/:id/approve` | Approve anomaly |
| POST | `/anomalies/:id/reject` | Reject anomaly |

#### Workflows

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workflows` | List all workflows |
| GET | `/workflows/:id` | Get workflow details |
| POST | `/workflows` | Create workflow |
| POST | `/workflows/:id/execute` | Execute workflow |
| POST | `/workflows/:id/cancel` | Cancel workflow |

#### Data Sources

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/data-sources` | List data sources |
| POST | `/data-sources` | Create data source |
| PATCH | `/data-sources/:id` | Update data source |
| POST | `/data-sources/:id/fetch` | Trigger data fetch |

#### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | System health check |
| GET | `/health/detailed` | Detailed health info |

---

## 🔄 Workflows

ASTRYX uses the Opus workflow engine for processing anomalies:

### Anomaly Processing Workflow

```
┌─────────┐   ┌────────────┐   ┌──────────────┐   ┌──────────┐
│ Intake  │──►│ AI Analysis│──►│ Verification │──►│ Decision │
└─────────┘   └────────────┘   └──────────────┘   └────┬─────┘
                                                       │
                    ┌──────────────────────────────────┼──────────────────┐
                    │                                  │                  │
                    ▼                                  ▼                  ▼
            ┌──────────────┐                   ┌─────────────┐   ┌───────────────┐
            │ Auto Approve │                   │Human Review │   │ Response      │
            │ (95%+ conf.) │                   │  Required   │   │ Coordination  │
            └──────────────┘                   └─────────────┘   └───────────────┘
```

### Workflow States
- `pending` - Created but not started
- `running` - Currently executing
- `awaiting_human` - Waiting for human input
- `completed` - Finished successfully
- `failed` - Encountered an error

---

## 💻 Development

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
astryx/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Entry point
│   │   ├── models/               # Sequelize models
│   │   ├── routes/               # API routes
│   │   ├── services/             # Business logic
│   │   └── middleware/           # Express middleware
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Main app component
│   │   ├── components/           # React components
│   │   ├── pages/                # Page components
│   │   ├── stores/               # Zustand stores
│   │   ├── hooks/                # Custom hooks
│   │   └── services/             # API services
│   ├── Dockerfile
│   └── package.json
├── workflows/                    # Opus workflow definitions
├── scripts/                      # Utility scripts
├── docker-compose.yml
└── nginx.conf
```

---

## 🚢 Deployment

### Docker Compose (Production)

```bash
# Build and start all services
docker-compose -f docker-compose.yml up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=postgres://user:password@db:5432/astryx
REDIS_URL=redis://redis:6379
JWT_SECRET=<strong-random-secret>
GEMINI_API_KEY=<your-api-key>
```

### Health Checks

- **Backend**: `GET /api/health`
- **Frontend**: `GET /health`
- **Nginx**: `GET /health`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Write tests for new features
- Use conventional commits

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for a safer world**

[Report Bug](https://github.com/yourusername/astryx/issues) · [Request Feature](https://github.com/yourusername/astryx/issues)

</div>
