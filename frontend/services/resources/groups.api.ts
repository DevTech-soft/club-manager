// Groups API endpoints
import { apiClient } from '../apiClient';
import {
  GenerateGroupsAndMatchesRequest,
  GenerateGroupsAndMatchesResponse,
  GetGroupsByTournamentIdResponse,
} from '../api.types';

export const groupsApi = {
  /**
   * Generate groups and matches for a tournament
   * @param tournamentId - Tournament ID
   * @param groupsCount - Number of groups to create
   * @returns Success response
   */
  generateGroupsAndMatches: (
    tournamentId: string,
    groupsCount: number
  ): Promise<GenerateGroupsAndMatchesResponse> => {
    const request: GenerateGroupsAndMatchesRequest = { tournamentId, groupsCount };
    return apiClient.post<GenerateGroupsAndMatchesResponse>('/matches/groups', request);
  },

  /**
   * Get all groups for a tournament
   * @param tournamentId - Tournament ID
   * @returns List of groups
   */
  getByTournamentId: (tournamentId: string): Promise<GetGroupsByTournamentIdResponse> => {
    return apiClient.get<GetGroupsByTournamentIdResponse>('/groups', {
      params: { tournamentId },
    });
  },
};
