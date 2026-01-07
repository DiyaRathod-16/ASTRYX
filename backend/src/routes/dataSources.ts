import { Router, Request, Response, NextFunction } from 'express';
import { DataSourceModel } from '../models/index';
import { DataIngestionService } from '../services/DataIngestionService';
import { ApiError } from '../middleware/errorHandler';

const router = Router();
const ingestionService = DataIngestionService.getInstance();

// Get all data sources
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, type } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const sources = await DataSourceModel.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: sources
    });
  } catch (error) {
    next(error);
  }
});

// Get data source statistics
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sources = await DataSourceModel.findAll();
    
    const stats = {
      total: sources.length,
      active: sources.filter(s => s.status === 'active').length,
      inactive: sources.filter(s => s.status === 'inactive').length,
      error: sources.filter(s => s.status === 'error').length,
      totalFetches: sources.reduce((sum, s) => sum + s.fetchCount, 0),
      totalErrors: sources.reduce((sum, s) => sum + s.errorCount, 0),
      byType: {} as Record<string, number>
    };

    sources.forEach(s => {
      stats.byType[s.type] = (stats.byType[s.type] || 0) + 1;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// Get single data source
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const source = await DataSourceModel.findByPk(req.params.id);

    if (!source) {
      throw ApiError.notFound('Data source not found');
    }

    res.json({
      success: true,
      data: source
    });
  } catch (error) {
    next(error);
  }
});

// Create data source
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      type,
      provider,
      apiEndpoint,
      apiKey,
      refreshInterval,
      config,
      headers,
      rateLimit
    } = req.body;

    const source = await DataSourceModel.create({
      name,
      type,
      provider,
      apiEndpoint,
      apiKey,
      refreshInterval: refreshInterval || 900000,
      config: config || {},
      headers: headers || {},
      rateLimit: rateLimit || { requests: 100, window: 3600000 }
    });

    res.status(201).json({
      success: true,
      data: source
    });
  } catch (error) {
    next(error);
  }
});

// Update data source
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const source = await DataSourceModel.findByPk(req.params.id);
    
    if (!source) {
      throw ApiError.notFound('Data source not found');
    }

    const updatableFields = [
      'name', 'apiEndpoint', 'apiKey', 'refreshInterval',
      'config', 'headers', 'rateLimit', 'status'
    ];

    const updates: any = {};
    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await source.update(updates);

    res.json({
      success: true,
      data: source
    });
  } catch (error) {
    next(error);
  }
});

// Activate data source
router.post('/:id/activate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const source = await DataSourceModel.findByPk(req.params.id);
    
    if (!source) {
      throw ApiError.notFound('Data source not found');
    }

    await source.update({ status: 'active' });

    res.json({
      success: true,
      data: source,
      message: 'Data source activated'
    });
  } catch (error) {
    next(error);
  }
});

// Deactivate data source
router.post('/:id/deactivate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const source = await DataSourceModel.findByPk(req.params.id);
    
    if (!source) {
      throw ApiError.notFound('Data source not found');
    }

    await source.update({ status: 'inactive' });

    res.json({
      success: true,
      data: source,
      message: 'Data source deactivated'
    });
  } catch (error) {
    next(error);
  }
});

// Trigger manual fetch
router.post('/:id/fetch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const source = await DataSourceModel.findByPk(req.params.id);
    
    if (!source) {
      throw ApiError.notFound('Data source not found');
    }

    // Trigger ingestion
    const result = await ingestionService.triggerManualIngestion();

    await source.update({
      lastFetchAt: new Date(),
      fetchCount: source.fetchCount + 1
    });

    res.json({
      success: true,
      message: 'Manual fetch triggered',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Trigger ingestion for all sources
router.post('/trigger-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ingestionService.triggerManualIngestion();

    res.json({
      success: true,
      message: 'Ingestion triggered for all sources',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Delete data source
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const source = await DataSourceModel.findByPk(req.params.id);
    
    if (!source) {
      throw ApiError.notFound('Data source not found');
    }

    await source.destroy();

    res.json({
      success: true,
      message: 'Data source deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
