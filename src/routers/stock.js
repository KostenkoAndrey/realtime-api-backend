import { stockController } from '../controllers/stock.js';
import { authenticate } from '../middlewares/authenticate.js';

export default async function stockRouter(fastify, options) {
  fastify.get(
    '/info',
    {
      preHandler: authenticate,
    },
    stockController,
  );
}
