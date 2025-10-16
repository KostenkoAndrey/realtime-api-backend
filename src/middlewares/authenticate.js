import createHttpError from 'http-errors';

import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';

export const authenticate = async (req, res, next) => {
  const { sessionId } = req.cookies;

  if (!sessionId) {
    return next(createHttpError(401, 'Session cookie not found'));
  }

  const session = await SessionsCollection.findOne({ _id: sessionId });

  if (!session) {
    return next(createHttpError(401, 'Session not found'));
  }

  if (session.expires && new Date() > new Date(session.expires)) {
    return next(createHttpError(401, 'Session expired'));
  }

  const user = await UsersCollection.findById(session.userId);

  if (!user) {
    return next(createHttpError(401, 'User not found'));
  }

  req.user = user;
  next();
};
