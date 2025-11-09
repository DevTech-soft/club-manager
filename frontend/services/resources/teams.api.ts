// Teams API endpoints
import { apiClient } from '../apiClient';
import {
  GetTeamsResponse,
  CreateTeamRequest,
  CreateTeamResponse,
  UpdateTeamRequest,
  UpdateTeamResponse,
} from '../api.types';

export const teamsApi = {
  /**
   * Get all teams
   * @returns List of all teams
   */
  getAll: (): Promise<GetTeamsResponse> => {
    return apiClient.get<GetTeamsResponse>('/teams');
  },

  /**
   * Create a new team
   * @param teamData - Team creation data
   * @returns Created team
   */
  create: (teamData: CreateTeamRequest): Promise<CreateTeamResponse> => {
    return apiClient.post<CreateTeamResponse>('/teams', teamData);
  },

  /**
   * Update an existing team
   * @param teamData - Updated team data
   * @returns Updated team
   */
  update: (teamData: UpdateTeamRequest): Promise<UpdateTeamResponse> => {
    return apiClient.put<UpdateTeamResponse>(`/teams/${teamData.id}`, teamData);
  },
};
