// Attendances API endpoints
import { apiClient } from '../apiClient';
import {
  GetAttendancesResponse,
  RecordAttendanceRequest,
  RecordAttendanceResponse,
} from '../api.types';

export const attendancesApi = {
  /**
   * Get all attendances
   * @returns List of all attendances
   */
  getAll: (): Promise<GetAttendancesResponse> => {
    return apiClient.get<GetAttendancesResponse>('/attendances');
  },

  /**
   * Record attendance for a player
   * @param record - Attendance record data
   * @returns Created attendance record
   */
  record: (record: RecordAttendanceRequest): Promise<RecordAttendanceResponse> => {
    return apiClient.post<RecordAttendanceResponse>('/attendances', record);
  },
};
