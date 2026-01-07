import { Router, Request, Response } from 'express';
import { sequelize } from '../models/index';
import { WebSocketService } from '../services/WebSocketService';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Check database connection (don't fail if db not available)
    let dbStatus = 'not_configured';
    try {
      await sequelize.authenticate();
      dbStatus = 'healthy';
    } catch (dbError) {
      dbStatus = 'unavailable';
    }
    
    // Get WebSocket status
    const wsService = req.app.get('wsService') as WebSocketService | undefined;
    const wsClients = wsService?.getConnectedClientCount() || 0;

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus,
        websocket: {
          status: 'healthy',
          connectedClients: wsClients
        },
        ingestion: {
          status: process.env.INGESTION_ENABLED === 'true' ? 'active' : 'inactive',
          schedule: process.env.INGESTION_SCHEDULE || '*/15 * * * *'
        },
        ai: {
          status: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured'
        }
      },
      autonomousMode: process.env.AUTONOMOUS_MODE === 'true',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      },
      responseTime: `${Date.now() - startTime}ms`
    };

    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      responseTime: `${Date.now() - startTime}ms`
    });
  }
});

router.get('/ready', async (req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false });
  }
});

router.get('/live', (req: Request, res: Response) => {
  res.json({ live: true });
});

export default router;
