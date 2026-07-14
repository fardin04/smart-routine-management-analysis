import { Router } from 'express';
import { RoomController } from '../controllers/RoomController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', RoomController.getAll);
router.post('/', authenticateJWT, RoomController.create);
router.put('/:roomNumber', authenticateJWT, RoomController.update);
router.delete('/:roomNumber', authenticateJWT, RoomController.delete);

export default router;
