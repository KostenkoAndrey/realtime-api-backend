import {
  registerUserSchema,
  loginUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
  loginWithGoogleOAuthSchema,
} from '../validation/auth.js';
import {
  registerUserController,
  loginUserController,
  logoutUserController,
  refreshUserSessionController,
  requestResetEmailController,
  resetPasswordController,
  getGoogleOAuthUrlController,
  loginWithGoogleController,
} from '../controllers/auth.js';

export default async function authRouter(fastify, options) {
  fastify.post(
    '/register',
    {
      schema: {
        body: registerUserSchema,
      },
    },
    registerUserController,
  );

  fastify.post(
    '/login',
    {
      schema: {
        body: loginUserSchema,
      },
    },
    loginUserController,
  );

  fastify.post('/logout', logoutUserController);

  fastify.post('/refresh', refreshUserSessionController);

  fastify.post(
    '/request-reset-email',
    {
      schema: {
        body: requestResetEmailSchema,
      },
    },
    requestResetEmailController,
  );

  fastify.post(
    '/reset-password',
    {
      schema: {
        body: resetPasswordSchema,
      },
    },
    resetPasswordController,
  );

  fastify.get('/get-oauth-url', getGoogleOAuthUrlController);

  fastify.post(
    '/confirm-oauth',
    {
      schema: {
        body: loginWithGoogleOAuthSchema,
      },
    },
    loginWithGoogleController,
  );
}
