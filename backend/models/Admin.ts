import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Admin extends Model {
  declare id: number;
  declare username: string;
  declare password: string;
}

Admin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'admins',
    timestamps: true,
  }
);

export default Admin;
