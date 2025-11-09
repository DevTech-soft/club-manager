// API Service - Refactored with modular architecture
// This file maintains backward compatibility with existing code

// Import all resource APIs
import { authApi } from './resources/auth.api';
import { playersApi } from './resources/players.api';
import { teamsApi } from './resources/teams.api';
import { attendancesApi } from './resources/attendances.api';
import { coachesApi } from './resources/coaches.api';
import { clubSettingsApi } from './resources/clubSettings.api';
import { tournamentsApi } from './resources/tournaments.api';
import { matchesApi } from './resources/matches.api';
import { groupsApi } from './resources/groups.api';

// Export types for backward compatibility
export type { LoginResponse } from './api.types';

/**
 * Main API object that provides access to all API endpoints
 * Organized by resource for better code organization and maintainability
 */
export const api = {
  // ==================== AUTH ====================
  login: authApi.login,
  logout: authApi.logout,
  refresh: authApi.refresh,
  me: authApi.me,

  // ==================== PLAYERS ====================
  getPlayers: playersApi.getAll,
  getPlayerById: playersApi.getById,
  getPlayerByDocument: playersApi.getByDocument,
  getPlayerAttendances: playersApi.getAttendances,
  createPlayer: playersApi.create,
  updatePlayer: playersApi.update,
  recordPlayerPayment: playersApi.recordPayment,
  deletePlayer: playersApi.delete,

  // ==================== TEAMS ====================
  getTeams: teamsApi.getAll,
  createTeam: teamsApi.create,
  updateTeam: teamsApi.update,

  // ==================== ATTENDANCES ====================
  getAttendances: attendancesApi.getAll,
  recordAttendance: attendancesApi.record,

  // ==================== COACHES ====================
  getCoaches: coachesApi.getAll,
  createCoach: coachesApi.create,

  // ==================== CLUB SETTINGS ====================
  getClubSettings: clubSettingsApi.get,
  updateClubSettings: clubSettingsApi.update,

  // ==================== TOURNAMENTS ====================
  getTournaments: tournamentsApi.getAll,
  getTournamentById: tournamentsApi.getById,
  getPositionsByTournamentId: tournamentsApi.getPositions,
  createTournament: tournamentsApi.create,
  updateTournament: tournamentsApi.update,
  deleteTournament: tournamentsApi.delete,

  // ==================== MATCHES ====================
  createMatch: matchesApi.create,
  getMatchesByTournamentId: matchesApi.getByTournamentId,
  getMatchesByGroupId: matchesApi.getByGroupId,
  getMatchById: matchesApi.getById,
  updateMatch: matchesApi.update,
  finishMatch: matchesApi.finish,
  createSet: matchesApi.createSet,
  finishSet: matchesApi.finishSet,
  updateSetScore: matchesApi.updateSetScore,

  // ==================== GROUPS ====================
  generateGroupsAndMatches: groupsApi.generateGroupsAndMatches,
  getGroupsByTournamentId: groupsApi.getByTournamentId,
};

/**
 * Alternative export structure grouped by resource
 * Use this for new code to take advantage of better organization
 *
 * Example:
 * import { apiByResource } from './services/api';
 * apiByResource.players.getAll();
 */
export const apiByResource = {
  auth: authApi,
  players: playersApi,
  teams: teamsApi,
  attendances: attendancesApi,
  coaches: coachesApi,
  clubSettings: clubSettingsApi,
  tournaments: tournamentsApi,
  matches: matchesApi,
  groups: groupsApi,
};

// Export API client for advanced use cases
export { apiClient } from './apiClient';
export type { ApiError } from './apiClient';
