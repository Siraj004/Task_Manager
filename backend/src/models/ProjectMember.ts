import { Model } from 'sequelize';
import { sequelize } from '../config/database';

export class ProjectMember extends Model {}

ProjectMember.init({}, {
  sequelize,
  modelName: 'ProjectMember',
  tableName: 'project_members'
}); 