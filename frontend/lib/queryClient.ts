import { QueryClient } from '@tanstack/react-query';

/**
 * Configuración del QueryClient para TanStack Query
 * Optimizado para el Club Manager
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuración de caché
      staleTime: 1000 * 60 * 5, // 5 minutos por defecto
      gcTime: 1000 * 60 * 30, // 30 minutos (antes cacheTime)
      
      // Configuración de reintentos
      retry: (failureCount, error: any) => {
        // No reintentar en errores 4xx (cliente)
        if (error?.status >= 400 && error?.status < 500) return false;
        // Máximo 3 reintentos
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Configuración de refetch
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Configuración de polling
      refetchIntervalInBackground: false,
    },
    mutations: {
      // Reintentar mutaciones solo en errores de red
      retry: (failureCount, error: any) => {
        if (error?.status >= 500) return failureCount < 2;
        return false;
      },
    },
  },
});

/**
 * Helper para prefetch de datos
 * Útil para rutas que se anticipan
 */
export const prefetchData = async <T>(
  queryKey: readonly unknown[],
  fetchFn: () => Promise<T>
) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: fetchFn,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Helper para invalidar múltiples queries
 */
export const invalidateQueries = async (patterns: string[]) => {
  for (const pattern of patterns) {
    await queryClient.invalidateQueries({
      queryKey: [pattern],
    });
  }
};

/**
 * Helper para cancelar queries en progreso
 * Útil cuando el componente se desmonta
 */
export const cancelQueries = async (queryKey: readonly unknown[]) => {
  await queryClient.cancelQueries({ queryKey });
};
