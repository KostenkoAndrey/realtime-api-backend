import { Router } from 'express';
import authRouter from './auth.js';
import stockRouter from './stock.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/stock', stockRouter);

export default router;
