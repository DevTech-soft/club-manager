import { z } from 'zod';

const MainCategoryEnum = z.enum(['Masculino', 'Femenino', 'Mixto']);
const SubCategoryEnum = z.enum(['Basico', 'Intermedio', 'Avanzado']);

/**
 * Schema para crear un equipo
 */
export const createTeamSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  mainCategory: MainCategoryEnum,
  subCategory: SubCategoryEnum,
  coachId: z.string().cuid().optional().nullable(),
  tournament: z.string().optional().nullable(),
  tournamentPosition: z.string().optional().nullable(),
  playerIds: z.array(z.string().cuid()).optional().default([]),
});

/**
 * Schema para actualizar un equipo
 */
export const updateTeamSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(2).max(100).optional(),
  mainCategory: MainCategoryEnum.optional(),
  subCategory: SubCategoryEnum.optional(),
  coachId: z.string().cuid().optional().nullable(),
  tournament: z.string().optional().nullable(),
  tournamentPosition: z.string().optional().nullable(),
  playerIds: z.array(z.string().cuid()).optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
