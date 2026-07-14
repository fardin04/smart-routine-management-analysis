import path from 'path';
import express from 'express';
import app from './app';
import { sequelize } from './models/Index';
import bcrypt from 'bcryptjs';
import { Admin } from './models/Admin';

const PORT = parseInt(process.env.PORT || '3000', 10);
async function bootstrap() {
  try {
    console.log('Checking database connection and synchronizing models...');
    try {
      await sequelize.sync({ force: false });
      console.log('Database synced successfully.');

      // Seed default admin if user tables are blank
      const adminCount = await Admin.count();
      if (adminCount === 0) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        await Admin.create({
          username: 'admin',
          password: hashedPassword,
        });
        console.log('==================================================');
        console.log('DEFAULT ADMINISTRATOR SEEDED SUCCESSFULLY!');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('==================================================');
      }
    } catch (dbError: any) {
      console.error('==================================================');
      console.error('DATABASE INITIALIZATION ERROR:'+ '⚠️');
      console.error(dbError.message || dbError);
      console.error('--------------------------------------------------');
      console.error('To run with PostgreSQL, make sure your PostgreSQL server is active');
      console.error('and configured in your environmental variables.');
      console.error('If you are in development, the system will continue to boot.');
      console.error('==================================================');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`========================================================`);
      console.log(` University Routine Manager Server listening on port ${PORT} `);
      console.log(` Dev URL: http://localhost:${PORT}                      `);
      console.log(`========================================================`);
    });

  } catch (error) {
    console.error('Fatal initialization error:', error);
    process.exit(1);
  }
}

bootstrap();
