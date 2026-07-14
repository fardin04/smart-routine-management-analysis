import Router from 'express';
import {AuthController} from '../controllers/AuthController';
import {authenticateJWT,AuthenticatedRequest} from '../middleware/auth';
import router from './aiRoutes';

const rotuer = Router();

router.post('/login', AuthController.login);
router.get('/status', authenticateJWT, (req: AuthenticatedRequest, res) => {
  AuthController.checkStatus(req, res);
});

export default router;