import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playersApi } from '../services/resources/players.api';
import { Player, PlayerCreationData } from '../types';

// Query keys para cache organizado
export const playerKeys = {
  all: ['players'] as const,
  lists: () => [...playerKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...playerKeys.lists(), filters] as const,
  details: () => [...playerKeys.all, 'detail'] as const,
  detail: (id: string) => [...playerKeys.details(), id] as const,
};

/**
 * Hook para obtener todos los jugadores
 * Usa polling cada 30 segundos para sincronización
 */
export const usePlayers = () => {
  return useQuery({
    queryKey: playerKeys.lists(),
    queryFn: playersApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutos de datos frescos
    refetchInterval: 1000 * 30, // Poll cada 30 segundos
    refetchIntervalInBackground: false, // Solo cuando el tab está visible
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook para obtener un jugador por ID
 */
export const usePlayer = (id: string) => {
  return useQuery({
    queryKey: playerKeys.detail(id),
    queryFn: () => playersApi.getById(id),
    enabled: !!id, // Solo ejecutar si hay ID
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook para crear un jugador
 * Actualiza el cache automáticamente (optimistic update)
 */
export const useCreatePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlayerCreationData) => playersApi.create(data),
    onMutate: async (newPlayer) => {
      // Cancelar re-fetches en progreso
      await queryClient.cancelQueries({ queryKey: playerKeys.lists() });

      // Snapshot del valor anterior
      const previousPlayers = queryClient.getQueryData<Player[]>(playerKeys.lists());

      // Optimistic update
      const optimisticPlayer: Player = {
        ...newPlayer,
        id: 'temp-' + Date.now(),
        joinDate: new Date().toISOString(),
      } as Player;

      queryClient.setQueryData<Player[]>(playerKeys.lists(), (old) => {
        return old ? [optimisticPlayer, ...old] : [optimisticPlayer];
      });

      return { previousPlayers };
    },
    onError: (_err, _newPlayer, context) => {
      // Revertir en caso de error
      if (context?.previousPlayers) {
        queryClient.setQueryData(playerKeys.lists(), context.previousPlayers);
      }
    },
    onSuccess: () => {
      // Invalidar cache para re-fetch
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
    },
  });
};

/**
 * Hook para actualizar un jugador
 */
export const useUpdatePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Player) => playersApi.update(data),
    onSuccess: (data, variables) => {
      // Actualizar cache del jugador específico
      queryClient.setQueryData(playerKeys.detail(variables.id), data);
      // Invalidar lista
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
    },
  });
};

/**
 * Hook para eliminar un jugador
 */
export const useDeletePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => playersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
    },
  });
};

/**
 * Hook para registrar pago
 */
export const useRecordPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => playersApi.recordPayment(id),
    onSuccess: (data) => {
      queryClient.setQueryData(playerKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
    },
  });
};

/**
 * Hook para buscar jugador por documento
 */
export const usePlayerByDocument = (document: string) => {
  return useQuery({
    queryKey: [...playerKeys.all, 'document', document],
    queryFn: () => playersApi.getByDocument(document),
    enabled: !!document && document.length >= 5,
    staleTime: 1000 * 60 * 5,
  });
};
