import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import { User } from '../models/index.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing access token');
    }
    const token = header.slice(7);
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub);
    if (!user || user.deletedAt || user.status !== 'active') {
      throw new UnauthorizedError('User inactive or not found');
    }
    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    next(err.name === 'JsonWebTokenError' ? new UnauthorizedError('Invalid token') : err);
  }
}
