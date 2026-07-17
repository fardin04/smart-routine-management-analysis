import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes/index';

const app = express();



app.use((req, res, next): void => {
    const origin = req.headers.origin;
    const fallbackClientUrl = process.env.CLIENT_URL || 'https://zenithethnic.com';
    const configuredOrigins = [
      process.env.CLIENT_URL,
      process.env.ALLOWED_ORIGINS,
      'https://smart-routine-management.vercel.app',
      'https://www.smart-routine-management.vercel.app',
      'https://smart-routine-management.vercel.app/',
      'http://localhost:3000',
      'http://localhost:5173'
    ]
      .filter(Boolean)
      .flatMap((value) => String(value).split(','))
      .map((value) => value.trim())
      .filter(Boolean);

    const allowedOrigins = new Set(configuredOrigins);

    // Deployment marker: update to trigger a clean redeploy after origin changes.
    if (origin && (allowedOrigins.has(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', fallbackClientUrl);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight request immediately
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });
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
