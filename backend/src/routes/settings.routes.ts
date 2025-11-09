import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';

const router = Router();

/**
 * Club Settings Routes
 * Base path: /api/club-settings
 */

// GET /api/club-settings - Get club settings
router.get('/', settingsController.get);

// PUT /api/club-settings - Update club settings
router.put('/', settingsController.update);

export default router;
