import { Router } from 'express';
import { RoutineController } from '../controllers/RoutineController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', RoutineController.getAll);
router.post('/generate', authenticateJWT, RoutineController.generate);
router.post('/clear', authenticateJWT, RoutineController.clear);

export default router;
