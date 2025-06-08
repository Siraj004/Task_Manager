import { Model } from 'sequelize';
import { sequelize } from '../config/database';

export class RolePermission extends Model {}

RolePermission.init({}, {
  sequelize,
  modelName: 'RolePermission',
  tableName: 'role_permissions'
});
