import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { WorkflowModel, WorkflowExecutionModel, AnomalyModel } from '../models/index';
import { GeminiService } from './GeminiService';
import { WorkflowStep } from '../models/Workflow';

export interface WorkflowContext {
  anomalyId?: string;
  anomaly?: any;
  input: object;
  stepResults: Map<string, any>;
  variables: Map<string, any>;
}

export class WorkflowService {
  private static instance: WorkflowService;
  private geminiService: GeminiService;

  private constructor() {
    this.geminiService = GeminiService.getInstance();
  }

  static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  async triggerWorkflow(trigger: string, data: any): Promise<string | null> {
    try {
      // Find matching active workflow
      const workflow = await WorkflowModel.findOne({
        where: { status: 'active' }
      });

      if (!workflow) {
        logger.warn('No active workflow found for trigger:', trigger);
        return null;
      }

      // Create execution record
      const execution = await WorkflowExecutionModel.create({
        workflowId: workflow.id,
        anomalyId: data.id || null,
        status: 'pending',
        input: { trigger, data },
        triggeredBy: trigger
      });

      // Start async execution
      this.executeWorkflow(execution.id, workflow, data).catch(err => {
        logger.error('Workflow execution error:', err);
      });

      return execution.id;
    } catch (error) {
      logger.error('Trigger workflow error:', error);
      return null;
    }
  }

  async executeWorkflow(executionId: string, workflow: WorkflowModel, input: any): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Update status to running
      await WorkflowExecutionModel.update(
        { status: 'running', startedAt: new Date() },
        { where: { id: executionId } }
      );

      const context: WorkflowContext = {
        anomalyId: input.id,
        anomaly: input,
        input,
        stepResults: new Map(),
        variables: new Map()
      };

      const steps = workflow.steps || [];
      const stepResults: object[] = [];

      // Execute each step
      for (const step of steps) {
        await WorkflowExecutionModel.update(
          { currentStep: step.id },
          { where: { id: executionId } }
        );

        const result = await this.executeStep(step, context);
        stepResults.push({ stepId: step.id, stepName: step.name, result });
        context.stepResults.set(step.id, result);

        // Check for early termination
        if (result.terminate) {
          break;
        }
      }

      // Mark as completed
      const duration = Date.now() - startTime;
      await WorkflowExecutionModel.update(
        {
          status: 'completed',
          completedAt: new Date(),
          duration,
          stepResults,
          output: { finalContext: Object.fromEntries(context.variables) }
        },
        { where: { id: executionId } }
      );

      logger.info(`Workflow ${workflow.name} completed in ${duration}ms`);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      await WorkflowExecutionModel.update(
        {
          status: 'failed',
          completedAt: new Date(),
          duration,
          error: error.message
        },
        { where: { id: executionId } }
      );
      throw error;
    }
  }

  private async executeStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    logger.debug(`Executing step: ${step.name} (${step.type})`);

    switch (step.type) {
      case 'intake':
        return this.executeIntakeStep(step, context);
      
      case 'ai_analysis':
        return this.executeAIAnalysisStep(step, context);
      
      case 'verification':
        return this.executeVerificationStep(step, context);
      
      case 'decision':
        return this.executeDecisionStep(step, context);
      
      case 'human_review':
        return this.executeHumanReviewStep(step, context);
      
      case 'approval':
        return this.executeApprovalStep(step, context);
      
      case 'response':
        return this.executeResponseStep(step, context);
      
      case 'notification':
        return this.executeNotificationStep(step, context);
      
      default:
        return { success: true, message: 'Step type not implemented' };
    }
  }

  private async executeIntakeStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    // Intake step - validate and prepare data
    return {
      success: true,
      validated: true,
      anomalyId: context.anomalyId,
      timestamp: new Date().toISOString()
    };
  }

  private async executeAIAnalysisStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    if (!context.anomaly) {
      return { success: false, error: 'No anomaly data available' };
    }

    const analysis = await this.geminiService.analyzeAnomaly({
      title: context.anomaly.title,
      description: context.anomaly.description,
      type: context.anomaly.type,
      location: context.anomaly.location,
      rawData: context.anomaly.rawData
    });

    // Update anomaly with AI analysis
    if (context.anomalyId) {
      await AnomalyModel.update(
        { 
          aiAnalysis: analysis,
          confidence: analysis.confidence,
          status: 'analyzing'
        },
        { where: { id: context.anomalyId } }
      );
    }

    context.variables.set('aiAnalysis', analysis);
    
    return {
      success: true,
      analysis,
      confidence: analysis.confidence
    };
  }

  private async executeVerificationStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    // Cross-verify with multiple sources
    const sources = context.variables.get('sources') || [];
    
    const verification = await this.geminiService.crossVerify(
      context.anomalyId || '',
      sources
    );

    if (context.anomalyId) {
      await AnomalyModel.update(
        { 
          verificationData: verification,
          status: verification.verified ? 'verified' : 'pending_review'
        },
        { where: { id: context.anomalyId } }
      );
    }

    context.variables.set('verification', verification);

    return {
      success: true,
      verified: verification.verified,
      confidence: verification.confidence
    };
  }

  private async executeDecisionStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    const aiAnalysis = context.variables.get('aiAnalysis');
    const verification = context.variables.get('verification');
    const autoApproveThreshold = parseFloat(process.env.AUTO_APPROVE_THRESHOLD || '0.95');
    const autonomousMode = process.env.AUTONOMOUS_MODE === 'true';

    const confidence = aiAnalysis?.confidence || 0;
    const verified = verification?.verified || false;

    // Auto-approve if confidence is high enough and verified
    if (autonomousMode && confidence >= autoApproveThreshold && verified) {
      return {
        success: true,
        decision: 'auto_approved',
        reason: 'High confidence and verified',
        requiresHumanReview: false
      };
    }

    return {
      success: true,
      decision: 'requires_review',
      reason: 'Does not meet auto-approval criteria',
      requiresHumanReview: true
    };
  }

  private async executeHumanReviewStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    // Mark anomaly as pending review
    if (context.anomalyId) {
      await AnomalyModel.update(
        { status: 'pending_review' },
        { where: { id: context.anomalyId } }
      );
    }

    return {
      success: true,
      status: 'pending_review',
      message: 'Anomaly queued for human review'
    };
  }

  private async executeApprovalStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    const decision = context.variables.get('decision');
    
    if (decision?.decision === 'auto_approved') {
      if (context.anomalyId) {
        await AnomalyModel.update(
          { status: 'approved', reviewedAt: new Date() },
          { where: { id: context.anomalyId } }
        );
      }
      return { success: true, approved: true, method: 'automatic' };
    }

    return { success: true, approved: false, method: 'manual_required' };
  }

  private async executeResponseStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    // Generate impact assessment and response actions
    if (!context.anomaly) {
      return { success: false, error: 'No anomaly data' };
    }

    const impact = await this.geminiService.generateImpactAssessment(context.anomaly);

    if (context.anomalyId) {
      await AnomalyModel.update(
        { impactAssessment: impact },
        { where: { id: context.anomalyId } }
      );
    }

    return {
      success: true,
      impactAssessment: impact
    };
  }

  private async executeNotificationStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    // Notification logic would integrate with email, SMS, etc.
    logger.info(`Notification step for anomaly ${context.anomalyId}`);
    
    return {
      success: true,
      notificationsSent: 0,
      channels: []
    };
  }

  // Get default workflow templates
  getWorkflowTemplates(): object[] {
    return [
      {
        name: 'Default Anomaly Workflow',
        type: 'default',
        description: 'Standard anomaly processing with AI analysis and human review',
        steps: [
          { id: 'intake', name: 'Intake', type: 'intake', nextSteps: ['ai_analysis'] },
          { id: 'ai_analysis', name: 'AI Analysis', type: 'ai_analysis', nextSteps: ['verification'] },
          { id: 'verification', name: 'Cross-Verification', type: 'verification', nextSteps: ['decision'] },
          { id: 'decision', name: 'Decision', type: 'decision', nextSteps: ['human_review', 'approval'] },
          { id: 'human_review', name: 'Human Review', type: 'human_review', nextSteps: ['approval'] },
          { id: 'approval', name: 'Approval', type: 'approval', nextSteps: ['response'] },
          { id: 'response', name: 'Response', type: 'response', nextSteps: ['notification'] },
          { id: 'notification', name: 'Notification', type: 'notification', nextSteps: [] }
        ]
      },
      {
        name: 'Emergency Response Workflow',
        type: 'emergency',
        description: 'Fast-track workflow for critical anomalies',
        steps: [
          { id: 'emergency_intake', name: 'Emergency Intake', type: 'intake', nextSteps: ['ai_triage'] },
          { id: 'ai_triage', name: 'AI Triage', type: 'ai_analysis', nextSteps: ['impact'] },
          { id: 'impact', name: 'Impact Assessment', type: 'response', nextSteps: ['notification'] },
          { id: 'notification', name: 'Emergency Notification', type: 'notification', nextSteps: [] }
        ]
      }
    ];
  }
}
