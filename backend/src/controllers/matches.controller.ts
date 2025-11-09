import { Request, Response, NextFunction } from 'express';
import * as matchesService from '../services/matches.service';
import * as setsService from '../services/sets.service';
import * as positionsService from '../services/positions.service';

/**
 * Controller layer for Matches
 * Handles HTTP requests and responses for matches, sets, and positions
 */

/**
 * GET /api/matches?tournamentId=xxx or /api/matches?groupId=xxx
 * Get matches by tournament or group
 */
export const getMatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tournamentId, groupId } = req.query;

    if (groupId && typeof groupId === 'string') {
      const matches = await matchesService.getMatchesByGroup(groupId);
      return res.json(matches);
    }

    if (tournamentId && typeof tournamentId === 'string') {
      const matches = await matchesService.getMatchesByTournament(tournamentId);
      return res.json(matches);
    }

    return res.status(400).json({ error: 'tournamentId or groupId is required' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/matches/:id
 * Get match details by ID
 */
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    const match = await matchesService.getMatchById(id);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/matches
 * Generate matches for a tournament (round robin)
 */
export const generate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tournamentId } = req.body;

    if (!tournamentId) {
      return res.status(400).json({ error: 'tournamentId required' });
    }

    const result = await matchesService.generateMatches(tournamentId);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes('At least')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * POST /api/matches/groups
 * Generate groups and matches automatically
 */
export const generateGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tournamentId } = req.body;

    if (!tournamentId) {
      return res.status(400).json({ error: 'tournamentId required' });
    }

    const result = await matchesService.generateGroupsAndMatches(tournamentId);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes('At least')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * PUT /api/matches/:id
 * Update a match
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    const match = await matchesService.updateMatch(id, data);
    res.json(match);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/matches/:id/finish
 * Finish a match and update positions
 */
export const finish = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, winnerId } = req.body;

    const updatedMatch = await matchesService.finishMatch(id, status, winnerId);
    res.json(updatedMatch);
  } catch (error) {
    console.error('Error updating match status:', error);
    res.status(500).json({ error: 'Error updating match status' });
  }
};

/**
 * POST /api/matches/:matchId/sets
 * Create a new set for a match
 */
export const createSet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchId } = req.params;
    const sets = await setsService.createSet(matchId);
    res.status(201).json(sets);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Match not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('already an active set')) {
        return res.status(400).json({ error: error.message });
      }
    }
    console.error('Error creating match set:', error);
    next(error);
  }
};

/**
 * POST /api/matches/:matchId/sets/:setId/finish
 * Finish a set and create the next one
 */
export const finishSet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchId, setId } = req.params;
    const { winnerId } = req.body;

    const result = await setsService.finishSet(matchId, setId, winnerId);
    res.json(result);
  } catch (error) {
    console.error('Error finishing set:', error);
    next(error);
  }
};

/**
 * PATCH /api/matches/:matchId/sets/:setId
 * Update set points
 */
export const updateSetPoints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { setId } = req.params;
    const { teamAPoints, teamBPoints } = req.body;

    const updatedSet = await setsService.updateSetPoints(setId, teamAPoints, teamBPoints);
    res.json(updatedSet);
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid points') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * GET /api/tournaments/:tournamentId/positions
 * Get tournament position table
 */
export const getPositions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tournamentId } = req.params;
    const positions = await positionsService.getTournamentPositions(tournamentId);
    res.json(positions);
  } catch (error) {
    next(error);
  }
};
