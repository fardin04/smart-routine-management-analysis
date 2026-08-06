import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Room extends Model {}

Room.init(
  {
    roomNumber: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('Classroom', 'Laboratory'),
      allowNull: false,
    },
    availableDays: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    },
  },
  {
    sequelize,
    tableName: 'rooms',
    timestamps: true,
  }
);

export default Room;