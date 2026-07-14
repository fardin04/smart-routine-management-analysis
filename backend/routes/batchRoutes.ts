import { Router } from 'express';
import { BatchController } from '../controllers/BatchController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', BatchController.getAll);
router.post('/', authenticateJWT, BatchController.create);
router.put('/:id', authenticateJWT, BatchController.update);
router.delete('/:id', authenticateJWT, BatchController.delete);

export default router;
