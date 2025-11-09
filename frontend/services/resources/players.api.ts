// Players API endpoints
import { apiClient } from '../apiClient';
import {
  GetPlayersResponse,
  GetPlayerByIdResponse,
  GetPlayerByDocumentResponse,
  CreatePlayerRequest,
  CreatePlayerResponse,
  UpdatePlayerRequest,
  UpdatePlayerResponse,
  DeletePlayerResponse,
  RecordPlayerPaymentResponse,
  GetPlayerAttendancesResponse,
} from '../api.types';

export const playersApi = {
  /**
   * Get all players
   * @returns List of all players
   */
  getAll: (): Promise<GetPlayersResponse> => {
    return apiClient.get<GetPlayersResponse>('/players');
  },

  /**
   * Get player by ID
   * @param id - Player ID
   * @returns Player data or undefined if not found
   */
  getById: (id: string): Promise<GetPlayerByIdResponse> => {
    return apiClient.get<GetPlayerByIdResponse>(`/players/${id}`);
  },

  /**
   * Get player by document number
   * @param document - Player document number
   * @returns Player data or undefined if not found
   */
  getByDocument: (document: string): Promise<GetPlayerByDocumentResponse> => {
    return apiClient.get<GetPlayerByDocumentResponse>(`/players/document/${document}`);
  },

  /**
   * Get all attendances for a specific player
   * @param playerId - Player ID
   * @returns List of player attendances
   */
  getAttendances: (playerId: string): Promise<GetPlayerAttendancesResponse> => {
    return apiClient.get<GetPlayerAttendancesResponse>(`/players/${playerId}/attendances`);
  },

  /**
   * Create a new player
   * @param playerData - Player creation data
   * @returns Created player
   */
  create: (playerData: CreatePlayerRequest): Promise<CreatePlayerResponse> => {
    return apiClient.post<CreatePlayerResponse>('/players', playerData);
  },

  /**
   * Update an existing player
   * @param playerData - Updated player data
   * @returns Updated player
   */
  update: (playerData: UpdatePlayerRequest): Promise<UpdatePlayerResponse> => {
    return apiClient.put<UpdatePlayerResponse>(`/players/${playerData.id}`, playerData);
  },

  /**
   * Record payment for a player
   * @param playerId - Player ID
   * @returns Updated player with payment recorded
   */
  recordPayment: (playerId: string): Promise<RecordPlayerPaymentResponse> => {
    return apiClient.post<RecordPlayerPaymentResponse>(`/players/${playerId}/payment`);
  },

  /**
   * Delete a player
   * @param playerId - Player ID
   * @returns Success response
   */
  delete: (playerId: string): Promise<DeletePlayerResponse> => {
    return apiClient.delete<DeletePlayerResponse>(`/players/${playerId}`);
  },
};
