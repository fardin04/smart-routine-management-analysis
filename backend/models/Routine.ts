import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Routine extends Model {
  public id!: number;
  public courseId!: number;
  public teacherId!: string;
  public roomNumber!: string;
  public batchId!: number;
  public day!: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday';
  public slot!: number; // Slot index: 1-8

  // Associated virtual attributes
  public course?: any;
  public teacher?: any;
  public room?: any;
  public batch?: any;
}

Routine.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    teacherId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'teachers',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    roomNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'rooms',
        key: 'roomNumber',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    day: {
      type: DataTypes.ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'),
      allowNull: false,
    },
    slot: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'routines',
    timestamps: true,
  }
);

export default Routine;
