// Hooks - Barrel exports
export { usePlayers, usePlayer, useCreatePlayer, useUpdatePlayer, useDeletePlayer, useRecordPayment, usePlayerByDocument } from './usePlayers';
export { useTeams, useTeam, useCreateTeam, useUpdateTeam } from './useTeams';
export { useTournaments, useTournament, useCreateTournament, useUpdateTournament, useDeleteTournament, useTournamentPositions } from './useTournaments';
export { useAttendances, usePlayerAttendances, useRecordAttendance } from './useAttendances';
export { useCoaches, useCreateCoach } from './useCoaches';

// Re-exportar tipos de query keys para uso avanzado
export { playerKeys } from './usePlayers';
export { teamKeys } from './useTeams';
export { tournamentKeys } from './useTournaments';
export { attendanceKeys } from './useAttendances';
export { coachKeys } from './useCoaches';
