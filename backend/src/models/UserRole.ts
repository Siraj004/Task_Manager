import { Model } from 'sequelize';
import { sequelize } from '../config/database';

export class UserRole extends Model {}

UserRole.init({}, {
  sequelize,
  modelName: 'UserRole',
  tableName: 'user_roles'
});
