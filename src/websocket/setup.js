import { WebSocketServer } from 'ws';
import { handleAudioConnection } from './audioHandler.js';
import { wsAuthenticate } from '../middlewares/wsAuthenticate.js';

export const setupWebSocket = (server, openai) => {
  const wss = new WebSocketServer({
    server,
    path: '/audio',
    verifyClient: async (info, callback) => {
      try {
        const { user } = await wsAuthenticate(info.req);

        info.req.user = user;

        callback(true);
      } catch (error) {
        console.error('❌ WebSocket authentication failed:', error.message);
        callback(false, 401, 'Unauthorized');
      }
    },
  });

  wss.on('connection', (ws, request) => {
    ws.user = request.user;
    handleAudioConnection(ws, openai);
  });

  return wss;
};
