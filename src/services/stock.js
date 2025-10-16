import cron from 'node-cron';
import axios from 'axios';
import { StockCollection } from '../db/models/stock.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { countries } from '../constants/index.js';
import createHttpError from 'http-errors';

const fetchAndSaveStocks = async () => {
  try {
    const apiKey = getEnvVar('POLYGON_IO_API_KEY');
    const url = `${getEnvVar('POLYGON_URL')}/v3/reference/tickers?active=true&limit=1000&apiKey=${apiKey}`;

    const res = await axios.get(url, { timeout: 10000 });
    const { results, status } = res.data;

    if (status !== 'OK' || !results?.length) {
      throw createHttpError('Invalid API response');
    }

    const formatted = results.map((item, index) => {
      const isInternational = (index + 1) % 3 === 0;
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      return {
        name: item.name || 'N/A',
        symbol: item.ticker,
        locale: isInternational ? randomCountry : item.locale || 'us',
        primary_exchange: item.primary_exchange || 'N/A',
        market_cap: item.market_cap || Math.floor(Math.random() * 1_000_000_000_000),
        price: item.last_quote?.p || item.last_trade?.p || Math.random() * 500,
        dailyChange: Number((Math.random() * 4 - 2).toFixed(2)),
        monthlyChange: Number((Math.random() * 10 - 5).toFixed(2)),
        updatedAt: new Date(),
      };
    });

    const bulkOps = formatted.map((stock) => ({
      updateOne: {
        filter: { symbol: stock.symbol },
        update: { $set: stock },
        upsert: true,
      },
    }));

    await StockCollection.bulkWrite(bulkOps);
  } catch (error) {
    error.message;
  }
};

export const startStockUpdateCron = () => {
  cron.schedule('0 * * * *', fetchAndSaveStocks);
  fetchAndSaveStocks();
};

export const getStocksFromDB = async () => {
  const stocks = await StockCollection.find().sort({ updatedAt: -1 });
  if (!stocks.length) {
    throw createHttpError(404, 'No stocks found');
  }

  return stocks;
};
