import rateLimit from 'express-rate-limit';
import { TooManyRequestsError } from '../errors/AppError';

/**
 * Opciones base para rate limiting
 */
const baseOptions = {
  standardHeaders: true, // Devolver info en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilitar headers `X-RateLimit-*`
  skipSuccessfulRequests: false,
};

/**
 * Rate limiter general para API
 * 100 requests por 15 minutos por IP
 */
export const apiLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite por IP
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiadas solicitudes, por favor intente más tarde',
    },
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * Rate limiter más estricto para endpoints de autenticación
 * 5 intentos por 15 minutos
 */
export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  skipSuccessfulRequests: true, // No contar logins exitosos
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiados intentos de login. Por favor espere 15 minutos.',
    },
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * Rate limiter para operaciones de escritura
 * Más permisivo para lecturas, más restrictivo para escrituras
 */
export const writeLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 operaciones de escritura por minuto
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiadas operaciones de escritura. Por favor espere un momento.',
    },
  },
});

/**
 * Rate limiter para uploads (imágenes, archivos)
 * Muy restrictivo debido al tamaño
 */
export const uploadLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 uploads por minuto
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiadas subidas de archivos. Por favor espere.',
    },
  },
});
