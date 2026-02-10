import React, { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Loader } from './Loader';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemId: (item: T) => string;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Componente de lista virtualizada para renderizar grandes cantidades de items
 * Solo renderiza los items visibles en el viewport + overscan
 * 
 * @example
 * <VirtualList
 *   items={players}
 *   renderItem={(player) => <PlayerCard player={player} />}
 *   getItemId={(player) => player.id}
 *   itemHeight={72}
 *   containerHeight={500}
 *   onEndReached={loadMore}
 * />
 */
export function VirtualList<T>({
  items,
  renderItem,
  getItemId,
  itemHeight,
  containerHeight,
  overscan = 5,
  onEndReached,
  isLoadingMore = false,
  emptyMessage = 'No hay elementos para mostrar',
  className = '',
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const endReachedRef = useRef(false);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => itemHeight, [itemHeight]),
    overscan,
    getItemKey: useCallback(
      (index: number) => getItemId(items[index]),
      [items, getItemId]
    ),
  });

  // Detectar cuando se llega al final de la lista
  const handleScroll = useCallback(() => {
    if (!onEndReached || isLoadingMore) return;

    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Si llegamos al 90% del scroll y no hemos disparado el evento
    if (scrollPercentage > 0.9 && !endReachedRef.current) {
      endReachedRef.current = true;
      onEndReached();
    } else if (scrollPercentage <= 0.9) {
      endReachedRef.current = false;
    }
  }, [onEndReached, isLoadingMore]);

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full text-gray-500 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      onScroll={handleScroll}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
      
      {/* Indicador de carga al final */}
      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <Loader size="sm" />
        </div>
      )}
    </div>
  );
}

/**
 * Hook para usar virtualización en componentes personalizados
 */
export function useVirtualList<T>({
  items,
  itemHeight,
  overscan = 5,
}: {
  items: T[];
  itemHeight: number;
  overscan?: number;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => itemHeight, [itemHeight]),
    overscan,
  });

  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
  };
}
