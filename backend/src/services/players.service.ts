import { prisma } from '../config/database';
import type { Player, PlayerCreationData } from '../types';
import {
  mapPlayerForFrontend,
  subCategoryToPrisma,
  positionToPrisma,
} from '../utils/mappers';

/**
 * Service layer for Players
 * Contains all business logic related to players
 */

/**
 * Get all players with their stats history
 */
export const getAllPlayers = async () => {
  const players = await prisma.player.findMany({
    include: { statsHistory: { orderBy: { date: 'desc' } } },
    orderBy: { joinDate: 'desc' },
  });
  return players.map(mapPlayerForFrontend);
};

/**
 * Get a single player by ID
 */
export const getPlayerById = async (id: string) => {
  const player = await prisma.player.findUnique({
    where: { id },
    include: { statsHistory: { orderBy: { date: 'desc' } } },
  });

  if (!player) {
    return null;
  }

  return mapPlayerForFrontend(player);
};

/**
 * Get a player by document number
 */
export const getPlayerByDocument = async (document: string) => {
  const player = await prisma.player.findUnique({
    where: { document },
    include: { statsHistory: { orderBy: { date: 'desc' } } },
  });

  if (!player) {
    return null;
  }

  return mapPlayerForFrontend(player);
};

/**
 * Create a new player with initial stats
 */
export const createPlayer = async (playerData: PlayerCreationData) => {
  const { statsHistory, ...restPlayerData } = playerData;

  // Map enums to Prisma format
  const mappedSubCategory = subCategoryToPrisma[restPlayerData.subCategory];
  const mappedPosition = positionToPrisma[restPlayerData.position];

  if (!mappedSubCategory || !mappedPosition) {
    throw new Error('Invalid subCategory or position value provided.');
  }

  const newPlayer = await prisma.player.create({
    data: {
      ...restPlayerData,
      birthDate: new Date(restPlayerData.birthDate),
      mainCategories: restPlayerData.mainCategories as any, // Values match keys
      subCategory: mappedSubCategory,
      position: mappedPosition,
      statsHistory: {
        create: statsHistory.map((sh) => ({
          stats: sh.stats as any,
          date: new Date(sh.date),
        })),
      },
    },
    include: { statsHistory: { orderBy: { date: 'desc' } } },
  });

  return mapPlayerForFrontend(newPlayer);
};

/**
 * Update a player
 * Can also update the latest stats record if provided
 */
export const updatePlayer = async (id: string, playerData: Player) => {
  const { statsHistory, joinDate, ...restPlayerData } = playerData;

  // Map enums to Prisma format
  const mappedSubCategory = subCategoryToPrisma[restPlayerData.subCategory];
  const mappedPosition = positionToPrisma[restPlayerData.position];

  if (!mappedSubCategory || !mappedPosition) {
    throw new Error('Invalid subCategory or position value provided.');
  }

  const dataToUpdate: any = {
    ...restPlayerData,
    id: undefined, // Do not try to update id
    birthDate: new Date(restPlayerData.birthDate),
    lastPaymentDate: restPlayerData.lastPaymentDate
      ? new Date(restPlayerData.lastPaymentDate)
      : null,
    mainCategories: restPlayerData.mainCategories as any,
    subCategory: mappedSubCategory,
    position: mappedPosition,
  };

  // Update the latest stats record if provided
  if (statsHistory && statsHistory.length > 0) {
    const latestStatRecord = statsHistory[0];
    if (latestStatRecord.id) {
      dataToUpdate.statsHistory = {
        update: {
          where: { id: latestStatRecord.id },
          data: { stats: latestStatRecord.stats as any },
        },
      };
    }
  }

  const updatedPlayer = await prisma.player.update({
    where: { id },
    data: dataToUpdate,
    include: { statsHistory: { orderBy: { date: 'desc' } } },
  });

  return mapPlayerForFrontend(updatedPlayer);
};

/**
 * Delete a player
 */
export const deletePlayer = async (id: string) => {
  await prisma.player.delete({ where: { id } });
  return { success: true };
};

/**
 * Register a payment for a player
 * Updates the lastPaymentDate to current date
 */
export const registerPayment = async (id: string) => {
  const updatedPlayer = await prisma.player.update({
    where: { id },
    data: { lastPaymentDate: new Date() },
    include: { statsHistory: { orderBy: { date: 'desc' } } },
  });

  return mapPlayerForFrontend(updatedPlayer);
};
