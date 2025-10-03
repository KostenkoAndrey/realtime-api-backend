import createHttpError from 'http-errors';
import {
  getAllConversations,
  getConversationsById,
  createConversation,
} from '../services/conversations.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';

export const getConversationsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);

  const conversations = await getAllConversations({
    page,
    perPage,
    sortBy,
    sortOrder,
  });

  res.status(200).json({
    data: conversations,
  });
};

export const getConversationsByIdController = async (req, res) => {
  const { conversationId } = req.params;
  const conversation = await getConversationsById(conversationId);

  if (!conversation) {
    throw createHttpError(404, 'Conversation not found');
  }

  res.json({
    status: 200,
    message: `Successfully found conversation with id ${conversationId}!`,
    data: conversation,
  });
};

export const createConversationController = async (req, res) => {
  const conversation = await createConversation(req.body);

  res.status(201).json({
    status: 201,
    message: `Successfully created a conversation!`,
    data: conversation,
  });
};
