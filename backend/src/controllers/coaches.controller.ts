import { Request, Response, NextFunction } from 'express';
import * as coachesService from '../services/coaches.service';
import type { CoachCreationData } from '../types';

/**
 * Controller layer for Coaches
 * Handles HTTP requests and responses
 */

/**
 * GET /api/coaches
 * Get all coaches
 */
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coaches = await coachesService.getAllCoaches();
    res.json(coaches);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/coaches/:id
 * Get a single coach by ID
 */
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const coach = await coachesService.getCoachById(id);

    if (!coach) {
      return res.status(404).json({ error: 'Coach not found' });
    }

    res.json(coach);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/coaches
 * Create a new coach
 */
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coachData = req.body as CoachCreationData;
    const newCoach = await coachesService.createCoach(coachData);
    res.status(201).json(newCoach);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/coaches/:id
 * Update a coach
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const coachData = req.body as Partial<CoachCreationData>;
    const updatedCoach = await coachesService.updateCoach(id, coachData);
    res.json(updatedCoach);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/coaches/:id
 * Delete a coach
 */
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await coachesService.deleteCoach(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
