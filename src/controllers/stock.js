import { getStocksFromDB } from '../services/stock.js';
import createHttpError from 'http-errors';

export const stockController = async (request, reply) => {
  if (!request.user) {
    throw createHttpError(401, 'User not authenticated');
  }

  const stocks = await getStocksFromDB();

  return reply.status(200).send({
    status: 200,
    message: 'Successfully retrieved stock info!',
    data: stocks,
  });
};
