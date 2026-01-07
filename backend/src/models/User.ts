import { DataTypes, Model, Sequelize, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';

export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'analyst' | 'operator' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  avatar: string | null;
  lastLoginAt: Date | null;
  preferences: object;
  permissions: string[];
  metadata: object;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 
  'id' | 'role' | 'status' | 'avatar' | 'lastLoginAt' | 'preferences' | 
  'permissions' | 'metadata' | 'createdAt' | 'updatedAt'> {}

export class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare password: string;
  declare name: string;
  declare role: 'admin' | 'analyst' | 'operator' | 'viewer';
  declare status: 'active' | 'inactive' | 'suspended';
  declare avatar: string | null;
  declare lastLoginAt: Date | null;
  declare preferences: object;
  declare permissions: string[];
  declare metadata: object;
  declare createdAt: Date;
  declare updatedAt: Date;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

export function initUserModel(sequelize: Sequelize): void {
  UserModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('admin', 'analyst', 'operator', 'viewer'),
        allowNull: false,
        defaultValue: 'viewer'
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        allowNull: false,
        defaultValue: 'active'
      },
      avatar: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      preferences: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {
          notifications: true,
          theme: 'dark',
          language: 'en'
        }
      },
      permissions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: []
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
      tableName: 'users',
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(user.password, salt);
          }
        }
      },
      indexes: [
        { unique: true, fields: ['email'] },
        { fields: ['role'] },
        { fields: ['status'] }
      ]
    }
  );
}
