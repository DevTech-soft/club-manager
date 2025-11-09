import { Request, Response, NextFunction } from 'express';
import * as teamsService from '../services/teams.service';
import type { Team } from '../types';

/**
 * Controller layer for Teams
 * Handles HTTP requests and responses
 */

/**
 * GET /api/teams
 * Get all teams
 */
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teams = await teamsService.getAllTeams();
    res.json(teams);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/teams/:id
 * Get a single team by ID
 */
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const team = await teamsService.getTeamById(id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/players/:id/teams
 * Get all teams for a specific player
 */
export const getByPlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const teams = await teamsService.getPlayerTeams(id);
    res.json(teams);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/teams
 * Create a new team
 */
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamData = req.body as Omit<Team, 'id' | 'coach'>;
    const newTeam = await teamsService.createTeam(teamData);
    res.status(201).json(newTeam);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/teams/:id
 * Update a team
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const teamData = req.body as Team;
    const updatedTeam = await teamsService.updateTeam(id, teamData);
    res.json(updatedTeam);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/teams/:id
 * Delete a team
 */
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await teamsService.deleteTeam(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
