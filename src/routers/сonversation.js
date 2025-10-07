import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { isValidId } from '../middlewares/isValidId.js';
import { getConversationsController, getConversationsByIdController, createConversationController } from '../controllers/conversations.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';
import { createConversationSchema } from '../validation/conversations.js';

const router = Router();

router.use(authenticate);
router.get('/', ctrlWrapper(getConversationsController));
router.get('/:conversationsId', isValidId, ctrlWrapper(getConversationsByIdController));
router.post('/', isValidId, validateBody(createConversationSchema), ctrlWrapper(createConversationController));

export default router;
