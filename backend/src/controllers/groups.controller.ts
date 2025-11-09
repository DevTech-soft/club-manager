import { Request, Response, NextFunction } from 'express';
import * as groupsService from '../services/groups.service';

/**
 * Controller layer for Tournament Groups
 * Handles HTTP requests and responses
 */

/**
 * GET /api/groups?tournamentId=xxx
 * Get all groups for a specific tournament
 */
export const getByTournament = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tournamentId } = req.query;

    if (!tournamentId || typeof tournamentId !== 'string') {
      return res.status(400).json({ error: 'Falta tournamentId' });
    }

    const groups = await groupsService.getGroupsByTournament(tournamentId);
    res.json(groups);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/groups/:id
 * Get a single group by ID
 */
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const group = await groupsService.getGroupById(id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/groups
 * Create a new tournament group
 */
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tournamentId, name } = req.body;

    if (!tournamentId || !name) {
      return res.status(400).json({ error: 'tournamentId and name are required' });
    }

    const group = await groupsService.createGroup({ tournamentId, name });
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/groups/:id
 * Update a tournament group
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const group = await groupsService.updateGroup(id, { name });
    res.json(group);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/groups/:id
 * Delete a tournament group
 */
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await groupsService.deleteGroup(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
