import mongoose from 'mongoose';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongodbUri);
  logger.info('MongoDB connected', { host: mongoose.connection.host });
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
