import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes/index';

const app = express();



// Enable Cross-Origin Resource Sharing
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'https://smart-routine-management.vercel.app/', // Vercel deployment
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Limit handling max JSON request payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health confirmation API
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Map all system model routers
app.use('/api', routes);

// Centralized error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Core Express Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'An unexpected server error occurred.'
  });
});

export default app;
