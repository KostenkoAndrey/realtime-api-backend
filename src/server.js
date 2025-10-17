import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import OpenAI from 'openai';

import { getEnvVar } from './utils/getEnvVar.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import router from './routers/index.js';
import { setupWebSocket } from './websocket/setup.js';
import { startStockUpdateCron } from './services/stock.js';

const PORT = Number(getEnvVar('PORT', '3000'));

export const startServer = async () => {
  const fastify = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  await fastify.register(fastifyCors, {
    origin: getEnvVar('APP_DOMAIN'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await fastify.register(fastifyCookie);

  const openai = new OpenAI({ apiKey: getEnvVar('OPENAI_API_KEY') });
  fastify.decorate('openai', openai);

  await setupWebSocket(fastify, openai);

  await fastify.register(router);

  fastify.setNotFoundHandler(notFoundHandler);
  fastify.setErrorHandler(errorHandler);

  try {
    await fastify.listen({
      port: PORT,
      host: '0.0.0.0',
    });

    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 CORS enabled for: ${getEnvVar('APP_DOMAIN')}`);
    console.log(`🌐 WebSocket available at ${getEnvVar('APP_DOMAIN')}/audio`);

    startStockUpdateCron();
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
