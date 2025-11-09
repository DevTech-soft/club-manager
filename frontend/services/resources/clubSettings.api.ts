// Club Settings API endpoints
import { apiClient } from '../apiClient';
import {
  GetClubSettingsResponse,
  UpdateClubSettingsRequest,
  UpdateClubSettingsResponse,
} from '../api.types';

export const clubSettingsApi = {
  /**
   * Get club settings
   * @returns Club settings
   */
  get: (): Promise<GetClubSettingsResponse> => {
    return apiClient.get<GetClubSettingsResponse>('/club-settings');
  },

  /**
   * Update club settings
   * @param settings - Updated club settings
   * @returns Updated club settings
   */
  update: (settings: UpdateClubSettingsRequest): Promise<UpdateClubSettingsResponse> => {
    return apiClient.put<UpdateClubSettingsResponse>('/club-settings', settings);
  },
};
