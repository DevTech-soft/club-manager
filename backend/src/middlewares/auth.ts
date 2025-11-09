import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
  JWT_SECRET,
  TOKEN_EXPIRATION,
  REFRESH_EXPIRATION,
  ACCESS_TOKEN_COOKIE_OPTIONS,
} from '../config/constants';

// Extender el tipo Request de Express para incluir información del usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: string;
        role: 'admin' | 'superadmin' | 'coach';
      };
    }
  }
}

/**
 * Middleware de autenticación que verifica el JWT token desde las cookies.
 * Si el accessToken es válido, agrega la información del usuario a req.user.
 * Si el accessToken expiró pero el refreshToken es válido, renueva el accessToken.
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    // Verificar si existe el accessToken
    if (!accessToken) {
      return res.status(401).json({ message: "No access token provided" });
    }

    try {
      // Intentar verificar el accessToken
      const decoded = jwt.verify(accessToken, JWT_SECRET) as {
        id?: string;
        role: 'admin' | 'superadmin' | 'coach';
      };

      // Agregar información del usuario al request
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };

      return next();
    } catch (error: any) {
      // Si el accessToken expiró, intentar renovarlo con el refreshToken
      if (error.name === 'TokenExpiredError' && refreshToken) {
        try {
          // Verificar el refreshToken
          const refreshDecoded = jwt.verify(refreshToken, JWT_SECRET) as {
            id?: string;
            role: 'admin' | 'superadmin' | 'coach';
          };

          // Generar un nuevo accessToken
          const newAccessToken = jwt.sign(
            { id: refreshDecoded.id, role: refreshDecoded.role },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRATION }
          );

          // Actualizar la cookie con el nuevo accessToken
          res.cookie("accessToken", newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

          // Agregar información del usuario al request
          req.user = {
            id: refreshDecoded.id,
            role: refreshDecoded.role,
          };

          return next();
        } catch (refreshError) {
          return res.status(401).json({ message: "Invalid refresh token" });
        }
      }

      // Si el token no es válido por otra razón
      return res.status(401).json({ message: "Invalid access token" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Middleware de autorización que verifica si el usuario tiene uno de los roles permitidos.
 * Debe usarse después del middleware authenticate.
 *
 * @param allowedRoles - Array de roles permitidos para acceder a la ruta
 *
 * @example
 * // Solo admins y superadmins pueden acceder
 * app.get('/api/admin-only', authenticate, authorize(['admin', 'superadmin']), handler);
 *
 * @example
 * // Todos los usuarios autenticados pueden acceder
 * app.get('/api/protected', authenticate, authorize(['admin', 'superadmin', 'coach']), handler);
 */
export const authorize = (allowedRoles: Array<'admin' | 'superadmin' | 'coach'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Verificar si el usuario está autenticado
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Verificar si el usuario tiene uno de los roles permitidos
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: You don't have permission to access this resource"
      });
    }

    next();
  };
};

/**
 * Middleware opcional de autenticación.
 * Si hay un token válido, agrega req.user, pero no bloquea el acceso si no hay token.
 * Útil para rutas que pueden funcionar tanto para usuarios autenticados como no autenticados.
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    if (!accessToken) {
      return next(); // Continuar sin autenticación
    }

    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET) as {
        id?: string;
        role: 'admin' | 'superadmin' | 'coach';
      };

      req.user = {
        id: decoded.id,
        role: decoded.role,
      };

      return next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError' && refreshToken) {
        try {
          const refreshDecoded = jwt.verify(refreshToken, JWT_SECRET) as {
            id?: string;
            role: 'admin' | 'superadmin' | 'coach';
          };

          const newAccessToken = jwt.sign(
            { id: refreshDecoded.id, role: refreshDecoded.role },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRATION }
          );

          res.cookie("accessToken", newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

          req.user = {
            id: refreshDecoded.id,
            role: refreshDecoded.role,
          };

          return next();
        } catch (refreshError) {
          // Token inválido pero no bloqueamos el acceso
          return next();
        }
      }

      // Token inválido pero no bloqueamos el acceso
      return next();
    }
  } catch (error) {
    console.error("Optional authentication error:", error);
    return next(); // Continuar sin autenticación en caso de error
  }
};
