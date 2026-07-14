import { Router } from 'express';
import { TeacherController } from '../controllers/TeacherController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', TeacherController.getAll);
router.post('/', authenticateJWT, TeacherController.create);
router.put('/:id', authenticateJWT, TeacherController.update);
router.delete('/:id', authenticateJWT, TeacherController.delete);

export default router;
