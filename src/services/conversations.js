import { ConversationsCollection } from '../db/models/conversations.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

export const getAllConversations = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const conversationsQuery = ConversationsCollection.find();
  const conversationsCount = await ConversationsCollection.find()
    .merge(conversationsQuery)
    .countDocuments();

  const conversations = await conversationsQuery
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .exec();

  const paginationData = calculatePaginationData(
    conversationsCount,
    perPage,
    page,
  );

  return {
    data: conversations,
    ...paginationData,
  };
};

export const getConversationsById = async (conversationsId) => {
  const conversation = await ConversationsCollection.findById(conversationsId);
  return conversation;
};

export const createConversation = async (payload) => {
  const conversation = await ConversationsCollection.create(payload);
  return conversation;
};
