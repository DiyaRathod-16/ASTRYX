import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export interface AnomalyAttributes {
  id: string;
  title: string;
  description: string;
  type: 'weather' | 'seismic' | 'traffic' | 'environmental' | 'security' | 'health' | 'infrastructure' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'analyzing' | 'verified' | 'pending_review' | 'approved' | 'rejected' | 'resolved';
  confidence: number;
  latitude: number;
  longitude: number;
  location: string;
  sourceId: string | null;
  sourceType: string;
  rawData: object;
  aiAnalysis: object | null;
  mediaUrls: string[];
  mediaTypes: string[];
  verificationData: object | null;
  impactAssessment: object | null;
  responseActions: object[];
  tags: string[];
  assignedTo: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  resolvedAt: Date | null;
  expiresAt: Date | null;
  metadata: object;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnomalyCreationAttributes extends Optional<AnomalyAttributes, 
  'id' | 'status' | 'confidence' | 'aiAnalysis' | 'mediaUrls' | 'mediaTypes' | 
  'verificationData' | 'impactAssessment' | 'responseActions' | 'tags' | 
  'assignedTo' | 'reviewedBy' | 'reviewedAt' | 'resolvedAt' | 'expiresAt' | 
  'metadata' | 'createdAt' | 'updatedAt' | 'sourceId'> {}

export class AnomalyModel extends Model<AnomalyAttributes, AnomalyCreationAttributes> implements AnomalyAttributes {
  declare id: string;
  declare title: string;
  declare description: string;
  declare type: 'weather' | 'seismic' | 'traffic' | 'environmental' | 'security' | 'health' | 'infrastructure' | 'other';
  declare severity: 'low' | 'medium' | 'high' | 'critical';
  declare status: 'detected' | 'analyzing' | 'verified' | 'pending_review' | 'approved' | 'rejected' | 'resolved';
  declare confidence: number;
  declare latitude: number;
  declare longitude: number;
  declare location: string;
  declare sourceId: string | null;
  declare sourceType: string;
  declare rawData: object;
  declare aiAnalysis: object | null;
  declare mediaUrls: string[];
  declare mediaTypes: string[];
  declare verificationData: object | null;
  declare impactAssessment: object | null;
  declare responseActions: object[];
  declare tags: string[];
  declare assignedTo: string | null;
  declare reviewedBy: string | null;
  declare reviewedAt: Date | null;
  declare resolvedAt: Date | null;
  declare expiresAt: Date | null;
  declare metadata: object;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initAnomalyModel(sequelize: Sequelize): void {
  AnomalyModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('weather', 'seismic', 'traffic', 'environmental', 'security', 'health', 'infrastructure', 'other'),
        allowNull: false,
        defaultValue: 'other'
      },
      severity: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'medium'
      },
      status: {
        type: DataTypes.ENUM('detected', 'analyzing', 'verified', 'pending_review', 'approved', 'rejected', 'resolved'),
        allowNull: false,
        defaultValue: 'detected'
      },
      confidence: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: 0,
          max: 1
        }
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false
      },
      location: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      sourceId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'data_sources',
          key: 'id'
        }
      },
      sourceType: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      rawData: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      aiAnalysis: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      mediaUrls: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: []
      },
      mediaTypes: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: []
      },
      verificationData: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      impactAssessment: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      responseActions: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: []
      },
      assignedTo: {
        type: DataTypes.UUID,
        allowNull: true
      },
      reviewedBy: {
        type: DataTypes.UUID,
        allowNull: true
      },
      reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
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
      tableName: 'anomalies',
      timestamps: true,
      indexes: [
        { fields: ['type'] },
        { fields: ['severity'] },
        { fields: ['status'] },
        { fields: ['confidence'] },
        { fields: ['createdAt'] },
        { fields: ['latitude', 'longitude'] }
      ]
    }
  );
}
