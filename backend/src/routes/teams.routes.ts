import { Router } from 'express';
import * as teamsController from '../controllers/teams.controller';
import { validateBody, validateParams } from '../middlewares/validate';
import { createTeamSchema, updateTeamSchema } from '../validators/team.validator';
import { idParamSchema } from '../validators/player.validator';

const router = Router();

/**
 * Teams Routes
 * Base path: /api/teams
 */

// GET /api/teams - Get all teams
router.get('/', teamsController.getAll);

// GET /api/teams/:id - Get a single team
router.get(
  '/:id',
  validateParams(idParamSchema),
  teamsController.getById
);

// POST /api/teams - Create a new team
router.post(
  '/',
  validateBody(createTeamSchema),
  teamsController.create
);

// PUT /api/teams/:id - Update a team
router.put(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateTeamSchema),
  teamsController.update
);

// DELETE /api/teams/:id - Delete a team
router.delete(
  '/:id',
  validateParams(idParamSchema),
  teamsController.remove
);

// Note: GET /api/players/:id/teams is handled in players.routes.ts
// since it's a nested resource under players

export default router;
