import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

// Use SQLite for development if no DATABASE_URL is set
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      logging: (msg) => logger.debug(msg),
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: './astryx.sqlite',
      logging: (msg) => logger.debug(msg)
    });

// Import models
import { AnomalyModel, initAnomalyModel } from './Anomaly';
import { WorkflowModel, initWorkflowModel } from './Workflow';
import { DataSourceModel, initDataSourceModel } from './DataSource';
import { AuditLogModel, initAuditLogModel } from './AuditLog';
import { UserModel, initUserModel } from './User';
import { WorkflowExecutionModel, initWorkflowExecutionModel } from './WorkflowExecution';

// Initialize models
initAnomalyModel(sequelize);
initWorkflowModel(sequelize);
initDataSourceModel(sequelize);
initAuditLogModel(sequelize);
initUserModel(sequelize);
initWorkflowExecutionModel(sequelize);

// Define associations
AnomalyModel.hasMany(AuditLogModel, { foreignKey: 'anomalyId', as: 'auditLogs' });
AuditLogModel.belongsTo(AnomalyModel, { foreignKey: 'anomalyId', as: 'anomaly' });

WorkflowModel.hasMany(WorkflowExecutionModel, { foreignKey: 'workflowId', as: 'executions' });
WorkflowExecutionModel.belongsTo(WorkflowModel, { foreignKey: 'workflowId', as: 'workflow' });

AnomalyModel.hasMany(WorkflowExecutionModel, { foreignKey: 'anomalyId', as: 'workflowExecutions' });
WorkflowExecutionModel.belongsTo(AnomalyModel, { foreignKey: 'anomalyId', as: 'anomaly' });

DataSourceModel.hasMany(AnomalyModel, { foreignKey: 'sourceId', as: 'anomalies' });
AnomalyModel.belongsTo(DataSourceModel, { foreignKey: 'sourceId', as: 'source' });

UserModel.hasMany(AuditLogModel, { foreignKey: 'userId', as: 'auditLogs' });
AuditLogModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });

export {
  sequelize,
  AnomalyModel,
  WorkflowModel,
  DataSourceModel,
  AuditLogModel,
  UserModel,
  WorkflowExecutionModel
};
