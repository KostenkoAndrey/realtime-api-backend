import express from 'express';
import http from 'http';
import pino from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import OpenAI from 'openai';

import { getEnvVar } from './utils/getEnvVar.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import router from './routers/index.js';
import { setupWebSocket } from './websocket/setup.js';
import { startStockUpdateCron } from './services/stock.js';

const PORT = Number(getEnvVar('PORT', '3000'));

export const startServer = () => {
  const app = express();
  const server = http.createServer(app);
  app.use(
    cors({
      // origin: true,
      origin: getEnvVar('APP_DOMAIN'),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app.use(cookieParser());
  app.use(express.json());
  app.use(pino({ transport: { target: 'pino-pretty' } }));

  const openai = new OpenAI({ apiKey: getEnvVar('OPENAI_API_KEY') });
  app.locals.openai = openai;

  setupWebSocket(server, openai);

  app.use(router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 CORS enabled for: ${getEnvVar('APP_DOMAIN')}`);
    console.log(`🌐 WebSocket available at ${getEnvVar('APP_DOMAIN')}/audio`);
    startStockUpdateCron();
  });
};
