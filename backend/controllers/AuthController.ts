import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Index';

const JWT_SECRET = process.env.JWT_SECRET || 'university-routine-secret-key-9988';

export class AuthController {
  
  /**
   * Admin authenticate handler
   */
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }


      const admin = await Admin.findOne({ where: { username } });

      if (!admin) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate JWT
      const token = jwt.sign(
        { id: admin.id, username: admin.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: { id: admin.id, username: admin.username }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  /**
   * Check status of logged in administrator
   */
  public static async checkStatus(req: Request & { user?: any }, res: Response): Promise<void> {
    if (req.user) {
      res.status(200).json({ authenticated: true, user: req.user });
    } else {
      res.status(401).json({ authenticated: false });
    }
  }
}
