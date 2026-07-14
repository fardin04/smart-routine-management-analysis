import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Course extends Model {
  public id!: number;
  public courseName!: string;
  public courseCode!: string;
  public courseType!: 'Theory' | 'Lab';
  public teacherId!: string | null;
  public batchId!: number;
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
