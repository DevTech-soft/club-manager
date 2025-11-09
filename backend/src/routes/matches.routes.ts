import { Router } from 'express';
import * as matchesController from '../controllers/matches.controller';

const router = Router();

/**
 * Matches Routes
 * Base path: /api/matches
 *
 * Also includes:
 * - Match sets management
 * - Tournament positions (nested under /api/tournaments)
 */

// GET /api/matches?tournamentId=xxx or /api/matches?groupId=xxx
router.get('/', matchesController.getMatches);

// POST /api/matches/groups - MUST come before /:id to avoid conflict
router.post('/groups', matchesController.generateGroups);

// GET /api/matches/:id - Get match details
router.get('/:id', matchesController.getById);

// POST /api/matches - Generate matches
router.post('/', matchesController.generate);

// PUT /api/matches/:id - Update match
router.put('/:id', matchesController.update);

// PATCH /api/matches/:id/finish - Finish match
router.patch('/:id/finish', matchesController.finish);

// === Match Sets Routes ===

// POST /api/matches/:matchId/sets - Create new set
router.post('/:matchId/sets', matchesController.createSet);

// POST /api/matches/:matchId/sets/:setId/finish - Finish set
router.post('/:matchId/sets/:setId/finish', matchesController.finishSet);

// PATCH /api/matches/:matchId/sets/:setId - Update set points
router.patch('/:matchId/sets/:setId', matchesController.updateSetPoints);

export default router;
