import sequelize from '../config/db';
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class Course extends Model<
  InferAttributes<Course>,
  InferCreationAttributes<Course>
> {
  declare id: CreationOptional<number>;
  declare courseName: string;
  declare courseCode: string;
  declare courseType: 'Theory' | 'Lab';
  declare teacherId: string | null;
  declare batchId: number;
}

Course.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    courseCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    courseType: {
      type: DataTypes.ENUM('Theory', 'Lab'),
      allowNull: false,
    },
    teacherId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'teachers',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    batchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'batches',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'courses',
    timestamps: true,
  }
);

export default Course;
