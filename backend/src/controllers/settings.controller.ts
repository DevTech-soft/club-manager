import { Request, Response, NextFunction } from 'express';
import * as settingsService from '../services/settings.service';
import type { ClubSettings } from '../types';

/**
 * Controller layer for Club Settings
 * Handles HTTP requests and responses
 */

/**
 * GET /api/club-settings
 * Get club settings
 */
export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsService.getSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/club-settings
 * Update club settings
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settingsData = req.body as ClubSettings;
    const updatedSettings = await settingsService.updateSettings(settingsData);
    res.json(updatedSettings);
  } catch (error) {
    next(error);
  }
};
