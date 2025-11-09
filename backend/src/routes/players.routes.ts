import { Router } from 'express';
import * as playersController from '../controllers/players.controller';
import * as attendancesController from '../controllers/attendances.controller';
import * as teamsController from '../controllers/teams.controller';

const router = Router();

/**
 * Players Routes
 * Base path: /api/players
 */

// GET /api/players - Get all players
router.get('/', playersController.getAll);

// IMPORTANT: Specific routes must come BEFORE parameterized routes
// GET /api/players/document/:document - Get player by document
router.get('/document/:document', playersController.getByDocument);

// GET /api/players/:id - Get a single player
router.get('/:id', playersController.getById);

// POST /api/players - Create a new player
router.post('/', playersController.create);

// PUT /api/players/:id - Update a player
router.put('/:id', playersController.update);

// DELETE /api/players/:id - Delete a player
router.delete('/:id', playersController.remove);

// POST /api/players/:id/payment - Register payment
router.post('/:id/payment', playersController.registerPayment);

// Nested resources
// GET /api/players/:id/attendances - Get attendances for a player
router.get('/:id/attendances', attendancesController.getByPlayer);

// GET /api/players/:id/teams - Get teams for a player
router.get('/:id/teams', teamsController.getByPlayer);

export default router;
