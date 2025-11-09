import { Request, Response, NextFunction } from 'express';
import * as playersService from '../services/players.service';
import type { Player, PlayerCreationData } from '../types';

/**
 * Controller layer for Players
 * Handles HTTP requests and responses
 */

/**
 * GET /api/players
 * Get all players
 */
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const players = await playersService.getAllPlayers();
    res.json(players);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/players/:id
 * Get a single player by ID
 */
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const player = await playersService.getPlayerById(id);

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(player);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/players/document/:document
 * Get a player by document number
 */
export const getByDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { document } = req.params;
    const player = await playersService.getPlayerByDocument(document);

    if (!player) {
      return res.status(404).json({ message: 'Jugador no encontrado' });
    }

    res.json(player);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/players
 * Create a new player
 */
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const playerData = req.body as PlayerCreationData;
    const newPlayer = await playersService.createPlayer(playerData);
    res.status(201).json(newPlayer);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/players/:id
 * Update a player
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const playerData = req.body as Player;
    const updatedPlayer = await playersService.updatePlayer(id, playerData);
    res.json(updatedPlayer);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/players/:id
 * Delete a player
 */
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await playersService.deletePlayer(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/players/:id/payment
 * Register a payment for a player
 */
export const registerPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedPlayer = await playersService.registerPayment(id);
    res.json(updatedPlayer);
  } catch (error) {
    next(error);
  }
};
