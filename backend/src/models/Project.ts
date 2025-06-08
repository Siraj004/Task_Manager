import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Project extends Model {
  public id!: number;
  public name!: string;
  public description?: string;
}

Project.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Project',
  tableName: 'projects'
});
