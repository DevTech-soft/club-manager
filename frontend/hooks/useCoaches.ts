import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coachesApi } from '../services/resources/coaches.api';
import { CoachCreationData } from '../types';

// Query keys
export const coachKeys = {
  all: ['coaches'] as const,
  lists: () => [...coachKeys.all, 'list'] as const,
  details: () => [...coachKeys.all, 'detail'] as const,
  detail: (id: string) => [...coachKeys.details(), id] as const,
};

/**
 * Hook para obtener todos los entrenadores
 */
export const useCoaches = () => {
  return useQuery({
    queryKey: coachKeys.lists(),
    queryFn: coachesApi.getAll,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60, // Poll cada minuto
    refetchIntervalInBackground: false,
  });
};

/**
 * Hook para crear un entrenador
 */
export const useCreateCoach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CoachCreationData) => coachesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachKeys.lists() });
    },
  });
};
