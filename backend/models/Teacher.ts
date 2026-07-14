import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Teacher extends Model {
  public id!: string; // Teacher ID (e.g., "T01")
  public name!: string;
}

Teacher.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'teachers',
    timestamps: true,
  }
);

export default Teacher;
