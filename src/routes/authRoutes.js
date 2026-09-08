import { Router } from 'express';
import { getCurrentTeacher, loginTeacher, registerTeacher } from '../controllers/authController.js';
import { protectTeacher } from '../middleware/authMiddleware.js';

export const authRouter = Router();

authRouter.post('/register', registerTeacher);
authRouter.post('/login', loginTeacher);
authRouter.get('/me', protectTeacher, getCurrentTeacher);
