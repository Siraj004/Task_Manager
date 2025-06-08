// ✅ FILE: backend/src/models/Comment.ts
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Comment extends Model {
  public id!: number;
  public text!: string;
  public userId!: number;
  public taskId!: number;
}

Comment.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Comment',
  tableName: 'comments',
});

export default Comment;
