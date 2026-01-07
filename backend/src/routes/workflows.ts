import { Router, Request, Response, NextFunction } from 'express';
import { WorkflowModel, WorkflowExecutionModel } from '../models/index';
import { WorkflowService } from '../services/WorkflowService';
import { ApiError } from '../middleware/errorHandler';

const router = Router();
const workflowService = WorkflowService.getInstance();

// Get all workflows
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, type } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const workflows = await WorkflowModel.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: workflows
    });
  } catch (error) {
    next(error);
  }
});

// Get workflow templates
router.get('/templates/list', (req: Request, res: Response) => {
  const templates = workflowService.getWorkflowTemplates();
  
  res.json({
    success: true,
    data: templates
  });
});

// Get single workflow
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workflow = await WorkflowModel.findByPk(req.params.id, {
      include: [{ model: WorkflowExecutionModel, as: 'executions', limit: 10 }]
    });

    if (!workflow) {
      throw ApiError.notFound('Workflow not found');
    }

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
});

// Create workflow
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, type, steps, triggers, conditions, config } = req.body;

    const workflow = await WorkflowModel.create({
      name,
      description,
      type: type || 'custom',
      steps: steps || [],
      triggers: triggers || [],
      conditions: conditions || [],
      config: config || {}
    });

    res.status(201).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
});

// Create workflow from template
router.post('/from-template', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { templateName, customizations } = req.body;
    
    const templates = workflowService.getWorkflowTemplates();
    const template = templates.find((t: any) => t.name === templateName);
    
    if (!template) {
      throw ApiError.notFound('Template not found');
    }

    const workflowData = {
      ...(template as any),
      ...customizations,
      name: customizations?.name || `${(template as any).name} - ${Date.now()}`
    };

    const workflow = await WorkflowModel.create(workflowData);

    res.status(201).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
});

// Update workflow
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workflow = await WorkflowModel.findByPk(req.params.id);
    
    if (!workflow) {
      throw ApiError.notFound('Workflow not found');
    }

    const { name, description, status, steps, triggers, conditions, config } = req.body;

    await workflow.update({
      ...(name && { name }),
      ...(description && { description }),
      ...(status && { status }),
      ...(steps && { steps }),
      ...(triggers && { triggers }),
      ...(conditions && { conditions }),
      ...(config && { config }),
      version: workflow.version + 1
    });

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
});

// Activate workflow
router.post('/:id/activate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workflow = await WorkflowModel.findByPk(req.params.id);
    
    if (!workflow) {
      throw ApiError.notFound('Workflow not found');
    }

    await workflow.update({ status: 'active' });

    res.json({
      success: true,
      data: workflow,
      message: 'Workflow activated'
    });
  } catch (error) {
    next(error);
  }
});

// Deactivate workflow
router.post('/:id/deactivate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workflow = await WorkflowModel.findByPk(req.params.id);
    
    if (!workflow) {
      throw ApiError.notFound('Workflow not found');
    }

    await workflow.update({ status: 'inactive' });

    res.json({
      success: true,
      data: workflow,
      message: 'Workflow deactivated'
    });
  } catch (error) {
    next(error);
  }
});

// Execute workflow manually
router.post('/:id/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workflow = await WorkflowModel.findByPk(req.params.id);
    
    if (!workflow) {
      throw ApiError.notFound('Workflow not found');
    }

    if (workflow.status !== 'active') {
      throw ApiError.badRequest('Workflow is not active');
    }

    const { input } = req.body;
    
    const executionId = await workflowService.triggerWorkflow('manual', {
      workflowId: workflow.id,
      ...input
    });

    res.json({
      success: true,
      data: {
        executionId,
        message: 'Workflow execution started'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get workflow executions
router.get('/:id/executions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await WorkflowExecutionModel.findAndCountAll({
      where: { workflowId: req.params.id },
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']]
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

// Get specific execution
router.get('/executions/:executionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const execution = await WorkflowExecutionModel.findByPk(req.params.executionId, {
      include: [{ model: WorkflowModel, as: 'workflow' }]
    });

    if (!execution) {
      throw ApiError.notFound('Execution not found');
    }

    res.json({
      success: true,
      data: execution
    });
  } catch (error) {
    next(error);
  }
});

// Delete workflow
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workflow = await WorkflowModel.findByPk(req.params.id);
    
    if (!workflow) {
      throw ApiError.notFound('Workflow not found');
    }

    await workflow.destroy();

    res.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
