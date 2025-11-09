import { Router } from 'express';
import authRoutes from './auth.routes';
import coachesRoutes from './coaches.routes';
import settingsRoutes from './settings.routes';
import attendancesRoutes from './attendances.routes';
import teamsRoutes from './teams.routes';
import playersRoutes from './players.routes';
import groupsRoutes from './groups.routes';
import tournamentsRoutes from './tournaments.routes';
import matchesRoutes from './matches.routes';

const router = Router();

/**
 * Central router that combines all API routes
 * All routes are prefixed with /api
 */

// Authentication routes
router.use('/auth', authRoutes);

// Coaches routes
router.use('/coaches', coachesRoutes);

// Club Settings routes
router.use('/club-settings', settingsRoutes);

// Attendances routes
router.use('/attendances', attendancesRoutes);

// Teams routes
router.use('/teams', teamsRoutes);

// Players routes (includes nested routes for attendances and teams)
router.use('/players', playersRoutes);

// Tournaments routes (includes positions endpoint)
router.use('/tournaments', tournamentsRoutes);

// Tournament Groups routes
router.use('/groups', groupsRoutes);

// Matches routes (includes sets endpoints)
router.use('/matches', matchesRoutes);

export default router;
