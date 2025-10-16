import { getStocksFromDB } from '../services/stock.js';
import createHttpError from 'http-errors';

export const stockController = async (req, res, next) => {
  if (!req.user) {
    return next(createHttpError(401, 'User not authenticated'));
  }

  const stocks = await getStocksFromDB();

  res.status(200).json({
    status: 200,
    message: 'Successfully retrieved stock info!',
    data: stocks,
  });
};
