import { Request, Response, NextFunction } from 'express';
import * as attendancesService from '../services/attendances.service';
import type { Attendance } from '../types';

/**
 * Controller layer for Attendances
 * Handles HTTP requests and responses
 */

/**
 * GET /api/attendances
 * Get all attendances
 */
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attendances = await attendancesService.getAllAttendances();
    res.json(attendances);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/players/:id/attendances
 * Get attendances for a specific player
 */
export const getByPlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const attendances = await attendancesService.getPlayerAttendances(id);
    res.json(attendances);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/attendances
 * Register or update attendance for a player
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { playerId, status } = req.body as Pick<Attendance, 'playerId' | 'status'>;
    const record = await attendancesService.registerAttendance(playerId, status);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/attendances/:playerId/:date
 * Delete an attendance record
 */
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { playerId, date } = req.params;
    const result = await attendancesService.deleteAttendance(playerId, new Date(date));
    res.json(result);
  } catch (error) {
    next(error);
  }
};
