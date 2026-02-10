import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodIssue } from 'zod';

/**
 * Formatea errores de Zod para respuesta API
 */
const formatZodErrors = (errors: ZodIssue[]) => {
  return errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

/**
 * Middleware factory para validar request body con Zod
 * @param schema - Schema de Zod para validar
 */
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      // Reemplazar el body con los datos validados (y transformados)
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Error de validación',
            details: formatZodErrors(error.issues),
          },
        });
      }
      next(error);
    }
  };
};

/**
 * Middleware factory para validar parámetros de URL con Zod
 * @param schema - Schema de Zod para validar
 */
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.params);
      // Merge con los params existentes para no perder otros params
      Object.assign(req.params, validatedData);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Parámetros inválidos',
            details: formatZodErrors(error.issues),
          },
        });
      }
      next(error);
    }
  };
};

/**
 * Middleware factory para validar query params con Zod
 * @param schema - Schema de Zod para validar
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.query);
      // Merge con los query params existentes
      Object.assign(req.query, validatedData);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query params inválidos',
            details: formatZodErrors(error.issues),
          },
        });
      }
      next(error);
    }
  };
};

/**
 * Helper para crear schemas de paginación
 */
export const paginationSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => {
    const parsed = val ? parseInt(val, 10) : 20;
    return Math.min(parsed, 100); // Máximo 100 items por página
  }),
});

export type PaginationParams = z.infer<typeof paginationSchema>;
