import { Router } from 'express';
import * as playersController from '../controllers/players.controller';
import * as attendancesController from '../controllers/attendances.controller';
import * as teamsController from '../controllers/teams.controller';
import { validateBody, validateParams, paginationSchema } from '../middlewares/validate';
import { authLimiter } from '../middlewares/rateLimiter';
import {
  createPlayerSchema,
  updatePlayerSchema,
  idParamSchema,
  documentParamSchema,
} from '../validators/player.validator';

const router = Router();

/**
 * Players Routes
 * Base path: /api/players
 */

// GET /api/players - Get all players (con validación de paginación opcional)
router.get('/', playersController.getAll);

// IMPORTANT: Specific routes must come BEFORE parameterized routes
// GET /api/players/document/:document - Get player by document
router.get(
  '/document/:document',
  validateParams(documentParamSchema),
  playersController.getByDocument
);

// GET /api/players/:id - Get a single player
router.get(
  '/:id',
  validateParams(idParamSchema),
  playersController.getById
);

// POST /api/players - Create a new player
router.post(
  '/',
  validateBody(createPlayerSchema),
  playersController.create
);

// PUT /api/players/:id - Update a player
router.put(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updatePlayerSchema),
  playersController.update
);

// DELETE /api/players/:id - Delete a player
router.delete(
  '/:id',
  validateParams(idParamSchema),
  playersController.remove
);

// POST /api/players/:id/payment - Register payment
router.post(
  '/:id/payment',
  validateParams(idParamSchema),
  playersController.registerPayment
);

// Nested resources
// GET /api/players/:id/attendances - Get attendances for a player
router.get(
  '/:id/attendances',
  validateParams(idParamSchema),
  attendancesController.getByPlayer
);

// GET /api/players/:id/teams - Get teams for a player
router.get(
  '/:id/teams',
  validateParams(idParamSchema),
  teamsController.getByPlayer
);

export default router;
