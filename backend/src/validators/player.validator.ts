import { z } from 'zod';

// Enum mappings para validación
const PositionEnum = z.enum([
  'Setter',
  'Libero',
  'MiddleBlocker',
  'OutsideHitter',
  'OppositeHitter',
]);

const SubCategoryEnum = z.enum(['Basico', 'Intermedio', 'Avanzado']);
const MainCategoryEnum = z.enum(['Masculino', 'Femenino', 'Mixto']);
const AttendanceStatusEnum = z.enum(['Presente', 'Ausente']);

// Schema para stats individuales
const PlayerStatsSchema = z.object({
  attack: z.number().min(1).max(10),
  defense: z.number().min(1).max(10),
  block: z.number().min(1).max(10),
  pass: z.number().min(1).max(10),
});

// Schema para historial de stats
const StatsHistorySchema = z.object({
  stats: PlayerStatsSchema,
  date: z.string().datetime(),
});

/**
 * Schema para crear un nuevo jugador
 */
export const createPlayerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  document: z.string().min(5, 'Documento inválido').max(20),
  address: z.string().min(5).max(200),
  phone: z.string().min(7).max(20),
  birthDate: z.string().datetime(),
  avatarUrl: z.string().url().optional().default(''),
  mainCategories: z.array(MainCategoryEnum).min(1, 'Debe seleccionar al menos una categoría'),
  subCategory: SubCategoryEnum,
  position: PositionEnum,
  statsHistory: z.array(StatsHistorySchema).optional().default([]),
});

/**
 * Schema para actualizar un jugador
 */
export const updatePlayerSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(2).max(100).optional(),
  document: z.string().min(5).max(20).optional(),
  address: z.string().min(5).max(200).optional(),
  phone: z.string().min(7).max(20).optional(),
  birthDate: z.string().datetime().optional(),
  avatarUrl: z.string().url().optional(),
  mainCategories: z.array(MainCategoryEnum).optional(),
  subCategory: SubCategoryEnum.optional(),
  position: PositionEnum.optional(),
  lastPaymentDate: z.string().datetime().nullable().optional(),
  statsHistory: z.array(StatsHistorySchema.extend({
    id: z.string().cuid().optional(),
  })).optional(),
});

/**
 * Schema para registrar asistencia
 */
export const recordAttendanceSchema = z.object({
  playerId: z.string().cuid(),
  status: AttendanceStatusEnum,
});

/**
 * Schema para parámetros de ID
 */
export const idParamSchema = z.object({
  id: z.string().cuid(),
});

/**
 * Schema para documento
 */
export const documentParamSchema = z.object({
  document: z.string().min(5),
});

// Tipos inferidos de los schemas
export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
export type RecordAttendanceInput = z.infer<typeof recordAttendanceSchema>;
