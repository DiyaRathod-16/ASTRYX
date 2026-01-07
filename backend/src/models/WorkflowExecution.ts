import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export interface WorkflowExecutionAttributes {
  id: string;
  workflowId: string;
  anomalyId: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  currentStep: string | null;
  stepResults: object[];
  input: object;
  output: object | null;
  error: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  duration: number | null;
  triggeredBy: string;
  metadata: object;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecutionCreationAttributes extends Optional<WorkflowExecutionAttributes, 
  'id' | 'anomalyId' | 'status' | 'currentStep' | 'stepResults' | 'output' | 
  'error' | 'startedAt' | 'completedAt' | 'duration' | 'metadata' | 'createdAt' | 'updatedAt'> {}

export class WorkflowExecutionModel extends Model<WorkflowExecutionAttributes, WorkflowExecutionCreationAttributes> implements WorkflowExecutionAttributes {
  declare id: string;
  declare workflowId: string;
  declare anomalyId: string | null;
  declare status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  declare currentStep: string | null;
  declare stepResults: object[];
  declare input: object;
  declare output: object | null;
  declare error: string | null;
  declare startedAt: Date | null;
  declare completedAt: Date | null;
  declare duration: number | null;
  declare triggeredBy: string;
  declare metadata: object;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initWorkflowExecutionModel(sequelize: Sequelize): void {
  WorkflowExecutionModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      workflowId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'workflows',
          key: 'id'
        }
      },
      anomalyId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'anomalies',
          key: 'id'
        }
      },
      status: {
        type: DataTypes.ENUM('pending', 'running', 'completed', 'failed', 'cancelled', 'paused'),
        allowNull: false,
        defaultValue: 'pending'
      },
      currentStep: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      stepResults: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
      },
      input: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      output: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      error: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      triggeredBy: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'system'
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      tableName: 'workflow_executions',
      timestamps: true,
      indexes: [
        { fields: ['workflowId'] },
        { fields: ['anomalyId'] },
        { fields: ['status'] },
        { fields: ['createdAt'] }
      ]
    }
  );
}
