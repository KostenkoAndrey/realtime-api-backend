import { Router } from 'express';
import studentsRouter from './сonversation.js';

const router = Router();
router.use('/conversations', studentsRouter);
export default router;
