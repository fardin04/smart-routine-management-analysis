import { DataTypes, Model, InferAttributes,InferCreationAttributes } from 'sequelize';
import sequelize from '../config/db';

export class Teacher extends Model<
  InferAttributes<Teacher>,
  InferCreationAttributes<Teacher>
> {
  declare id: string;
  declare name: string;
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
