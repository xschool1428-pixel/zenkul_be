import mongoose from 'mongoose';
import { logger } from './logger.js';

/**
 * Runs fn in a MongoDB transaction when supported (replica set).
 * Falls back to non-transactional execution on standalone dev MongoDB.
 */
export async function withTransaction(fn) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    await session.abortTransaction().catch(() => {});
    if (
      err.message?.includes('Transaction numbers are only allowed') ||
      err.code === 20 ||
      err.codeName === 'IllegalOperation'
    ) {
      logger.warn('MongoDB transactions unavailable; running without session', {
        code: err.code,
      });
      return fn(null);
    }
    throw err;
  } finally {
    session.endSession();
  }
}
