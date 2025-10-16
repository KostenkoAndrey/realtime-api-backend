// src/db/models/stock.js
import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      unique: true,
    },
    locale: {
      type: String,
      required: true,
    },
    primary_exchange: {
      type: String,
      default: 'N/A',
    },
    market_cap: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    dailyChange: {
      type: Number,
      default: 0,
    },
    monthlyChange: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const StockCollection = mongoose.model('Stock', stockSchema);
