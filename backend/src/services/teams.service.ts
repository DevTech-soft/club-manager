import { prisma } from '../config/database';
import type { Team } from '../types';
import { mapTeamForFrontend, subCategoryToPrisma } from '../utils/mappers';

/**
 * Service layer for Teams
 * Contains all business logic related to teams
 */

/**
 * Get all teams with their players
 */
export const getAllTeams = async () => {
  const teams = await prisma.team.findMany({
    include: {
      players: {
        select: { id: true },
      },
    },
  });
  return teams.map(mapTeamForFrontend);
};

/**
 * Get a single team by ID
 */
export const getTeamById = async (id: string) => {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      players: {
        select: { id: true },
      },
      coach: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  if (!team) {
    return null;
  }

  return mapTeamForFrontend(team);
};

/**
 * Get all teams for a specific player
 */
export const getPlayerTeams = async (playerId: string) => {
  const teams = await prisma.team.findMany({
    where: {
      players: {
        some: {
          id: playerId,
        },
      },
    },
    include: {
      players: {
        select: { id: true },
      },
    },
  });
  return teams.map(mapTeamForFrontend);
};

/**
 * Create a new team
 */
export const createTeam = async (teamData: Omit<Team, 'id' | 'coach'>) => {
  const { playerIds, coachId, ...restTeamData } = teamData;

  // Map subCategory to Prisma enum
  const mappedSubCategory = subCategoryToPrisma[restTeamData.subCategory];
  if (!mappedSubCategory) {
    throw new Error('Invalid subCategory value provided.');
  }

  const newTeam = await prisma.team.create({
    data: {
      ...restTeamData,
      mainCategory: restTeamData.mainCategory as any,
      subCategory: mappedSubCategory,
      players: {
        connect: playerIds.map((id) => ({ id })),
      },
      coach: coachId ? { connect: { id: coachId } } : undefined,
    },
    include: {
      players: { select: { id: true } },
      coach: { select: { firstName: true, lastName: true } },
    },
  });

  return mapTeamForFrontend(newTeam);
};

/**
 * Update a team
 * Note: Team category is not meant to be updated, only members and tournament info
 */
export const updateTeam = async (id: string, teamData: Team) => {
  const { playerIds, mainCategory, subCategory, ...restTeamData } = teamData;

  const updatedTeam = await prisma.team.update({
    where: { id },
    data: {
      name: restTeamData.name,
      tournament: restTeamData.tournament,
      tournamentPosition: restTeamData.tournamentPosition,
      players: {
        set: playerIds.map((pid) => ({ id: pid })),
      },
    },
    include: { players: { select: { id: true } } },
  });

  return mapTeamForFrontend(updatedTeam);
};

/**
 * Delete a team by ID
 */
export const deleteTeam = async (id: string) => {
  await prisma.team.delete({
    where: { id },
  });
  return { success: true };
};
