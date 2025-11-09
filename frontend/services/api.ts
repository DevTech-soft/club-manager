


import { Player, Team, Attendance, ClubSettings, PlayerCreationData, Coach, CoachCreationData, Tournament, TournamentCreationData, Match, TournamentGroup, MatchSet, FinishSetResponse } from '../types';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export type LoginResponse = {
  success: boolean;
  userType: 'admin' | 'superadmin' | 'coach' | null;
  coachInfo?: Coach;
};

export const api = {
  login: async (user: string, pass: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, pass }),
    });
    return handleResponse(response);
  },

  getPlayers: (): Promise<Player[]> => {
    return fetch(`${API_BASE_URL}/players`).then(handleResponse);
  },

  getPlayerById: (id: string): Promise<Player | undefined> => {
    return fetch(`${API_BASE_URL}/players/${id}`).then(handleResponse);
  },

  getPlayerByDocument: (document: string): Promise<Player | undefined> => {
    return fetch(`${API_BASE_URL}/players/document/${document}`).then(handleResponse);
  },

  getPlayerAttendances: (playerId: string): Promise<Attendance[]> => {
    return fetch(`${API_BASE_URL}/players/${playerId}/attendances`).then(handleResponse);
  },


  getTeams: (): Promise<Team[]> => {
    return fetch(`${API_BASE_URL}/teams`).then(handleResponse);
  },

  getAttendances: (): Promise<Attendance[]> => {
    return fetch(`${API_BASE_URL}/attendances`).then(handleResponse);
  },

  getClubSettings: (): Promise<ClubSettings> => {
    return fetch(`${API_BASE_URL}/club-settings`).then(handleResponse);
  },

  updateClubSettings: async (settings: ClubSettings): Promise<ClubSettings> => {
    const response = await fetch(`${API_BASE_URL}/club-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return handleResponse(response);
  },

  createTeam: async (teamData: Omit<Team, 'id'>): Promise<Team> => {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData),
    });
    return handleResponse(response);
  },

  createPlayer: async (playerData: PlayerCreationData): Promise<Player> => {
    const response = await fetch(`${API_BASE_URL}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(playerData),
    });
    return handleResponse(response);
  },

  recordAttendance: async (record: Pick<Attendance, 'playerId' | 'status'>): Promise<Attendance> => {
    const response = await fetch(`${API_BASE_URL}/attendances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    return handleResponse(response);
  },

  updatePlayer: async (updatedPlayerData: Player): Promise<Player> => {
    const response = await fetch(`${API_BASE_URL}/players/${updatedPlayerData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPlayerData),
    });
    return handleResponse(response);
  },

  updateTeam: async (updatedTeamData: Team): Promise<Team> => {
    const response = await fetch(`${API_BASE_URL}/teams/${updatedTeamData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTeamData),
    });
    return handleResponse(response);
  },

  recordPlayerPayment: async (playerId: string): Promise<Player> => {
    const response = await fetch(`${API_BASE_URL}/players/${playerId}/payment`, {
      method: 'POST',
    });
    return handleResponse(response);
  },

  deletePlayer: async (playerId: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/players/${playerId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  getCoaches: (): Promise<Coach[]> => {
    return fetch(`${API_BASE_URL}/coaches`).then(handleResponse);
  },

  createCoach: async (coachData: CoachCreationData): Promise<Coach> => {
    const response = await fetch(`${API_BASE_URL}/coaches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coachData),
    });
    return handleResponse(response);
  },

  createTournament: async (tournamentData: TournamentCreationData): Promise<Tournament> => {
    const response = await fetch(`${API_BASE_URL}/tournaments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tournamentData),
    });

    return handleResponse(response);
  },

  getTournaments: (): Promise<Tournament[]> => {
    return fetch(`${API_BASE_URL}/tournaments`).then(handleResponse);
  },

  getTournamentById: (id: string): Promise<Tournament | undefined> => {
    return fetch(`${API_BASE_URL}/tournaments/${id}`).then(handleResponse);
  },

  updateTournament: async (tournamentData: Tournament): Promise<Tournament> => {
    const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tournamentData),
    });
    return handleResponse(response);
  },

  deleteTournament: async (tournamentId: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  createMatch: async (data: { tournamentId: string }): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getMatchesByTournamentId: (tournamentId: string): Promise<Match[]> => {
    return fetch(`${API_BASE_URL}/matches?tournamentId=${tournamentId}`).then(handleResponse);
  },

  generateGroupsAndMatches: async (tournamentId: string, groupsCount: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/matches/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tournamentId, groupsCount }),
    });
    return handleResponse(response);
  },

  getGroupsByTournamentId: (tournamentId: string): Promise<TournamentGroup[]> => {
    return fetch(`${API_BASE_URL}/groups?tournamentId=${tournamentId}`).then(handleResponse);
  },

  getMatchesByGroupId: (groupId: string): Promise<Match[]> => {
    return fetch(`${API_BASE_URL}/matches?groupId=${groupId}`).then(handleResponse);
  },

  getPositionsByTournamentId: (tournamentId: string): Promise<any[]> => {
    return fetch(`${API_BASE_URL}/tournaments/${tournamentId}/positions`).then(handleResponse);
  },



  updateMatch: async (matchData: Match): Promise<Match> => {
    const response = await fetch(`${API_BASE_URL}/matches/${matchData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: matchData }),
    });
    return handleResponse(response);
  },

  finishMatch: async (matchId: string, data: { status: string; winnerId: string }): Promise<Match> => {
    const response = await fetch(`${API_BASE_URL}/matches/${matchId}/finish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getMatchById: (matchId: string,): Promise<Match | undefined> => {
    return fetch(`${API_BASE_URL}/matches/${matchId}`).then(handleResponse);
  },

  createSet: async (matchId: string): Promise<MatchSet> => {
    const response = await fetch(`${API_BASE_URL}/matches/${matchId}/sets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    return handleResponse(response);
  },

  finishSet: async (matchId: string, setId: string, teamAPoints: number, teamBPoints: number, winnerSet: string): Promise<FinishSetResponse> => {
    const response = await fetch(`${API_BASE_URL}/matches/${matchId}/sets/${setId}/finish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamAPoints, teamBPoints, winnerId: winnerSet }),
    });
    return handleResponse(response) as Promise<FinishSetResponse>;
  },

  updateSetScore: async (matchId: string, setId: string, teamAPoints: number, teamBPoints: number): Promise<MatchSet> => {
    const response = await fetch(`${API_BASE_URL}/matches/${matchId}/sets/${setId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamAPoints, teamBPoints }),
    });
    return handleResponse(response);
  },

};