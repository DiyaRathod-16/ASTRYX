import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export interface WorkflowAttributes {
  id: string;
  name: string;
  description: string;
  type: 'default' | 'emergency' | 'verification' | 'escalation' | 'custom';
  status: 'active' | 'inactive' | 'draft';
  version: number;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  config: object;
  metadata: object;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'intake' | 'ai_analysis' | 'verification' | 'decision' | 'human_review' | 'approval' | 'response' | 'notification' | 'custom';
  config: object;
  nextSteps: string[];
  timeout?: number;
  retryCount?: number;
}

export interface WorkflowTrigger {
  id: string;
  type: 'anomaly_detected' | 'severity_threshold' | 'schedule' | 'manual' | 'api';
  conditions: object;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
}

export interface WorkflowCreationAttributes extends Optional<WorkflowAttributes, 
  'id' | 'status' | 'version' | 'triggers' | 'conditions' | 'config' | 
  'metadata' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'> {}

export class WorkflowModel extends Model<WorkflowAttributes, WorkflowCreationAttributes> implements WorkflowAttributes {
  declare id: string;
  declare name: string;
  declare description: string;
  declare type: 'default' | 'emergency' | 'verification' | 'escalation' | 'custom';
  declare status: 'active' | 'inactive' | 'draft';
  declare version: number;
  declare steps: WorkflowStep[];
  declare triggers: WorkflowTrigger[];
  declare conditions: WorkflowCondition[];
  declare config: object;
  declare metadata: object;
  declare createdBy: string | null;
  declare updatedBy: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initWorkflowModel(sequelize: Sequelize): void {
  WorkflowModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('default', 'emergency', 'verification', 'escalation', 'custom'),
        allowNull: false,
        defaultValue: 'default'
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'draft'),
        allowNull: false,
        defaultValue: 'draft'
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      steps: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
      },
      triggers: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
      },
      conditions: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
      },
      config: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: true
      },
      updatedBy: {
        type: DataTypes.UUID,
        allowNull: true
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
      tableName: 'workflows',
      timestamps: true,
      indexes: [
        { fields: ['type'] },
        { fields: ['status'] },
        { fields: ['name'] }
      ]
    }
  );
}
