import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/index.js';
import {
  swaggerSpec,
  SWAGGER_UI_PATH,
  SWAGGER_JSON_PATH,
  SWAGGER_OPERATION_COUNT,
} from './config/swagger.js';
import rootRoutes from './routes/root.routes.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: config.env === 'development' ? false : undefined,
  })
);
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

// Root & health (NOT under /api)
app.use(rootRoutes);

// Swagger UI — load spec from JSON URL so docs refresh without stale embedded cache
const swaggerNoCache = (_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  next();
};

app.get(SWAGGER_JSON_PATH, swaggerNoCache, (_req, res) => {
  res.json(swaggerSpec);
});
app.use(
  SWAGGER_UI_PATH,
  swaggerNoCache,
  swaggerUi.serve,
  swaggerUi.setup(null, {
    customSiteTitle: `School SaaS API Docs (${SWAGGER_OPERATION_COUNT} endpoints)`,
    swaggerOptions: {
      url: SWAGGER_JSON_PATH,
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      displayRequestDuration: true,
    },
  })
);

// Razorpay webhook — raw body (must be before express.json)
app.use(
  '/api/webhooks/razorpay',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.rawBody = req.body.toString('utf8');
    try {
      req.body = JSON.parse(req.rawBody);
    } catch {
      req.body = {};
    }
    next();
  }
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health' || req.path === '/' || req.path.startsWith('/api/docs'),
  })
);

// All API routes under /api
app.use('/api', apiRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
