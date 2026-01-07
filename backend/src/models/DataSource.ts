import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export interface DataSourceAttributes {
  id: string;
  name: string;
  type: 'weather' | 'satellite' | 'news' | 'disaster' | 'traffic' | 'air_quality' | 'social' | 'sensor' | 'custom';
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'rate_limited';
  apiEndpoint: string;
  apiKey: string | null;
  refreshInterval: number;
  lastFetchAt: Date | null;
  lastSuccessAt: Date | null;
  lastErrorAt: Date | null;
  lastError: string | null;
  fetchCount: number;
  errorCount: number;
  config: object;
  headers: object;
  rateLimit: object;
  metadata: object;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataSourceCreationAttributes extends Optional<DataSourceAttributes, 
  'id' | 'status' | 'apiKey' | 'lastFetchAt' | 'lastSuccessAt' | 'lastErrorAt' | 
  'lastError' | 'fetchCount' | 'errorCount' | 'config' | 'headers' | 'rateLimit' | 
  'metadata' | 'createdAt' | 'updatedAt'> {}

export class DataSourceModel extends Model<DataSourceAttributes, DataSourceCreationAttributes> implements DataSourceAttributes {
  declare id: string;
  declare name: string;
  declare type: 'weather' | 'satellite' | 'news' | 'disaster' | 'traffic' | 'air_quality' | 'social' | 'sensor' | 'custom';
  declare provider: string;
  declare status: 'active' | 'inactive' | 'error' | 'rate_limited';
  declare apiEndpoint: string;
  declare apiKey: string | null;
  declare refreshInterval: number;
  declare lastFetchAt: Date | null;
  declare lastSuccessAt: Date | null;
  declare lastErrorAt: Date | null;
  declare lastError: string | null;
  declare fetchCount: number;
  declare errorCount: number;
  declare config: object;
  declare headers: object;
  declare rateLimit: object;
  declare metadata: object;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initDataSourceModel(sequelize: Sequelize): void {
  DataSourceModel.init(
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
      type: {
        type: DataTypes.ENUM('weather', 'satellite', 'news', 'disaster', 'traffic', 'air_quality', 'social', 'sensor', 'custom'),
        allowNull: false
      },
      provider: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'error', 'rate_limited'),
        allowNull: false,
        defaultValue: 'inactive'
      },
      apiEndpoint: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      apiKey: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      refreshInterval: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 900000 // 15 minutes
      },
      lastFetchAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      lastSuccessAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      lastErrorAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      lastError: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      fetchCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      errorCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      config: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      headers: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      rateLimit: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {
          requests: 100,
          window: 3600000
        }
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
      tableName: 'data_sources',
      timestamps: true,
      indexes: [
        { fields: ['type'] },
        { fields: ['status'] },
        { fields: ['provider'] }
      ]
    }
  );
}
