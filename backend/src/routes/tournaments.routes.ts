import { Router } from 'express';
import * as tournamentsController from '../controllers/tournaments.controller';
import * as matchesController from '../controllers/matches.controller';

const router = Router();

/**
 * Tournaments Routes
 * Base path: /api/tournaments
 */

// GET /api/tournaments - Get all tournaments
router.get('/', tournamentsController.getAll);

// GET /api/tournaments/:tournamentId/positions - Get tournament positions
router.get('/:tournamentId/positions', matchesController.getPositions);

// GET /api/tournaments/:id - Get a single tournament
router.get('/:id', tournamentsController.getById);

// POST /api/tournaments - Create a new tournament
router.post('/', tournamentsController.create);

// PUT /api/tournaments/:id - Update a tournament
router.put('/:id', tournamentsController.update);

// DELETE /api/tournaments/:id - Delete a tournament
router.delete('/:id', tournamentsController.remove);

// Note: Match generation endpoints are handled in matches routes

export default router;
