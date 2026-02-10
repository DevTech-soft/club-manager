import { Router } from 'express';
import * as tournamentsController from '../controllers/tournaments.controller';
import * as matchesController from '../controllers/matches.controller';
import { validateBody, validateParams } from '../middlewares/validate';
import { createTournamentSchema, updateTournamentSchema } from '../validators/tournament.validator';
import { idParamSchema } from '../validators/player.validator';

const router = Router();

/**
 * Tournaments Routes
 * Base path: /api/tournaments
 */

// GET /api/tournaments - Get all tournaments
router.get('/', tournamentsController.getAll);

// GET /api/tournaments/:tournamentId/positions - Get tournament positions
router.get(
  '/:tournamentId/positions',
  validateParams(idParamSchema),
  matchesController.getPositions
);

// GET /api/tournaments/:id - Get a single tournament
router.get(
  '/:id',
  validateParams(idParamSchema),
  tournamentsController.getById
);

// POST /api/tournaments - Create a new tournament
router.post(
  '/',
  validateBody(createTournamentSchema),
  tournamentsController.create
);

// PUT /api/tournaments/:id - Update a tournament
router.put(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateTournamentSchema),
  tournamentsController.update
);

// DELETE /api/tournaments/:id - Delete a tournament
router.delete(
  '/:id',
  validateParams(idParamSchema),
  tournamentsController.remove
);

// Note: Match generation endpoints are handled in matches routes

export default router;
