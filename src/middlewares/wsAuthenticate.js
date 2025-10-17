import { parse } from 'cookie';
import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';
import createHttpError from 'http-errors';

export const wsAuthenticate = async (request) => {
  const cookies = parse(request.headers.cookie || '');

  let { sessionId } = cookies;

  if (!sessionId) {
    throw createHttpError(401, 'Session cookie not found');
  }

  if (sessionId.startsWith('j:')) {
    sessionId = sessionId.slice(2);
  }

  sessionId = sessionId.replace(/^"(.*)"$/, '$1');

  const session = await SessionsCollection.findOne({ _id: sessionId });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  if (session.refreshTokenValidUntil && new Date() > new Date(session.refreshTokenValidUntil)) {
    throw createHttpError(401, 'Session expired');
  }

  const user = await UsersCollection.findById(session.userId);

  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  return { user, session };
};
