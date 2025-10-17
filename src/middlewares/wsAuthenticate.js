import { parse } from 'cookie';
import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';
import createHttpError from 'http-errors';

export const wsAuthenticate = async (request) => {
  console.log('🔍 WS Auth - All headers:', request.headers);
  console.log('🔍 WS Auth - Cookie header:', request.headers.cookie);

  const cookies = parse(request.headers.cookie || '');
  console.log('🔍 WS Auth - Parsed cookies:', cookies);

  let { sessionId } = cookies;

  if (!sessionId) {
    console.log('❌ WS Auth - No sessionId in cookies');
    throw createHttpError(401, 'Session cookie not found');
  }

  console.log('🔍 WS Auth - Original sessionId:', sessionId);

  // Обработка подписанных cookies
  if (sessionId.startsWith('j:')) {
    sessionId = sessionId.slice(2);
  }

  // Убираем кавычки если есть
  sessionId = sessionId.replace(/^"(.*)"$/, '$1');

  console.log('🔍 WS Auth - Cleaned sessionId:', sessionId);

  const session = await SessionsCollection.findOne({ _id: sessionId });

  if (!session) {
    console.log('❌ WS Auth - Session not found in DB');
    throw createHttpError(401, 'Session not found');
  }

  console.log('🔍 WS Auth - Session found:', session._id);

  // Проверка истечения сессии
  if (session.refreshTokenValidUntil && new Date() > new Date(session.refreshTokenValidUntil)) {
    console.log('❌ WS Auth - Session expired');
    throw createHttpError(401, 'Session expired');
  }

  const user = await UsersCollection.findById(session.userId);

  if (!user) {
    console.log('❌ WS Auth - User not found');
    throw createHttpError(401, 'User not found');
  }

  console.log('✅ WS Auth - Success! User:', user.email);
  return { user, session };
};
