import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendancesApi } from '../services/resources/attendances.api';
import { playerKeys } from './usePlayers';

// Query keys
export const attendanceKeys = {
  all: ['attendances'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  byPlayer: (playerId: string) => [...attendanceKeys.all, 'player', playerId] as const,
  byDate: (date: string) => [...attendanceKeys.all, 'date', date] as const,
};

/**
 * Hook para obtener todas las asistencias
 */
export const useAttendances = () => {
  return useQuery({
    queryKey: attendanceKeys.lists(),
    queryFn: attendancesApi.getAll,
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchInterval: 1000 * 15, // Poll cada 15 segundos
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook para obtener asistencias de un jugador
 */
export const usePlayerAttendances = (playerId: string) => {
  return useQuery({
    queryKey: attendanceKeys.byPlayer(playerId),
    queryFn: () => attendancesApi.getByPlayerId(playerId),
    enabled: !!playerId,
  });
};

/**
 * Hook para registrar asistencia
 * Incluye optimistic update
 */
export const useRecordAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { playerId: string; status: 'Presente' | 'Ausente' }) =>
      attendancesApi.record(data),
    onMutate: async (newAttendance) => {
      await queryClient.cancelQueries({ queryKey: attendanceKeys.lists() });

      const previousAttendances = queryClient.getQueryData(attendanceKeys.lists());
      const today = new Date().toISOString().split('T')[0];

      // Optimistic update
      queryClient.setQueryData(attendanceKeys.lists(), (old: any) => {
        if (!old) return old;
        
        const existingIndex = old.findIndex(
          (a: any) => a.playerId === newAttendance.playerId && a.date === today
        );

        const newRecord = { ...newAttendance, date: today };

        if (existingIndex > -1) {
          const updated = [...old];
          updated[existingIndex] = newRecord;
          return updated;
        }
        return [...old, newRecord];
      });

      return { previousAttendances };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousAttendances) {
        queryClient.setQueryData(attendanceKeys.lists(), context.previousAttendances);
      }
    },
    onSuccess: () => {
      // Invalidar queries para sincronizar con servidor
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
    },
  });
};
