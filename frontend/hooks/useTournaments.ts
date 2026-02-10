import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tournamentsApi } from '../services/resources/tournaments.api';
import { Tournament, TournamentCreationData } from '../types';

// Query keys
export const tournamentKeys = {
  all: ['tournaments'] as const,
  lists: () => [...tournamentKeys.all, 'list'] as const,
  details: () => [...tournamentKeys.all, 'detail'] as const,
  detail: (id: string) => [...tournamentKeys.details(), id] as const,
  positions: (id: string) => [...tournamentKeys.detail(id), 'positions'] as const,
};

/**
 * Hook para obtener todos los torneos
 */
export const useTournaments = () => {
  return useQuery({
    queryKey: tournamentKeys.lists(),
    queryFn: tournamentsApi.getAll,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 30,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook para obtener un torneo por ID
 */
export const useTournament = (id: string) => {
  return useQuery({
    queryKey: tournamentKeys.detail(id),
    queryFn: () => tournamentsApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook para crear un torneo
 */
export const useCreateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TournamentCreationData) => tournamentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    },
  });
};

/**
 * Hook para actualizar un torneo
 */
export const useUpdateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Tournament) => tournamentsApi.update(data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(tournamentKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    },
  });
};

/**
 * Hook para eliminar un torneo
 */
export const useDeleteTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tournamentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    },
  });
};

/**
 * Hook para obtener posiciones de un torneo
 */
export const useTournamentPositions = (id: string) => {
  return useQuery({
    queryKey: tournamentKeys.positions(id),
    queryFn: () => tournamentsApi.getPositions(id),
    enabled: !!id,
    staleTime: 1000 * 30, // 30 segundos
  });
};
