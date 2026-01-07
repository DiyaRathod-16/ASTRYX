import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { sequelize } from './models/index';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';

import anomalyRoutes from './routes/anomalies';
import workflowRoutes from './routes/workflows';
import dataSourceRoutes from './routes/dataSources';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';

import { DataIngestionService } from './services/DataIngestionService';
import { WebSocketService } from './services/WebSocketService';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingInterval: parseInt(process.env.WS_PING_INTERVAL || '30000'),
  pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '5000')
});

// Initialize WebSocket service
const wsService = new WebSocketService(io);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);
app.use(rateLimiter);

// Make WebSocket service available to routes
app.set('wsService', wsService);

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/data-sources', dataSourceRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'ASTRYX API',
    version: '1.0.0',
    description: 'Autonomous Anomaly Detection System',
    status: 'operational',
    endpoints: {
      health: '/api/health',
      anomalies: '/api/anomalies',
      workflows: '/api/workflows',
      dataSources: '/api/data-sources'
    }
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Database connection and server startup
async function startServer() {
  try {
    // Connect to database
    await sequelize.authenticate();
    logger.info('✅ Database connection established');

    // Sync models (use migrations in production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('✅ Database models synchronized');
    }

    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`🚀 ASTRYX Server running on port ${PORT}`);
      logger.info(`📡 WebSocket server ready`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Initialize data ingestion service
    if (process.env.INGESTION_ENABLED === 'true') {
      const ingestionService = DataIngestionService.getInstance();
      ingestionService.setWebSocketService(wsService);
      ingestionService.start();
      logger.info('🔄 Data ingestion service started');
    }

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      httpServer.close(() => {
        logger.info('HTTP server closed');
      });
      await sequelize.close();
      logger.info('Database connection closed');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, io, wsService };
