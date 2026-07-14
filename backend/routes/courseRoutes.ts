import { Router } from 'express';
import { CourseController } from '../controllers/CourseController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', CourseController.getAll);
router.post('/', authenticateJWT, CourseController.create);
router.put('/:id', authenticateJWT, CourseController.update);
router.delete('/:id', authenticateJWT, CourseController.delete);

export default router;
