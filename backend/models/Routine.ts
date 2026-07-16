import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/db';

export class Routine extends Model<
  InferAttributes<Routine>,
  InferCreationAttributes<Routine>
> {
  // Use "declare" to prevent TypeScript from compiling fields down into physical, 
  // overriding instance variables that break Sequelize getters/setters.
  declare id: CreationOptional<number>;
  declare courseId: number;
  declare teacherId: string;
  declare roomNumber: string;
  declare batchId: number;
  declare day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday';
  declare slot: number;

  // Type associations explicitly
  declare course?: any;
  declare teacher?: any;
  declare room?: any;
  declare batch?: any;
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