// Coaches API endpoints
import { apiClient } from '../apiClient';
import {
  GetCoachesResponse,
  CreateCoachRequest,
  CreateCoachResponse,
} from '../api.types';

export const coachesApi = {
  /**
   * Get all coaches
   * @returns List of all coaches
   */
  getAll: (): Promise<GetCoachesResponse> => {
    return apiClient.get<GetCoachesResponse>('/coaches');
  },

  /**
   * Create a new coach
   * @param coachData - Coach creation data
   * @returns Created coach
   */
  create: (coachData: CreateCoachRequest): Promise<CreateCoachResponse> => {
    return apiClient.post<CreateCoachResponse>('/coaches', coachData);
  },
};
