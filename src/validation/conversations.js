export const createConversationSchema = {
  body: {
    type: 'object',
    required: ['messages'],
    properties: {
      messages: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['role', 'content'],
          properties: {
            role: {
              type: 'string',
              enum: ['user'],
            },
            content: {
              type: 'string',
              minLength: 1,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
      parentId: {
        type: 'string',
        nullable: true,
      },
    },
  },
};
