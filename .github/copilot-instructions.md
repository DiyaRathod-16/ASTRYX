# ASTRYX - Autonomous System for Threat Recognition & Yielded eXecution

## Project Overview
ASTRYX (Autonomous System for Threat Recognition & Yielded eXecution) is a fully autonomous, enterprise-grade system powered by Gemini multimodal AI and Opus workflow orchestration for real-time global anomaly detection and response.

## Tech Stack
- **Backend**: Node.js, Express, TypeScript, Sequelize, PostgreSQL
- **Frontend**: React, TypeScript, Vite, Leaflet, TailwindCSS
- **AI**: Google Gemini Multimodal AI
- **Workflow**: Opus Workflow Engine
- **Infrastructure**: Docker, Nginx, Redis, GitHub Actions

## Development Commands

### Backend
```bash
cd backend
npm install
npm run dev      # Development with hot reload
npm run build    # Build for production
npm start        # Production start
npm test         # Run tests
```

### Frontend
```bash
cd frontend
npm install
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

### Docker
```bash
docker-compose up -d          # Start all services
docker-compose logs -f        # View logs
docker-compose down           # Stop services
```

## Project Structure
- `/backend` - Node.js/Express API server
- `/frontend` - React/TypeScript frontend
- `/workflows` - Opus workflow definitions
- `/scripts` - Utility scripts
- `/docs` - Documentation

## Coding Guidelines
- Use TypeScript for type safety
- Follow ESLint configuration
- Write tests for new features
- Use conventional commits
- Document API changes
