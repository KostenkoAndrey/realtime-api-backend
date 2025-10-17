import fastifyWebsocket from '@fastify/websocket';
import { handleAudioConnection } from './audioHandler.js';
import { wsAuthenticate } from '../middlewares/wsAuthenticate.js';

export const setupWebSocket = async (fastify, openai) => {
  await fastify.register(fastifyWebsocket);

  fastify.register(async function (fastify) {
    // 🆕 Используем preValidation hook для аутентификации
    fastify.addHook('preValidation', async (request, reply) => {
      try {
        const { user } = await wsAuthenticate(request.raw);
        request.user = user;
        console.log('✅ User authenticated in hook:', user.email);
      } catch (error) {
        console.error('❌ Authentication failed:', error.message);
        reply.code(401).send({ error: 'Unauthorized' });
      }
    });

    fastify.get('/audio', { websocket: true }, (socket, req) => {
      console.log('🔌 WebSocket connection established');

      // User уже аутентифицирован в hook
      socket.user = req.user;

      console.log('📞 Calling handleAudioConnection...');
      handleAudioConnection(socket, openai);
      console.log('✅ handleAudioConnection setup complete');
    });
  });
};
