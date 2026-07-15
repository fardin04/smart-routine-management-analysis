import { Request, Response } from 'express';
import { Teacher, Course } from '../models/Index';

export class TeacherController {
  
  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const teachers = await Teacher.findAll({
        order: [['name', 'ASC']]
      });
      res.status(200).json(teachers);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch teachers.' });
    }
  }

  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const { id, name } = req.body;

      if (!id || !name) {
        res.status(400).json({ error: 'Teacher ID and Name are required.' });
        return;
      }

      // Check for duplicates
      const exists = await Teacher.findByPk(String(id));
      if (exists) {
        res.status(400).json({ error: `A teacher with ID "${id}" already exists.` });
        return;
      }

      const teacher = await Teacher.create({ id, name });
      res.status(201).json(teacher);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create teacher.' });
    }
  }

  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Teacher Name is required.' });
        return;
      }

      const teacher = await Teacher.findByPk(String(id));
      if (!teacher) {
        res.status(404).json({ error: 'Teacher not found.' });
        return;
      }

      teacher.name = name;
      await teacher.save();

      res.status(200).json(teacher);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update teacher.' });
    }
  }

  public static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const teacher = await Teacher.findByPk(String(id));
      if (!teacher) {
        res.status(404).json({ error: 'Teacher not found.' });
        return;
      }

      // Check if assigned to any courses first
      const hasCourses = await Course.findOne({ where: { teacherId: String(id) } });
      if (hasCourses) {
        res.status(400).json({ 
          error: 'This teacher cannot be deleted because they are assigned to active courses. Reassign courses first.' 
        });
        return;
      }

      await teacher.destroy();
      res.status(200).json({ message: 'Teacher deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete teacher.' });
    }
  }
}
