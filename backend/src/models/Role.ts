import {
  Model,
  DataTypes,
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManySetAssociationsMixin
} from 'sequelize';
import { sequelize } from '../config/database';
import { Permission } from './Permission';

export class Role extends Model {
  public id!: number;
  public name!: string;

  // ✅ Association mixins
  public getPermissions!: BelongsToManyGetAssociationsMixin<Permission>;
  public addPermission!: BelongsToManyAddAssociationMixin<Permission, number>;
  public setPermissions!: BelongsToManySetAssociationsMixin<Permission, number>;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
       allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true,
  }
);
