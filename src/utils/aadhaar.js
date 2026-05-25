import crypto from 'crypto';
import { config } from '../config/index.js';
import { BadRequestError } from './errors.js';

const ALGO = 'aes-256-gcm';
const IV_LEN = 16;
const TAG_LEN = 16;

function getKey() {
  const raw = config.pii.aadhaarEncryptionKey;
  if (!raw || raw.length < 32) {
    throw new Error('AADHAAR_ENCRYPTION_KEY must be at least 32 characters');
  }
  return crypto.createHash('sha256').update(raw).digest();
}

export function normalizeAadhaar(value) {
  const digits = String(value).replace(/\D/g, '');
  if (digits.length !== 12) {
    throw new BadRequestError('Aadhaar must be exactly 12 digits');
  }
  return digits;
}

export function encryptAadhaar(plain) {
  const normalized = normalizeAadhaar(plain);
  const key = getKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(normalized, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decryptAadhaar(encrypted) {
  if (!encrypted) return null;
  const buf = Buffer.from(encrypted, 'base64');
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const data = buf.subarray(IV_LEN + TAG_LEN);
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data) + decipher.final('utf8');
}

export function aadhaarLast4(plain) {
  return normalizeAadhaar(plain).slice(-4);
}

export function maskAadhaar(last4) {
  return last4 ? `XXXX-XXXX-${last4}` : null;
}
