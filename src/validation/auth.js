export const registerUserSchema = {
  type: 'object',
  required: ['name', 'email', 'password'],
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      maxLength: 30,
    },
    email: {
      type: 'string',
      format: 'email',
      minLength: 6,
      maxLength: 30,
    },
    password: {
      type: 'string',
      minLength: 8,
      maxLength: 30,
    },
  },
  additionalProperties: false,
};

export const loginUserSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
    },
  },
  additionalProperties: false,
};

export const requestResetEmailSchema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
  },
  additionalProperties: false,
};

export const resetPasswordSchema = {
  type: 'object',
  required: ['password', 'token'],
  properties: {
    password: {
      type: 'string',
      minLength: 8,
      maxLength: 30,
    },
    token: {
      type: 'string',
    },
  },
  additionalProperties: false,
};

export const loginWithGoogleOAuthSchema = {
  type: 'object',
  required: ['code'],
  properties: {
    code: {
      type: 'string',
    },
  },
  additionalProperties: false,
};
