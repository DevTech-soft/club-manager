// Tipos específicos para requests y responses de la API
import {
  Player,
  Team,
  Attendance,
  ClubSettings,
  PlayerCreationData,
  Coach,
  CoachCreationData,
  Tournament,
  TournamentCreationData,
  Match,
  TournamentGroup,
  MatchSet,
  FinishSetResponse,
  TournamentPosition,
} from '../types';

// ==================== AUTH ====================
export interface LoginRequest {
  user: string;
  pass: string;
}

export interface LoginResponse {
  success: boolean;
  userType: 'admin' | 'superadmin' | 'coach' | null;
  coachInfo?: Coach;
}

// ==================== PLAYERS ====================
export type GetPlayersResponse = Player[];
export type GetPlayerByIdResponse = Player | undefined;
export type GetPlayerByDocumentResponse = Player | undefined;
export type CreatePlayerRequest = PlayerCreationData;
export type CreatePlayerResponse = Player;
export type UpdatePlayerRequest = Player;
export type UpdatePlayerResponse = Player;
export type DeletePlayerResponse = { success: boolean };
export type RecordPlayerPaymentResponse = Player;
export type GetPlayerAttendancesResponse = Attendance[];

// ==================== TEAMS ====================
export type GetTeamsResponse = Team[];
export type CreateTeamRequest = Omit<Team, 'id' | 'coach'>;
export type CreateTeamResponse = Team;
export type UpdateTeamRequest = Team;
export type UpdateTeamResponse = Team;

// ==================== ATTENDANCES ====================
export type GetAttendancesResponse = Attendance[];
export type RecordAttendanceRequest = Pick<Attendance, 'playerId' | 'status'>;
export type RecordAttendanceResponse = Attendance;

// ==================== COACHES ====================
export type GetCoachesResponse = Coach[];
export type CreateCoachRequest = CoachCreationData;
export type CreateCoachResponse = Coach;

// ==================== CLUB SETTINGS ====================
export type GetClubSettingsResponse = ClubSettings;
export type UpdateClubSettingsRequest = ClubSettings;
export type UpdateClubSettingsResponse = ClubSettings;

// ==================== TOURNAMENTS ====================
export type GetTournamentsResponse = Tournament[];
export type GetTournamentByIdResponse = Tournament | undefined;
export type CreateTournamentRequest = TournamentCreationData;
export type CreateTournamentResponse = Tournament;
export type UpdateTournamentRequest = Tournament;
export type UpdateTournamentResponse = Tournament;
export type DeleteTournamentResponse = { success: boolean };
export type GetPositionsByTournamentIdResponse = TournamentPosition[];

// ==================== MATCHES ====================
export interface CreateMatchRequest {
  tournamentId: string;
}
export type CreateMatchResponse = void;

export type GetMatchesByTournamentIdResponse = Match[];
export type GetMatchByIdResponse = Match | undefined;
export type UpdateMatchRequest = Match;
export type UpdateMatchResponse = Match;

export interface FinishMatchRequest {
  status: string;
  winnerId: string;
}
export type FinishMatchResponse = Match;

// ==================== GROUPS ====================
export interface GenerateGroupsAndMatchesRequest {
  tournamentId: string;
  groupsCount: number;
}
export type GenerateGroupsAndMatchesResponse = void;

export type GetGroupsByTournamentIdResponse = TournamentGroup[];
export type GetMatchesByGroupIdResponse = Match[];

// ==================== SETS ====================
export type CreateSetResponse = MatchSet;

export interface FinishSetRequest {
  teamAPoints: number;
  teamBPoints: number;
  winnerId: string;
}
export type FinishSetResponseType = FinishSetResponse;

export interface UpdateSetScoreRequest {
  teamAPoints: number;
  teamBPoints: number;
}
export type UpdateSetScoreResponse = MatchSet;
