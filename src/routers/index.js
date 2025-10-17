import authRouter from './auth.js';
import stockRouter from './stock.js';

export default async function router(fastify, options) {
  await fastify.register(authRouter, { prefix: '/auth' });
  await fastify.register(stockRouter, { prefix: '/stock' });
}
