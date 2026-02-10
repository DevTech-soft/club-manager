import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { apiLimiter } from './middlewares/rateLimiter';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Security Middleware
 */
// Helmet para headers de seguridad
app.use(helmet({
  contentSecurityPolicy: isProduction ? undefined : false, // Deshabilitar CSP en desarrollo
  crossOriginEmbedderPolicy: false, // Necesario para CORS con credenciales
}));

// CORS configuration for credentials (cookies)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * Performance Middleware
 */
// Compresión gzip para respuestas
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 6, // Balance entre CPU y compresión
}));

// Rate limiting general
app.use('/api/', apiLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

/**
 * Request Logging
 */
// Log de todas las requests
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });
  
  next();
});

/**
 * Health Check Endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * API Routes
 */
app.use('/api', routes);

// Root endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Volleyball Club Manager API is running!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      players: '/api/players',
      teams: '/api/teams',
      coaches: '/api/coaches',
      tournaments: '/api/tournaments',
      attendances: '/api/attendances',
    },
  });
});

/**
 * Error Handling
 */
// Handler para rutas no encontradas (404)
app.use(notFoundHandler);

// Handler centralizado de errores
app.use(errorHandler);

/**
 * Start Server
 */
app.listen(PORT, () => {
  logger.info(`🚀 Backend server is running on http://localhost:${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

/**
 * Graceful Shutdown
 */
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  // Cerrar conexiones de base de datos, etc.
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error({
    message: 'Uncaught Exception',
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({
    message: 'Unhandled Rejection',
    reason,
    promise,
  });
});

export default app;
