import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export interface AuditLogAttributes {
  id: string;
  action: string;
  entityType: 'anomaly' | 'workflow' | 'data_source' | 'user' | 'system';
  entityId: string;
  anomalyId: string | null;
  userId: string | null;
  userName: string | null;
  previousState: object | null;
  newState: object | null;
  changes: object | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: object;
  createdAt: Date;
}

export interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 
  'id' | 'anomalyId' | 'userId' | 'userName' | 'previousState' | 'newState' | 
  'changes' | 'ipAddress' | 'userAgent' | 'metadata' | 'createdAt'> {}

export class AuditLogModel extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  declare id: string;
  declare action: string;
  declare entityType: 'anomaly' | 'workflow' | 'data_source' | 'user' | 'system';
  declare entityId: string;
  declare anomalyId: string | null;
  declare userId: string | null;
  declare userName: string | null;
  declare previousState: object | null;
  declare newState: object | null;
  declare changes: object | null;
  declare ipAddress: string | null;
  declare userAgent: string | null;
  declare metadata: object;
  declare createdAt: Date;
}

export function initAuditLogModel(sequelize: Sequelize): void {
  AuditLogModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      entityType: {
        type: DataTypes.ENUM('anomaly', 'workflow', 'data_source', 'user', 'system'),
        allowNull: false
      },
      entityId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      anomalyId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'anomalies',
          key: 'id'
        }
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      userName: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      previousState: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      newState: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      changes: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true
      },
      userAgent: {
        type: DataTypes.TEXT,
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
      }
    },
    {
      sequelize,
      tableName: 'audit_logs',
      timestamps: false,
      indexes: [
        { fields: ['action'] },
        { fields: ['entityType'] },
        { fields: ['entityId'] },
        { fields: ['anomalyId'] },
        { fields: ['userId'] },
        { fields: ['createdAt'] }
      ]
    }
  );
}
