import { config } from './index.js';
import { logger } from '../utils/logger.js';

const INSECURE_PATTERNS = [/change-me/i, /dev-access/i, /dev-refresh/i, /^$/];

function isInsecure(value) {
  if (!value) return true;
  return INSECURE_PATTERNS.some((p) => p.test(value));
}

export function validateEnvironment() {
  const required = [
    'MONGODB_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'AADHAAR_ENCRYPTION_KEY',
  ];

  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    logger.warn('Missing environment variables', { missing });
  }

  if (config.env === 'production') {
    for (const key of required) {
      if (isInsecure(process.env[key])) {
        throw new Error(
          `Production startup blocked: set a strong ${key} (min 32 chars, not a default/dev value)`
        );
      }
    }
    if (!process.env.SUPER_ADMIN_EMAIL || !process.env.SUPER_ADMIN_PASSWORD) {
      throw new Error('Production requires SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD');
    }
    logger.info('Production environment validation passed');
  }
}
