import { Request, Response } from 'express';
import { Room } from '../models/Index';
import { stringify } from 'node:querystring';

export class RoomController {
  
  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const rooms = await Room.findAll({
        order: [['roomNumber', 'ASC']]
      });
      res.status(200).json(rooms);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch rooms.' });
    }
  }

  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const { roomNumber, capacity, type } = req.body;

      if (!roomNumber || !capacity || !type) {
        res.status(400).json({ error: 'Room Number, Capacity, and Type are required.' });
        return;
      }

      if (type !== 'Classroom' && type !== 'Laboratory') {
        res.status(400).json({ error: 'Room Type must be either "Classroom" or "Laboratory".' });
        return;
      }

      const capacityVal = parseInt(capacity, 10);
      if (isNaN(capacityVal) || capacityVal <= 0) {
        res.status(400).json({ error: 'Capacity must be a positive integer.' });
        return;
      }

      // Check for duplicate roomNumber
      const exists = await Room.findByPk(roomNumber);
      if (exists) {
        res.status(400).json({ error: `Room ${roomNumber} already exists in the system.` });
        return;
      }

      const room = await Room.create({
        roomNumber,
        capacity: capacityVal,
        type
      });

      res.status(201).json(room);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create room.' });
    }
  }

  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const roomNumber = req.params.roomNumber;

if (!roomNumber) {
  res.status(400).json({ error: 'Invalid room number.' });
  return;
}
      const { capacity, type } = req.body;

      if (!capacity || !type) {
        res.status(400).json({ error: 'Capacity and Type are required.' });
        return;
      }

      if (type !== 'Classroom' && type !== 'Laboratory') {
        res.status(400).json({ error: 'Room Type must be "Classroom" or "Laboratory".' });
        return;
      }

      const capacityVal = parseInt(capacity, 10);
      if (isNaN(capacityVal) || capacityVal <= 0) {
        res.status(400).json({ error: 'Capacity must be positive.' });
        return;
      }

      const room = await Room.findByPk(String(roomNumber));
      if (!room) {
        res.status(404).json({ error: 'Room not found.' });
        return;
      }

      
      const updated = await room.update({ capacity: capacityVal, type });

      res.status(200).json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update room.' });
    }
  }

  public static async delete(req: Request, res: Response): Promise<void> {
    try {
      const roomNumber = Number(req.params.roomNumber);

      const room = await Room.findByPk(roomNumber);
      if (!room) {
        res.status(404).json({ error: 'Room not found.' });
        return;
      }

      await room.destroy();
      res.status(200).json({ message: 'Room deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete room.' });
    }
  }
}
