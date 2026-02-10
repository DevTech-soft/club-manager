import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { AppError, isAppError } from '../errors/AppError';

/**
 * Manejador centralizado de errores para Express
 * Captura todos los errores y responde con formato consistente
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log del error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Manejar errores conocidos de la aplicación
  if (isAppError(err)) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err instanceof AppError && 'details' in err && err.details ? { details: err.details } : {}),
      },
    });
  }

  // Manejar errores específicos de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Código P2025: Record to delete/update does not exist
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'El recurso no fue encontrado',
        },
      });
    }

    // Código P2002: Unique constraint violation
    if (err.code === 'P2002') {
      const field = err.meta?.target as string[];
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: `Ya existe un registro con ese ${field?.join(', ') || 'valor'}`,
        },
      });
    }

    // Código P2003: Foreign key constraint failed
    if (err.code === 'P2003') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_VIOLATION',
          message: 'El recurso relacionado no existe',
        },
      });
    }
  }

  // Manejar errores de validación de Prisma
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos inválidos proporcionados',
      },
    });
  }

  // Error genérico para producción (no exponer detalles)
  const isDev = process.env.NODE_ENV === 'development';
  
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor',
      ...(isDev && { stack: err.stack }),
    },
  });
};

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Ruta ${req.originalUrl} no encontrada`,
    },
  });
};

/**
 * Handler para errores no capturados en async handlers
 * Uso: wrapAsync(controllerFunction)
 */
export const wrapAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
