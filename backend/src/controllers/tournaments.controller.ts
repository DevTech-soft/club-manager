import { Request, Response, NextFunction } from 'express';
import * as tournamentsService from '../services/tournaments.service';

/**
 * Controller layer for Tournaments
 * Handles HTTP requests and responses
 */

/**
 * GET /api/tournaments
 * Get all tournaments
 */
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tournaments = await tournamentsService.getAllTournaments();
    res.json(tournaments);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tournaments/:id
 * Get a single tournament by ID
 */
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tournament = await tournamentsService.getTournamentById(id);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json(tournament);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tournaments
 * Create a new tournament
 */
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tournamentData = req.body;
    const newTournament = await tournamentsService.createTournament(tournamentData);
    res.status(201).json(newTournament);
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error && error.message.includes('Equipo')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * PUT /api/tournaments/:id
 * Update a tournament
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tournamentData = req.body;
    const updatedTournament = await tournamentsService.updateTournament(id, tournamentData);
    res.json(updatedTournament);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/tournaments/:id
 * Delete a tournament
 */
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await tournamentsService.deleteTournament(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
