import { Router } from 'express';
import * as coachesController from '../controllers/coaches.controller';

const router = Router();

/**
 * Coaches Routes
 * Base path: /api/coaches
 */

// GET /api/coaches - Get all coaches
router.get('/', coachesController.getAll);

// GET /api/coaches/:id - Get a single coach
router.get('/:id', coachesController.getById);

// POST /api/coaches - Create a new coach
router.post('/', coachesController.create);

// PUT /api/coaches/:id - Update a coach
router.put('/:id', coachesController.update);

// DELETE /api/coaches/:id - Delete a coach
router.delete('/:id', coachesController.remove);

export default router;
