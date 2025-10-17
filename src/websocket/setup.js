import fastifyWebsocket from '@fastify/websocket';
import { handleAudioConnection } from './audioHandler.js';
import { wsAuthenticate } from '../middlewares/wsAuthenticate.js';

export const setupWebSocket = async (fastify, openai) => {
  await fastify.register(fastifyWebsocket);

  fastify.register(async function (fastify) {
    fastify.addHook('preValidation', async (request, reply) => {
      try {
        const { user } = await wsAuthenticate(request.raw);
        request.user = user;
      } catch (error) {
        reply.code(401).send({ error: 'Unauthorized' });
      }
    });

    fastify.get('/audio', { websocket: true }, (socket, req) => {
      socket.user = req.user;
      handleAudioConnection(socket, openai);
    });
  });
};
