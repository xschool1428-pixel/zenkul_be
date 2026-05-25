import { User, RefreshToken } from '../models/index.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../utils/jwt.js';

export async function registerUser({ email, password, firstName, lastName, phone }) {
  const exists = await User.findOne({ email, deletedAt: null });
  if (exists) throw new BadRequestError('Email already registered');

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    email,
    passwordHash,
    firstName,
    lastName,
    phone,
  });

  return issueTokens(user);
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email, deletedAt: null }).select('+passwordHash');
  if (!user) throw new UnauthorizedError('Invalid credentials');

  const ok = await user.comparePassword(password);
  if (!ok) throw new UnauthorizedError('Invalid credentials');

  user.lastLoginAt = new Date();
  await user.save();

  return issueTokens(user);
}

async function issueTokens(user) {
  const payload = { sub: String(user._id), email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(refreshToken) {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const stored = await RefreshToken.findOne({
    userId: decoded.sub,
    tokenHash: hashToken(refreshToken),
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!stored) throw new UnauthorizedError('Refresh token revoked or expired');

  const user = await User.findById(decoded.sub);
  if (!user || user.deletedAt) throw new UnauthorizedError('User not found');

  const accessToken = signAccessToken({ sub: String(user._id), email: user.email });
  return { accessToken, user: sanitizeUser(user) };
}

export async function logoutUser(refreshToken) {
  if (!refreshToken) return;
  await RefreshToken.updateMany(
    { tokenHash: hashToken(refreshToken) },
    { revokedAt: new Date() }
  );
}

function sanitizeUser(user) {
  return {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    status: user.status,
  };
}
