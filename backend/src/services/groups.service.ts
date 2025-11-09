import { prisma } from '../config/database';

/**
 * Service layer for Tournament Groups
 * Contains all business logic related to tournament groups
 */

/**
 * Get all groups for a specific tournament
 */
export const getGroupsByTournament = async (tournamentId: string) => {
  const groups = await prisma.tournamentGroup.findMany({
    where: { tournamentId },
    include: {
      teams: true,
      matches: true,
    },
    orderBy: { name: 'asc' },
  });

  return groups;
};

/**
 * Get a single group by ID
 */
export const getGroupById = async (id: string) => {
  const group = await prisma.tournamentGroup.findUnique({
    where: { id },
    include: {
      teams: true,
      matches: true,
      tournament: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return group;
};

/**
 * Create a new tournament group
 */
export const createGroup = async (data: {
  tournamentId: string;
  name: string;
}) => {
  const group = await prisma.tournamentGroup.create({
    data: {
      tournamentId: data.tournamentId,
      name: data.name,
    },
    include: {
      teams: true,
      matches: true,
    },
  });

  return group;
};

/**
 * Update a tournament group
 */
export const updateGroup = async (
  id: string,
  data: { name?: string }
) => {
  const group = await prisma.tournamentGroup.update({
    where: { id },
    data,
    include: {
      teams: true,
      matches: true,
    },
  });

  return group;
};

/**
 * Delete a tournament group
 */
export const deleteGroup = async (id: string) => {
  await prisma.tournamentGroup.delete({
    where: { id },
  });

  return { success: true };
};
