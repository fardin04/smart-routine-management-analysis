import { Request, Response } from 'express';
import { Batch } from '../models/Index';

export class BatchController {

  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const batches = await Batch.findAll({
        order: [
          ['batchNumber', 'ASC'],
          ['section', 'ASC']
        ]
      });

      res.status(200).json(batches);
    } catch (err: any) {
      res.status(500).json({
        error: err.message || 'Failed to fetch batches.'
      });
    }
  }

  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const { batchNumber, section, studentCount } = req.body;

      if (!batchNumber || !section || studentCount === undefined) {
        res.status(400).json({
          error: 'Batch Number, Section, and Student Count are required.'
        });
        return;
      }

      const countVal = Number(studentCount);

      if (!Number.isInteger(countVal) || countVal <= 0) {
        res.status(400).json({
          error: 'Student Count must be a positive integer.'
        });
        return;
      }

      const exists = await Batch.findOne({
        where: {
          batchNumber,
          section
        }
      });

      if (exists) {
        res.status(400).json({
          error: `Batch "${batchNumber}" under Section "${section}" already exists.`
        });
        return;
      }

      const batch = await Batch.create({
        batchNumber,
        section,
        studentCount: countVal
      });

      res.status(201).json(batch);

    } catch (err: any) {
      res.status(500).json({
        error: err.message || 'Failed to create batch.'
      });
    }
  }

  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
          error: 'Invalid batch ID.'
        });
        return;
      }

      const { batchNumber, section, studentCount } = req.body;

      if (!batchNumber || !section || studentCount === undefined) {
        res.status(400).json({
          error: 'Batch Number, Section, and Student Count are required.'
        });
        return;
      }

      const countVal = Number(studentCount);

      if (!Number.isInteger(countVal) || countVal <= 0) {
        res.status(400).json({
          error: 'Student Count must be a positive integer.'
        });
        return;
      }

      const batch = await Batch.findByPk(id);

      if (!batch) {
        res.status(404).json({
          error: 'Batch not found.'
        });
        return;
      }

      if (
        batch.batchNumber !== batchNumber ||
        batch.section !== section
      ) {
        const duplicate = await Batch.findOne({
          where: {
            batchNumber,
            section
          }
        });

        if (duplicate && duplicate.id !== batch.id) {
          res.status(400).json({
            error: `Another batch with number "${batchNumber}" and section "${section}" already exists.`
          });
          return;
        }
      }

      batch.batchNumber = batchNumber;
      batch.section = section;
      batch.studentCount = countVal;

      await batch.save();

      res.status(200).json(batch);

    } catch (err: any) {
      res.status(500).json({
        error: err.message || 'Failed to update batch.'
      });
    }
  }

  public static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
          error: 'Invalid batch ID.'
        });
        return;
      }

      const batch = await Batch.findByPk(id);

      if (!batch) {
        res.status(404).json({
          error: 'Batch not found.'
        });
        return;
      }

      await batch.destroy();

      res.status(200).json({
        message: 'Batch deleted successfully.'
      });

    } catch (err: any) {
      res.status(500).json({
        error: err.message || 'Failed to delete batch.'
      });
    }
  }
}