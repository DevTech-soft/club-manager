import { Router } from 'express';
import * as teamsController from '../controllers/teams.controller';

const router = Router();

/**
 * Teams Routes
 * Base path: /api/teams
 */

// GET /api/teams - Get all teams
router.get('/', teamsController.getAll);

// GET /api/teams/:id - Get a single team
router.get('/:id', teamsController.getById);

// POST /api/teams - Create a new team
router.post('/', teamsController.create);

// PUT /api/teams/:id - Update a team
router.put('/:id', teamsController.update);

// DELETE /api/teams/:id - Delete a team
router.delete('/:id', teamsController.remove);

// Note: GET /api/players/:id/teams is handled in players.routes.ts
// since it's a nested resource under players

export default router;
