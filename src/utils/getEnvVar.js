import dotenv from 'dotenv';
dotenv.config();
import createHttpError from 'http-errors';

export function getEnvVar(name, defaultValue) {
  const value = process.env[name];
  if (value) return value;
  if (defaultValue) return defaultValue;
  throw createHttpError(`Missing: process.env['${name}'].`);
}
