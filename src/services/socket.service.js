let io = null;

export function initSocket(socketServer) {
  io = socketServer;
}

export function getIO() {
  return io;
}

export function emitToSchool(schoolId, event, data) {
  if (io) io.to(`school:${schoolId}`).emit(event, data);
}

export function emitToOrganization(organizationId, event, data) {
  if (io) io.to(`org:${organizationId}`).emit(event, data);
}

export function emitToUser(userId, event, data) {
  if (io) io.to(`user:${userId}`).emit(event, data);
}
