// Tournaments API endpoints
import { apiClient } from '../apiClient';
import {
  GetTournamentsResponse,
  GetTournamentByIdResponse,
  CreateTournamentRequest,
  CreateTournamentResponse,
  UpdateTournamentRequest,
  UpdateTournamentResponse,
  DeleteTournamentResponse,
  GetPositionsByTournamentIdResponse,
} from '../api.types';

export const tournamentsApi = {
  /**
   * Get all tournaments
   * @returns List of all tournaments
   */
  getAll: (): Promise<GetTournamentsResponse> => {
    return apiClient.get<GetTournamentsResponse>('/tournaments');
  },

  /**
   * Get tournament by ID
   * @param id - Tournament ID
   * @returns Tournament data or undefined if not found
   */
  getById: (id: string): Promise<GetTournamentByIdResponse> => {
    return apiClient.get<GetTournamentByIdResponse>(`/tournaments/${id}`);
  },

  /**
   * Get positions/standings for a tournament
   * @param tournamentId - Tournament ID
   * @returns List of tournament positions
   */
  getPositions: (tournamentId: string): Promise<GetPositionsByTournamentIdResponse> => {
    return apiClient.get<GetPositionsByTournamentIdResponse>(`/tournaments/${tournamentId}/positions`);
  },

  /**
   * Create a new tournament
   * @param tournamentData - Tournament creation data
   * @returns Created tournament
   */
  create: (tournamentData: CreateTournamentRequest): Promise<CreateTournamentResponse> => {
    return apiClient.post<CreateTournamentResponse>('/tournaments', tournamentData);
  },

  /**
   * Update an existing tournament
   * @param tournamentData - Updated tournament data
   * @returns Updated tournament
   */
  update: (tournamentData: UpdateTournamentRequest): Promise<UpdateTournamentResponse> => {
    return apiClient.put<UpdateTournamentResponse>(`/tournaments/${tournamentData.id}`, tournamentData);
  },

  /**
   * Delete a tournament
   * @param tournamentId - Tournament ID
   * @returns Success response
   */
  delete: (tournamentId: string): Promise<DeleteTournamentResponse> => {
    return apiClient.delete<DeleteTournamentResponse>(`/tournaments/${tournamentId}`);
  },
};
