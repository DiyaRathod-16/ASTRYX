import { Router, Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { AnomalyModel, AuditLogModel } from '../models/index';
import { GeminiService } from '../services/GeminiService';
import { WorkflowService } from '../services/WorkflowService';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest, optionalAuth } from '../middleware/auth';
import { WebSocketService } from '../services/WebSocketService';

const router = Router();
const geminiService = GeminiService.getInstance();
const workflowService = WorkflowService.getInstance();

// Get all anomalies with filtering and pagination
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      severity,
      status,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const where: any = {};

    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate as string);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate as string);
    }

    const offset = (Number(page) - 1) * Number(limit);
    
    const { count, rows } = await AnomalyModel.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [[sortBy as string, sortOrder as string]]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil(count / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get anomaly statistics
router.get('/stats/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      total,
      critical,
      high,
      pending,
      recentCount
    ] = await Promise.all([
      AnomalyModel.count(),
      AnomalyModel.count({ where: { severity: 'critical' } }),
      AnomalyModel.count({ where: { severity: 'high' } }),
      AnomalyModel.count({ where: { status: 'pending_review' } }),
      AnomalyModel.count({
        where: {
          createdAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    const byType = await AnomalyModel.findAll({
      attributes: [
        'type',
        [AnomalyModel.sequelize!.fn('COUNT', AnomalyModel.sequelize!.col('id')), 'count']
      ],
      group: ['type']
    });

    const bySeverity = await AnomalyModel.findAll({
      attributes: [
        'severity',
        [AnomalyModel.sequelize!.fn('COUNT', AnomalyModel.sequelize!.col('id')), 'count']
      ],
      group: ['severity']
    });

    res.json({
      success: true,
      data: {
        total,
        critical,
        high,
        pending,
        last24Hours: recentCount,
        byType: byType.map((t: any) => ({ type: t.type, count: parseInt(t.get('count')) })),
        bySeverity: bySeverity.map((s: any) => ({ severity: s.severity, count: parseInt(s.get('count')) }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single anomaly
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const anomaly = await AnomalyModel.findByPk(req.params.id, {
      include: [{ model: AuditLogModel, as: 'auditLogs' }]
    });

    if (!anomaly) {
      throw ApiError.notFound('Anomaly not found');
    }

    res.json({
      success: true,
      data: anomaly
    });
  } catch (error) {
    next(error);
  }
});

// Create new anomaly
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      description,
      type,
      severity,
      latitude,
      longitude,
      location,
      sourceType,
      rawData,
      mediaUrls,
      tags
    } = req.body;

    // AI Analysis
    const aiAnalysis = await geminiService.analyzeAnomaly({
      title,
      description,
      type,
      location,
      rawData: rawData || {}
    });

    const anomaly = await AnomalyModel.create({
      title,
      description,
      type: type || 'other',
      severity: aiAnalysis.severity || severity || 'medium',
      latitude,
      longitude,
      location,
      sourceType: sourceType || 'manual',
      rawData: rawData || {},
      aiAnalysis,
      confidence: aiAnalysis.confidence,
      mediaUrls: mediaUrls || [],
      tags: tags || aiAnalysis.categories
    });

    // Create audit log
    await AuditLogModel.create({
      action: 'anomaly_created',
      entityType: 'anomaly',
      entityId: anomaly.id,
      anomalyId: anomaly.id,
      userId: req.user?.id || null,
      userName: req.user?.name || 'system',
      newState: anomaly.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Broadcast via WebSocket
    const wsService = req.app.get('wsService') as WebSocketService;
    if (wsService) {
      wsService.broadcastAnomaly('new', anomaly.toJSON());
    }

    // Trigger workflow if high severity
    if (['high', 'critical'].includes(anomaly.severity)) {
      await workflowService.triggerWorkflow('anomaly_detected', anomaly);
    }

    res.status(201).json({
      success: true,
      data: anomaly
    });
  } catch (error) {
    next(error);
  }
});

// Update anomaly
router.put('/:id', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const anomaly = await AnomalyModel.findByPk(req.params.id);
    
    if (!anomaly) {
      throw ApiError.notFound('Anomaly not found');
    }

    const previousState = anomaly.toJSON();
    
    const updatableFields = [
      'title', 'description', 'type', 'severity', 'status',
      'latitude', 'longitude', 'location', 'tags', 'assignedTo',
      'impactAssessment', 'responseActions', 'metadata'
    ];

    const updates: any = {};
    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await anomaly.update(updates);

    // Create audit log
    await AuditLogModel.create({
      action: 'anomaly_updated',
      entityType: 'anomaly',
      entityId: anomaly.id,
      anomalyId: anomaly.id,
      userId: req.user?.id || null,
      userName: req.user?.name || 'anonymous',
      previousState,
      newState: anomaly.toJSON(),
      changes: updates,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Broadcast update
    const wsService = req.app.get('wsService') as WebSocketService;
    if (wsService) {
      wsService.broadcastAnomaly('updated', anomaly.toJSON());
    }

    res.json({
      success: true,
      data: anomaly
    });
  } catch (error) {
    next(error);
  }
});

// Approve anomaly
router.post('/:id/approve', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const anomaly = await AnomalyModel.findByPk(req.params.id);
    
    if (!anomaly) {
      throw ApiError.notFound('Anomaly not found');
    }

    const previousState = anomaly.toJSON();

    await anomaly.update({
      status: 'approved',
      reviewedBy: req.user?.id || null,
      reviewedAt: new Date()
    });

    await AuditLogModel.create({
      action: 'anomaly_approved',
      entityType: 'anomaly',
      entityId: anomaly.id,
      anomalyId: anomaly.id,
      userId: req.user?.id || null,
      userName: req.user?.name || 'anonymous',
      previousState,
      newState: anomaly.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const wsService = req.app.get('wsService') as WebSocketService;
    if (wsService) {
      wsService.broadcastAnomaly('updated', anomaly.toJSON());
    }

    res.json({
      success: true,
      data: anomaly,
      message: 'Anomaly approved successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Reject anomaly
router.post('/:id/reject', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const anomaly = await AnomalyModel.findByPk(req.params.id);
    
    if (!anomaly) {
      throw ApiError.notFound('Anomaly not found');
    }

    const previousState = anomaly.toJSON();
    const { reason } = req.body;

    await anomaly.update({
      status: 'rejected',
      reviewedBy: req.user?.id || null,
      reviewedAt: new Date(),
      metadata: { ...anomaly.metadata as object, rejectionReason: reason }
    });

    await AuditLogModel.create({
      action: 'anomaly_rejected',
      entityType: 'anomaly',
      entityId: anomaly.id,
      anomalyId: anomaly.id,
      userId: req.user?.id || null,
      userName: req.user?.name || 'anonymous',
      previousState,
      newState: anomaly.toJSON(),
      metadata: { reason },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const wsService = req.app.get('wsService') as WebSocketService;
    if (wsService) {
      wsService.broadcastAnomaly('updated', anomaly.toJSON());
    }

    res.json({
      success: true,
      data: anomaly,
      message: 'Anomaly rejected'
    });
  } catch (error) {
    next(error);
  }
});

// Generate report
router.get('/:id/report/:format', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { format } = req.params;
    const anomaly = await AnomalyModel.findByPk(req.params.id, {
      include: [{ model: AuditLogModel, as: 'auditLogs' }]
    });

    if (!anomaly) {
      throw ApiError.notFound('Anomaly not found');
    }

    const report = {
      generatedAt: new Date().toISOString(),
      anomaly: anomaly.toJSON(),
      provenance: {
        source: anomaly.sourceType,
        confidence: anomaly.confidence,
        verificationData: anomaly.verificationData,
        aiAnalysis: anomaly.aiAnalysis
      },
      auditTrail: (anomaly as any).auditLogs || []
    };

    if (format === 'json') {
      res.json({
        success: true,
        data: report
      });
    } else if (format === 'pdf') {
      // PDF generation would be implemented here
      res.json({
        success: true,
        message: 'PDF generation not yet implemented',
        data: report
      });
    } else {
      throw ApiError.badRequest('Invalid format. Supported: json, pdf');
    }
  } catch (error) {
    next(error);
  }
});

// Delete anomaly
router.delete('/:id', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const anomaly = await AnomalyModel.findByPk(req.params.id);
    
    if (!anomaly) {
      throw ApiError.notFound('Anomaly not found');
    }

    const deletedData = anomaly.toJSON();
    await anomaly.destroy();

    await AuditLogModel.create({
      action: 'anomaly_deleted',
      entityType: 'anomaly',
      entityId: req.params.id,
      userId: req.user?.id || null,
      userName: req.user?.name || 'anonymous',
      previousState: deletedData,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const wsService = req.app.get('wsService') as WebSocketService;
    if (wsService) {
      wsService.broadcastAnomaly('deleted', { id: req.params.id });
    }

    res.json({
      success: true,
      message: 'Anomaly deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
