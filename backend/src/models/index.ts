import { sequelize } from '../config/database';
import User from './User';
import { Role } from './Role';
import { Permission } from './Permission';
import { UserRole } from './UserRole';
import { RolePermission } from './RolePermission';
import { Project } from './Project';
import { Task } from './Task';
import { Comment } from './Comment';
import Notification from './Notification';
import { ProjectMember } from './ProjectMember';
import { seedRBAC } from '../utils/seedRBAC';


// Define associations for RBAC
User.belongsToMany(Role, { through: UserRole });
Role.belongsToMany(User, { through: UserRole });
Role.belongsToMany(Permission, { through: RolePermission });
Permission.belongsToMany(Role, { through: RolePermission });

// Task-Project associations
Project.hasMany(Task);
Task.belongsTo(Project);

// Task-User (assignee) associations
User.hasMany(Task, { foreignKey: 'assigneeId' });
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });

// Comments associations
Task.hasMany(Comment);
Comment.belongsTo(Task);
User.hasMany(Comment);
Comment.belongsTo(User);

// Project-User (membership) associations
Project.belongsToMany(User, { through: ProjectMember });
User.belongsToMany(Project, { through: ProjectMember });

export const initModels = async () => {
  await sequelize.sync({alter : true 
    ,
  });
};

export {
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  Project,
  Task,
  Comment,
  Notification,
  ProjectMember,
};
