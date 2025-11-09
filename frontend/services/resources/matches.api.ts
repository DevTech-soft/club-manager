// Matches API endpoints
import { apiClient } from '../apiClient';
import {
  CreateMatchRequest,
  CreateMatchResponse,
  GetMatchesByTournamentIdResponse,
  GetMatchByIdResponse,
  UpdateMatchRequest,
  UpdateMatchResponse,
  FinishMatchRequest,
  FinishMatchResponse,
  CreateSetResponse,
  FinishSetRequest,
  FinishSetResponseType,
  UpdateSetScoreRequest,
  UpdateSetScoreResponse,
} from '../api.types';

export const matchesApi = {
  /**
   * Create matches for a tournament
   * @param data - Match creation data with tournament ID
   * @returns Success response
   */
  create: (data: CreateMatchRequest): Promise<CreateMatchResponse> => {
    return apiClient.post<CreateMatchResponse>('/matches', data);
  },

  /**
   * Get all matches for a tournament
   * @param tournamentId - Tournament ID
   * @returns List of matches
   */
  getByTournamentId: (tournamentId: string): Promise<GetMatchesByTournamentIdResponse> => {
    return apiClient.get<GetMatchesByTournamentIdResponse>('/matches', {
      params: { tournamentId },
    });
  },

  /**
   * Get all matches for a group
   * @param groupId - Group ID
   * @returns List of matches
   */
  getByGroupId: (groupId: string): Promise<GetMatchesByTournamentIdResponse> => {
    return apiClient.get<GetMatchesByTournamentIdResponse>('/matches', {
      params: { groupId },
    });
  },

  /**
   * Get match by ID
   * @param matchId - Match ID
   * @returns Match data or undefined if not found
   */
  getById: (matchId: string): Promise<GetMatchByIdResponse> => {
    return apiClient.get<GetMatchByIdResponse>(`/matches/${matchId}`);
  },

  /**
   * Update a match
   * @param matchData - Updated match data
   * @returns Updated match
   */
  update: (matchData: UpdateMatchRequest): Promise<UpdateMatchResponse> => {
    return apiClient.put<UpdateMatchResponse>(`/matches/${matchData.id}`, { data: matchData });
  },

  /**
   * Finish a match
   * @param matchId - Match ID
   * @param data - Finish match data (status and winner)
   * @returns Finished match
   */
  finish: (matchId: string, data: FinishMatchRequest): Promise<FinishMatchResponse> => {
    return apiClient.patch<FinishMatchResponse>(`/matches/${matchId}/finish`, data);
  },

  /**
   * Create a new set for a match
   * @param matchId - Match ID
   * @returns Created set
   */
  createSet: (matchId: string): Promise<CreateSetResponse> => {
    return apiClient.post<CreateSetResponse>(`/matches/${matchId}/sets`, {});
  },

  /**
   * Finish a set
   * @param matchId - Match ID
   * @param setId - Set ID
   * @param data - Finish set data (points and winner)
   * @returns Finished set and next set info
   */
  finishSet: (
    matchId: string,
    setId: string,
    data: FinishSetRequest
  ): Promise<FinishSetResponseType> => {
    return apiClient.post<FinishSetResponseType>(`/matches/${matchId}/sets/${setId}/finish`, data);
  },

  /**
   * Update set score
   * @param matchId - Match ID
   * @param setId - Set ID
   * @param data - Score update data
   * @returns Updated set
   */
  updateSetScore: (
    matchId: string,
    setId: string,
    data: UpdateSetScoreRequest
  ): Promise<UpdateSetScoreResponse> => {
    return apiClient.patch<UpdateSetScoreResponse>(`/matches/${matchId}/sets/${setId}`, data);
  },
};
