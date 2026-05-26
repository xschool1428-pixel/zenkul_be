import mongoose from 'mongoose';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

function redactMongoUri(uri = '') {
  return uri.replace(/\/\/([^:@]+):([^@]+)@/, '//$1:<redacted>@');
}

function getMongoHint(errorMessage = '') {
  if (/querySrv ECONNREFUSED/i.test(errorMessage)) {
    return 'Atlas SRV DNS lookup failed. Try the Atlas standard connection string (non-SRV) or switch DNS/network and retry.';
  }

  if (/Authentication failed|bad auth/i.test(errorMessage)) {
    return 'Atlas authentication failed. Recheck the database user credentials in MONGODB_URI.';
  }

  if (/IP.*not allowed|whitelist|not authorized/i.test(errorMessage)) {
    return 'Atlas rejected the current client network. Confirm your IP is allowed in Atlas Network Access.';
  }

  if (/ENOTFOUND|getaddrinfo/i.test(errorMessage)) {
    return 'DNS could not resolve the Atlas host. Check the hostname and DNS settings.';
  }

  return null;
}

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(config.mongodbUri);
    logger.info('MongoDB connected', { host: mongoose.connection.host });
  } catch (error) {
    const hint = getMongoHint(error?.message || '');

    logger.error('MongoDB connection failed', {
      uri: redactMongoUri(config.mongodbUri),
      error: error?.message || String(error),
      ...(hint ? { hint } : {}),
    });

    if (hint && error?.message) {
      error.message = `${error.message}. ${hint}`;
    }

    throw error;
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
