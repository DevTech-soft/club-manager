import { Router } from 'express';
import * as groupsController from '../controllers/groups.controller';

const router = Router();

/**
 * Tournament Groups Routes
 * Base path: /api/groups
 */

// GET /api/groups?tournamentId=xxx - Get groups by tournament
router.get('/', groupsController.getByTournament);

// GET /api/groups/:id - Get a single group
router.get('/:id', groupsController.getById);

// POST /api/groups - Create a new group
router.post('/', groupsController.create);

// PUT /api/groups/:id - Update a group
router.put('/:id', groupsController.update);

// DELETE /api/groups/:id - Delete a group
router.delete('/:id', groupsController.remove);

export default router;
