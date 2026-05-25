import { verifyAccessToken } from '../utils/jwt.js';

export function registerSocketHandlers(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.sub;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { schoolId, organizationId } = socket.handshake.query;

    socket.join(`user:${socket.userId}`);
    if (schoolId) socket.join(`school:${schoolId}`);
    if (organizationId) socket.join(`org:${organizationId}`);

    socket.on('join:school', (id) => socket.join(`school:${id}`));
    socket.on('join:organization', (id) => socket.join(`org:${id}`));

    socket.emit('connected', { userId: socket.userId });

    socket.on('ping', () => socket.emit('pong', { ts: Date.now() }));

    socket.on('disconnect', () => {});
  });
}

/** Real-time events emitted by API:
 * fee:paid, subscription:paid, student:created, rating:created,
 * attendance:marked, notification:new
 */
