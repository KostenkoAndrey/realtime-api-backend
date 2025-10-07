import Joi from 'joi';
import { isValidObjectId } from 'mongoose';

export const createConversationSchema = Joi.object({
  messages: Joi.array()
    .items(
      Joi.object({
        role: Joi.string().valid('user', 'ai').required(),
        content: Joi.string().required(),
        createdAt: Joi.date().default(() => new Date()),
      }),
    )
    .min(1)
    .required(),
  parentId: Joi.string().custom((value, helper) => {
    if (value && !isValidObjectId(value)) {
      return helper.message('Parent id should be a valid mongo id');
    }
    return value;
  }),
});
