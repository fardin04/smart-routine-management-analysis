import { Request, Response } from 'express';
import { Course, Teacher, Batch } from '../models/Index';

export class CourseController {
  
  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const courses = await Course.findAll({
        include: [
          { model: Teacher, as: 'teacher' },
          { model: Batch, as: 'batch' }
        ],
        order: [['courseCode', 'ASC']]
      });
      res.status(200).json(courses);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch courses.' });
    }
  }

  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const { courseName, courseCode, courseType, teacherId, batchId } = req.body;

      if (!courseName || !courseCode || !courseType || !batchId) {
        res.status(400).json({ error: 'Course Name, Code, Type, and Batch designation are required.' });
        return;
      }

      if (courseType !== 'Theory' && courseType !== 'Lab') {
        res.status(400).json({ error: 'Type must be "Theory" or "Lab".' });
        return;
      }

      // Check if batch exists
      const targetBatch = await Batch.findByPk(batchId);
      if (!targetBatch) {
        res.status(400).json({ error: 'The specified batch-section does not exist.' });
        return;
      }

      // Check teacher if provided
      if (teacherId) {
        const targetTeacher = await Teacher.findByPk(teacherId);
        if (!targetTeacher) {
          res.status(400).json({ error: 'The assigned teacher does not exist.' });
          return;
        }
      }

      const course = await Course.create({
        courseName,
        courseCode,
        courseType,
        teacherId: teacherId || null,
        batchId
      });

      // Reload with joins
      const fullCourse = await Course.findByPk(course.id, {
        include: [
          { model: Teacher, as: 'teacher' },
          { model: Batch, as: 'batch' }
        ]
      });

      res.status(201).json(fullCourse);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create course.' });
    }
  }

  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

if (!Number.isInteger(id) || id <= 0) {
  res.status(400).json({ error: 'Invalid course ID.' });
  return;
}
      const { courseName, courseCode, courseType, teacherId, batchId } = req.body;

      if (!courseName || !courseCode || !courseType || !batchId) {
        res.status(400).json({ error: 'Course fields are mandatory.' });
        return;
      }

      const course = await Course.findByPk(id);
      if (!course) {
        res.status(404).json({ error: 'Course not found.' });
        return;
      }

      const targetBatch = await Batch.findByPk(batchId);
      if (!targetBatch) {
        res.status(400).json({ error: 'The specified batch-section does not exist.' });
        return;
      }

      if (teacherId) {
        const targetTeacher = await Teacher.findByPk(teacherId);
        if (!targetTeacher) {
          res.status(400).json({ error: 'Assigned teacher not found.' });
          return;
        }
      }

      course.courseName = courseName;
      course.courseCode = courseCode;
      course.courseType = courseType;
      course.teacherId = teacherId || null;
      course.batchId = batchId;
      await course.save();

      const fullCourse = await Course.findByPk(course.id, {
        include: [
          { model: Teacher, as: 'teacher' },
          { model: Batch, as: 'batch' }
        ]
      });

      res.status(200).json(fullCourse);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update course.' });
    }
  }

  public static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ error: 'Invalid course ID.' });
        return;
      }

      const course = await Course.findByPk(id);
      if (!course) {
        res.status(404).json({ error: 'Course not found.' });
        return;
      }

      await course.destroy();
      res.status(200).json({ message: 'Course deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete course.' });
    }
  }
}
