import { Router } from 'express';
import * as attendancesController from '../controllers/attendances.controller';

const router = Router();

/**
 * Attendances Routes
 * Base path: /api/attendances
 */

// GET /api/attendances - Get all attendances
router.get('/', attendancesController.getAll);

// POST /api/attendances - Register or update attendance
router.post('/', attendancesController.register);

// DELETE /api/attendances/:playerId/:date - Delete an attendance record
router.delete('/:playerId/:date', attendancesController.remove);

// Note: GET /api/players/:id/attendances is handled in players.routes.ts
// since it's a nested resource under players

export default router;
