import { Model, DataTypes, Association, BelongsToManyAddAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManySetAssociationsMixin } from 'sequelize';
import { sequelize } from '../config/database';
import { Role } from './Role';

export interface UserAttributes {
  id?: number;
  username: string;
  password: string;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;

  // Association mixins for Role
  public getRoles!: BelongsToManyGetAssociationsMixin<Role>;
  public addRole!: BelongsToManyAddAssociationMixin<Role, number>;
  public setRoles!: BelongsToManySetAssociationsMixin<Role, number>;
  
  // Add this method too if you're calling it
  public hasRole!: (roleName: string) => Promise<boolean>;
  public hasPermission!: (permissionName: string) => Promise<boolean>;
  
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'users',
  modelName: 'User'
});

export default User;
