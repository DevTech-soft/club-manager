import { prisma } from '../config/database';
import type { Team } from '../types';
import { mapTeamForFrontend, subCategoryToPrisma } from '../utils/mappers';
import { NotFoundError } from '../errors/AppError';

/**
 * Service layer for Teams
 * Contains all business logic related to teams
 */

// Select optimizado para equipos
const teamSelect = {
  id: true,
  name: true,
  mainCategory: true,
  subCategory: true,
  tournament: true,
  tournamentPosition: true,
  coachId: true,
  coach: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  },
  players: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      position: true,
    },
  },
  _count: {
    select: {
      players: true,
    },
  },
};

/**
 * Get all teams with their players
 */
export const getAllTeams = async () => {
  const teams = await prisma.team.findMany({
    select: teamSelect,
    orderBy: { name: 'asc' },
  });
  return teams.map(mapTeamForFrontend);
};

/**
 * Get teams with pagination
 */
export const getTeamsPaginated = async (cursor?: string, limit: number = 20) => {
  const teams = await prisma.team.findMany({
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    select: teamSelect,
    orderBy: { name: 'asc' },
  });

  const lastTeam = teams[teams.length - 1];
  const nextCursor = lastTeam?.id;

  return {
    teams: teams.map(mapTeamForFrontend),
    nextCursor,
    hasMore: teams.length === limit,
  };
};

/**
 * Get a single team by ID
 */
export const getTeamById = async (id: string) => {
  const team = await prisma.team.findUnique({
    where: { id },
    select: teamSelect,
  });

  if (!team) {
    throw new NotFoundError('Team');
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
    select: teamSelect,
    orderBy: { name: 'asc' },
  });
  return teams.map(mapTeamForFrontend);
};

/**
 * Get teams by category
 */
export const getTeamsByCategory = async (
  mainCategory?: string,
  subCategory?: string
) => {
  const where: any = {};

  if (mainCategory) {
    where.mainCategory = mainCategory;
  }

  if (subCategory) {
    const mappedSubCategory = subCategoryToPrisma[subCategory];
    if (mappedSubCategory) {
      where.subCategory = mappedSubCategory;
    }
  }

  const teams = await prisma.team.findMany({
    where,
    select: teamSelect,
    orderBy: { name: 'asc' },
  });

  return teams.map(mapTeamForFrontend);
};

/**
 * Search teams by name
 */
export const searchTeams = async (query: string, limit: number = 10) => {
  const teams = await prisma.team.findMany({
    where: {
      name: { contains: query, mode: 'insensitive' },
    },
    take: limit,
    select: teamSelect,
    orderBy: { name: 'asc' },
  });

  return teams.map(mapTeamForFrontend);
};

/**
 * Count total teams
 */
export const countTeams = async () => {
  return prisma.team.count();
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
    select: teamSelect,
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
      coach: restTeamData.coachId ? { connect: { id: restTeamData.coachId } } : { disconnect: true },
      players: {
        set: playerIds.map((pid) => ({ id: pid })),
      },
    },
    select: teamSelect,
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

/**
 * Get teams without a coach
 */
export const getTeamsWithoutCoach = async () => {
  const teams = await prisma.team.findMany({
    where: { coachId: null },
    select: teamSelect,
    orderBy: { name: 'asc' },
  });
  return teams.map(mapTeamForFrontend);
};

/**
 * Add player to team
 */
export const addPlayerToTeam = async (teamId: string, playerId: string) => {
  const team = await prisma.team.update({
    where: { id: teamId },
    data: {
      players: {
        connect: { id: playerId },
      },
    },
    select: teamSelect,
  });
  return mapTeamForFrontend(team);
};

/**
 * Remove player from team
 */
export const removePlayerFromTeam = async (teamId: string, playerId: string) => {
  const team = await prisma.team.update({
    where: { id: teamId },
    data: {
      players: {
        disconnect: { id: playerId },
      },
    },
    select: teamSelect,
  });
  return mapTeamForFrontend(team);
};
