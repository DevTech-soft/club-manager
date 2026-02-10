import { prisma } from '../config/database';
import type { Player, PlayerCreationData } from '../types';
import {
  mapPlayerForFrontend,
  subCategoryToPrisma,
  positionToPrisma,
} from '../utils/mappers';
import { NotFoundError } from '../errors/AppError';

/**
 * Service layer for Players
 * Contains all business logic related to players
 */

// Select optimizado para lista de jugadores (menos campos)
const playerListSelect = {
  id: true,
  name: true,
  document: true,
  phone: true,
  avatarUrl: true,
  mainCategories: true,
  subCategory: true,
  position: true,
  joinDate: true,
  birthDate: true,
  lastPaymentDate: true,
  address: true,
  statsHistory: {
    take: 1, // Solo el último registro de stats
    orderBy: { date: 'desc' as const },
    select: {
      id: true,
      date: true,
      stats: true,
    },
  },
};

// Select completo para detalle de jugador
const playerDetailSelect = {
  id: true,
  name: true,
  document: true,
  address: true,
  phone: true,
  joinDate: true,
  birthDate: true,
  avatarUrl: true,
  mainCategories: true,
  subCategory: true,
  position: true,
  lastPaymentDate: true,
  statsHistory: {
    orderBy: { date: 'desc' as const },
    select: {
      id: true,
      date: true,
      stats: true,
    },
  },
};

/**
 * Get all players with optimized select
 */
export const getAllPlayers = async () => {
  const players = await prisma.player.findMany({
    select: playerListSelect,
    orderBy: { joinDate: 'desc' },
  });
  return players.map(mapPlayerForFrontend);
};

/**
 * Get players with pagination (cursor-based para mejor performance)
 */
export const getPlayersPaginated = async (cursor?: string, limit: number = 20) => {
  const players = await prisma.player.findMany({
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    select: playerListSelect,
    orderBy: { joinDate: 'desc' },
  });

  const lastPlayer = players[players.length - 1];
  const nextCursor = lastPlayer?.id;

  return {
    players: players.map(mapPlayerForFrontend),
    nextCursor,
    hasMore: players.length === limit,
  };
};

/**
 * Get a single player by ID with full details
 */
export const getPlayerById = async (id: string) => {
  const player = await prisma.player.findUnique({
    where: { id },
    select: playerDetailSelect,
  });

  if (!player) {
    throw new NotFoundError('Player');
  }

  return mapPlayerForFrontend(player);
};

/**
 * Get a player by document number
 */
export const getPlayerByDocument = async (document: string) => {
  const player = await prisma.player.findUnique({
    where: { document },
    select: playerDetailSelect,
  });

  if (!player) {
    return null;
  }

  return mapPlayerForFrontend(player);
};

/**
 * Search players by name or document
 */
export const searchPlayers = async (query: string, limit: number = 10) => {
  const players = await prisma.player.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { document: { contains: query } },
      ],
    },
    take: limit,
    select: playerListSelect,
    orderBy: { name: 'asc' },
  });

  return players.map(mapPlayerForFrontend);
};

/**
 * Get players by category
 */
export const getPlayersByCategory = async (
  mainCategory?: string,
  subCategory?: string
) => {
  const where: any = {};

  if (mainCategory) {
    where.mainCategories = { has: mainCategory };
  }

  if (subCategory) {
    const mappedSubCategory = subCategoryToPrisma[subCategory];
    if (mappedSubCategory) {
      where.subCategory = mappedSubCategory;
    }
  }

  const players = await prisma.player.findMany({
    where,
    select: playerListSelect,
    orderBy: { joinDate: 'desc' },
  });

  return players.map(mapPlayerForFrontend);
};

/**
 * Get players with overdue payments
 */
export const getPlayersWithOverduePayments = async (days: number = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const players = await prisma.player.findMany({
    where: {
      OR: [
        { lastPaymentDate: { lt: cutoffDate } },
        { lastPaymentDate: null },
      ],
    },
    select: playerListSelect,
    orderBy: { lastPaymentDate: 'asc' },
  });

  return players.map(mapPlayerForFrontend);
};

/**
 * Count total players
 */
export const countPlayers = async () => {
  return prisma.player.count();
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
      mainCategories: restPlayerData.mainCategories as any,
      subCategory: mappedSubCategory,
      position: mappedPosition,
      statsHistory: {
        create: statsHistory.map((sh) => ({
          stats: sh.stats as any,
          date: new Date(sh.date),
        })),
      },
    },
    select: playerDetailSelect,
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
    id: undefined,
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
    select: playerDetailSelect,
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
    select: playerDetailSelect,
  });

  return mapPlayerForFrontend(updatedPlayer);
};

/**
 * Bulk delete players
 */
export const bulkDeletePlayers = async (ids: string[]) => {
  const result = await prisma.player.deleteMany({
    where: { id: { in: ids } },
  });
  return { deleted: result.count };
};
