import { Request, Response } from 'express';
import { Routine, Course, Teacher, Room, Batch } from '../models/Index';
import { RoutineScheduler } from '../services/scheduler';

export class RoutineController {

  /**
   * Fetch all scheduled class sessions with relationships populated
   */
  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const routines = await Routine.findAll({
        include: [
          {
            model: Course,
            as: 'course',
            include: [{ model: Teacher, as: 'teacher' }] // nested safety
          },
          { model: Teacher, as: 'teacher' },
          { model: Room, as: 'room' },
          { model: Batch, as: 'batch' }
        ],
        order: [
          ['day', 'ASC'],
          ['slot', 'ASC']
        ]
      });

      res.status(200).json(routines);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch routines.' });
    }
  }

  /**
   * Run the automatic backtracking generator
   */
  public static async generate(req: Request, res: Response): Promise<void> {
    try {
      const scheduler = new RoutineScheduler();
      const result = await scheduler.generateRoutine();

      if (result.success && result.routines) {
        // Persist successful slots in Routine table
        await scheduler.saveGeneratedRoutine(result.routines);
        
        // Return populated schedule
        const newRoutines = await Routine.findAll({
          include: [
            { model: Course, as: 'course' },
            { model: Teacher, as: 'teacher' },
            { model: Room, as: 'room' },
            { model: Batch, as: 'batch' }
          ]
        });

        res.status(200).json({
          success: true,
          message: 'Routine generated and saved successfully.',
          routines: newRoutines
        });
      } else {
        // Return conflicts report back to admin
        res.status(200).json({
          success: false,
          message: 'Routine generation failed due to active constraints.',
          conflicts: result.conflicts
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Server error during routine generation.' });
    }
  }

  /**
   * Clear all generated classes
   */
  public static async clear(req: Request, res: Response): Promise<void> {
    try {
      await Routine.destroy({ truncate: true, where: {} });
      res.status(200).json({ success: true, message: 'All scheduled routines cleared successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to clear routine.' });
    }
  }
}
