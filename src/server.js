import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { config } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { validateEnvironment } from './config/validateEnv.js';
import { initSocket } from './services/socket.service.js';
import { registerSocketHandlers } from './sockets/index.js';
import { runStartupBootstrap } from './bootstrap/index.js';
import { logger } from './utils/logger.js';

let server;

async function bootstrap() {
  validateEnvironment();
  await connectDatabase();
  await runStartupBootstrap();

  server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST'],
    },
  });

  initSocket(io);
  registerSocketHandlers(io);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${config.port} is already in use`, { port: config.port });
      process.exit(1);
    }
    throw err;
  });

  server.listen(config.port, () => {
    const base = `http://localhost:${config.port}`;
    logger.info('Server started', {
      port: config.port,
      env: config.env,
      docs: `${base}/api/docs`,
    });
  });
}

async function shutdown(signal) {
  logger.info('Shutting down', { signal });
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', {
    message: reason?.message || String(reason),
    stack: reason?.stack,
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception — shutting down', { message: err.message, stack: err.stack });
  shutdown('uncaughtException').finally(() => process.exit(1));
});

bootstrap().catch((err) => {
  logger.error('Failed to start server', { error: err.message });
  process.exit(1);
});
