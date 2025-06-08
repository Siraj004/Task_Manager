// ✅ FILE: backend/src/models/Task.ts
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Task extends Model {
  public id!: number;
  public title!: string;
  public description?: string;
  public status!: string;
  public projectId!: number;
  public assigneeId?: number;
}

Task.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'open',
  },
}, {
  sequelize,
  modelName: 'Task',
  tableName: 'tasks',
});

export default Task;