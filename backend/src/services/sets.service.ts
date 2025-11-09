import { prisma } from '../config/database';

/**
 * Service layer for Match Sets
 * Contains all business logic related to volleyball match sets
 */

/**
 * Create a new set for a match
 * Prevents creating a set if there's already one in progress
 */
export const createSet = async (matchId: string) => {
  // Verify match exists
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    throw new Error('Match not found');
  }

  // Check if there's already an active set to prevent duplicates
  const activeSet = await prisma.matchSet.findFirst({
    where: { matchId, status: 'in_progress' },
  });

  if (activeSet) {
    throw new Error('There is already an active set');
  }

  // Determine the next set number
  const existingSets = await prisma.matchSet.count({ where: { matchId } });
  const nextSetNumber = existingSets + 1;

  // Create the new set
  const newSet = await prisma.matchSet.create({
    data: {
      matchId,
      setNumber: nextSetNumber,
      teamAPoints: 0,
      teamBPoints: 0,
      status: 'in_progress',
    },
  });

  // Return all sets for this match
  const allSets = await prisma.matchSet.findMany({
    where: { matchId },
    orderBy: { setNumber: 'asc' },
  });

  return allSets;
};

/**
 * Finish a set and automatically create the next one
 */
export const finishSet = async (
  matchId: string,
  setId: string,
  winnerId: string
) => {
  // Finish the current set
  const finishedSet = await prisma.matchSet.update({
    where: { id: setId },
    data: { status: 'finished', winnerId },
  });

  // Get all existing sets
  const allSets = await prisma.matchSet.findMany({
    where: { matchId },
    orderBy: { setNumber: 'asc' },
  });

  // Automatically create the next set
  const nextSetNumber = allSets.length + 1;
  const nextSet = await prisma.matchSet.create({
    data: {
      matchId,
      setNumber: nextSetNumber,
      teamAPoints: 0,
      teamBPoints: 0,
      status: 'in_progress',
    },
  });

  return {
    finishedSet,
    nextSet,
    allSets: [...allSets, nextSet],
  };
};

/**
 * Update points for a set
 */
export const updateSetPoints = async (
  setId: string,
  teamAPoints: number,
  teamBPoints: number
) => {
  // Validate points
  if (typeof teamAPoints !== 'number' || typeof teamBPoints !== 'number') {
    throw new Error('Invalid points');
  }

  const updatedSet = await prisma.matchSet.update({
    where: { id: setId },
    data: { teamAPoints, teamBPoints },
  });

  return updatedSet;
};

/**
 * Get all sets for a match
 */
export const getMatchSets = async (matchId: string) => {
  const sets = await prisma.matchSet.findMany({
    where: { matchId },
    orderBy: { setNumber: 'asc' },
  });

  return sets;
};
