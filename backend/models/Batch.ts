import { DataTypes, Model,InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/db';

export class Batch extends Model<
  InferAttributes<Batch>,
  InferCreationAttributes<Batch>
> {
  declare id: CreationOptional<number>;
  declare batchNumber: string;
  declare section: string;
  declare studentCount: number;
}

Batch.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    batchNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    section: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    studentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'batches',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['batchNumber', 'section'],
      },
    ],
  }
);

export default Batch;
