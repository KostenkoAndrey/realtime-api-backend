import { generateAuthUrl } from '../utils/googleOAuth2.js';
import { ONE_DAY, COOKIE_OPTIONS } from '../constants/index.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUsersSession,
  requestResetToken,
  resetPassword,
  loginOrSignupWithGoogle,
} from '../services/auth.js';

export const registerUserController = async (request, reply) => {
  const user = await registerUser(request.body);

  return reply.status(201).send({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const loginUserController = async (request, reply) => {
  const { session, user } = await loginUser(request.body);

  reply.setCookie('refreshToken', session.refreshToken, {
    ...COOKIE_OPTIONS,
    expires: new Date(Date.now() + ONE_DAY),
  });

  reply.setCookie('sessionId', session._id.toString(), {
    ...COOKIE_OPTIONS,
    expires: new Date(Date.now() + ONE_DAY),
  });

  return reply.send({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      ...user,
    },
  });
};

export const logoutUserController = async (request, reply) => {
  if (request.cookies.sessionId) {
    await logoutUser(request.cookies.sessionId);
  }

  reply.setCookie('sessionId', '', {
    ...COOKIE_OPTIONS,
    expires: new Date(0),
    maxAge: -1,
  });

  reply.setCookie('refreshToken', '', {
    ...COOKIE_OPTIONS,
    expires: new Date(0),
    maxAge: -1,
  });

  return reply.status(204).send();
};

const setupSession = (reply, session) => {
  reply.setCookie('refreshToken', session.refreshToken, {
    ...COOKIE_OPTIONS,
    expires: new Date(Date.now() + ONE_DAY),
  });

  reply.setCookie('sessionId', session._id, {
    ...COOKIE_OPTIONS,
    expires: new Date(Date.now() + ONE_DAY),
  });
};

export const refreshUserSessionController = async (request, reply) => {
  const session = await refreshUsersSession({
    sessionId: request.cookies.sessionId,
    refreshToken: request.cookies.refreshToken,
  });

  setupSession(reply, session);

  return reply.send({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const requestResetEmailController = async (request, reply) => {
  await requestResetToken(request.body.email);

  return reply.send({
    message: 'Reset password email was successfully sent!',
    status: 200,
    data: {},
  });
};

export const resetPasswordController = async (request, reply) => {
  await resetPassword(request.body);

  return reply.send({
    message: 'Password was successfully reset!!',
    status: 200,
    data: {},
  });
};

export const getGoogleOAuthUrlController = async (request, reply) => {
  const url = generateAuthUrl();

  return reply.send({
    status: 200,
    message: 'Successfully get Google OAuth url!',
    data: {
      url,
    },
  });
};

export const loginWithGoogleController = async (request, reply) => {
  const session = await loginOrSignupWithGoogle(request.body.code);

  setupSession(reply, session.session);

  return reply.send({
    status: 200,
    message: 'Successfully logged in via Google OAuth!',
    data: {
      ...session.user,
    },
  });
};
