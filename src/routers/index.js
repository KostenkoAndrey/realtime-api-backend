import { Router } from 'express';
import conversationsRouter from './сonversation.js';
import authRouter from './auth.js';

const router = Router();

router.use('/conversations', conversationsRouter);
router.use('/auth', authRouter);

export default router;
