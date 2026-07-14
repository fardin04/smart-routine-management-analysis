import sequelize from '../config/db';
import Admin from './Admin';
import Teacher from './Teacher';
import Room from './Room';
import Batch from './Batch';
import Course from './Course';
import Routine from './Routine';

// --- Associations ---

// Teacher <-> Course (One-to-Many)
Teacher.hasMany(Course, { foreignKey: 'teacherId', as: 'courses' });
Course.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });

// Batch <-> Course (One-to-Many)
Batch.hasMany(Course, { foreignKey: 'batchId', as: 'courses' });
Course.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });

// Course <-> Routine (One-to-Many)
Course.hasMany(Routine, { foreignKey: 'courseId', as: 'routines' });
Routine.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Teacher <-> Routine (One-to-Many)
Teacher.hasMany(Routine, { foreignKey: 'teacherId', as: 'routines' });
Routine.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });

// Room <-> Routine (One-to-Many)
Room.hasMany(Routine, { foreignKey: 'roomNumber', as: 'routines' });
Routine.belongsTo(Room, { foreignKey: 'roomNumber', as: 'room' });

// Batch <-> Routine (One-to-Many)
Batch.hasMany(Routine, { foreignKey: 'batchId', as: 'routines' });
Routine.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });

export {
  sequelize,
  Admin,
  Teacher,
  Room,
  Batch,
  Course,
  Routine
};
