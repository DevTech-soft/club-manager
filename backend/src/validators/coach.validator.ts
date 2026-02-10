import { z } from 'zod';

/**
 * Schema para crear un entrenador
 */
export const createCoachSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50),
  document: z.string().min(5, 'Documento inválido').max(20),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100),
  avatarUrl: z.string().url().optional().default(''),
});

/**
 * Schema para login
 */
export const loginSchema = z.object({
  user: z.string().min(1, 'Usuario requerido'),
  pass: z.string().min(1, 'Contraseña requerida'),
});

export type CreateCoachInput = z.infer<typeof createCoachSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
