import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AiAnalysisController } from '../controllers/AiAnalysisController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Build a robust rate limiter keeping free Gemini API keys safe from heavy spam
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP address to 3 requests per 5 minutes
  message: {
    success: false,
    error: 'Too many analysis requests from this IP. Please wait 5 minutes before calling the Gemini Auditor again.'
  },
  standardHeaders: true, // Return rate limit info in standard response headers
  legacyHeaders: false, // Disable the deprecated X-RateLimit-* headers
});

router.post('/analyze', authenticateJWT, aiLimiter, AiAnalysisController.analyze);

export default router;

