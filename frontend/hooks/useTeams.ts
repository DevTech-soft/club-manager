import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi } from '../services/resources/teams.api';
import { Team } from '../types';

// Query keys
export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...teamKeys.lists(), filters] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

/**
 * Hook para obtener todos los equipos
 */
export const useTeams = () => {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: teamsApi.getAll,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 30,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook para obtener un equipo por ID
 */
export const useTeam = (id: string) => {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => teamsApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook para crear un equipo
 */
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Team, 'id' | 'coach'>) => teamsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

/**
 * Hook para actualizar un equipo
 */
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Team) => teamsApi.update(data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(teamKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};
