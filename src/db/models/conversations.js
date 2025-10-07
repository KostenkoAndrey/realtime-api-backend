import { model, Schema } from 'mongoose';

const conversationsSchema = new Schema(
  {
    messages: [
      {
        role: { type: String, enum: ['user', 'ai'], required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ConversationsCollection = model('conversations', conversationsSchema);
