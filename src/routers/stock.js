import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { stockController } from '../controllers/stock.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.get('/info', authenticate, ctrlWrapper(stockController));

export default router;
