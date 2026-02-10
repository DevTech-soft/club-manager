import { z } from 'zod';

const TournamentTypeEnum = z.enum(['QUICK', 'STANDARD']);

/**
 * Schema para crear un torneo
 */
export const createTournamentSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  category: z.string().min(1).max(50),
  purpose: z.string().min(1).max(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().min(1).max(200),
  maxParticipants: z.number().int().min(2).max(100),
  registrationDeadline: z.string().datetime(),
  entryFee: z.number().min(0).max(1000000),
  description: z.string().max(2000).optional().default(''),
  rules: z.string().max(2000).optional().default(''),
  prizes: z.string().max(1000).optional().default(''),
  organizerContact: z.string().min(1).max(100),
  type: TournamentTypeEnum.optional().default('STANDARD'),
  quickTeamNames: z.array(z.string()).optional().default([]),
});

/**
 * Schema para actualizar un torneo
 */
export const updateTournamentSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(2).max(100).optional(),
  category: z.string().min(1).max(50).optional(),
  purpose: z.string().min(1).max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.string().min(1).max(200).optional(),
  maxParticipants: z.number().int().min(2).max(100).optional(),
  registrationDeadline: z.string().datetime().optional(),
  entryFee: z.number().min(0).max(1000000).optional(),
  description: z.string().max(2000).optional(),
  rules: z.string().max(2000).optional(),
  prizes: z.string().max(1000).optional(),
  organizerContact: z.string().min(1).max(100).optional(),
  status: z.string().optional(),
});

/**
 * Schema para generar grupos
 */
export const generateGroupsSchema = z.object({
  groupsCount: z.number().int().min(1).max(16),
});

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>;
export type GenerateGroupsInput = z.infer<typeof generateGroupsSchema>;
