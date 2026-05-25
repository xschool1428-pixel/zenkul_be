import { Router } from 'express';
import mongoose from 'mongoose';
import { config } from '../config/index.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'School SaaS API server is running',
    service: 'school-saas-api',
    version: '2.1.0',
    docs: '/api/docs',
    health: '/health',
    api: '/api',
    timestamp: new Date().toISOString(),
  });
});

router.get('/health', async (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbOk = dbState === 1;
  const statusCode = dbOk ? 200 : 503;

  res.status(statusCode).json({
    success: dbOk,
    status: dbOk ? 'ok' : 'degraded',
    statusCode,
    service: 'school-saas-api',
    version: '2.1.0',
    env: config.env,
    uptime: process.uptime(),
    checks: {
      database: {
        status: dbOk ? 'up' : 'down',
        state: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] ?? 'unknown',
      },
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
