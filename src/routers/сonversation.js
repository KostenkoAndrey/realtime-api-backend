import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { isValidId } from '../middlewares/isValidId.js';
import {
  getConversationsController,
  getConversationsByIdController,
  createConversationController,
} from '../controllers/conversations.js';

const router = Router();

router.get('/', ctrlWrapper(getConversationsController));
router.get(
  '/:conversationsId',
  isValidId,
  ctrlWrapper(getConversationsByIdController),
);
router.post('/', ctrlWrapper(createConversationController));

export default router;
