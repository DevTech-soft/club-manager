import React, { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface Column<T> {
  key: string;
  header: React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  cell: (item: T, index: number) => React.ReactNode;
}

interface VirtualTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowHeight?: number;
  headerHeight?: number;
  containerHeight: number;
  getRowId: (item: T) => string;
  onRowClick?: (item: T) => void;
  selectedRowId?: string | null;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  overscan?: number;
}

/**
 * Tabla virtualizada para grandes datasets
 * Renderiza solo las filas visibles
 * 
 * @example
 * <VirtualTable
 *   data={players}
 *   columns={[
 *     { key: 'name', header: 'Nombre', cell: (p) => p.name },
 *     { key: 'position', header: 'Posición', cell: (p) => p.position },
 *   ]}
 *   getRowId={(p) => p.id}
 *   containerHeight={500}
 * />
 */
export function VirtualTable<T>({
  data,
  columns,
  rowHeight = 48,
  headerHeight = 40,
  containerHeight,
  getRowId,
  onRowClick,
  selectedRowId,
  isLoading = false,
  emptyMessage = 'No hay datos',
  className = '',
  overscan = 5,
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => rowHeight, [rowHeight]),
    overscan,
    getItemKey: useCallback(
      (index: number) => getRowId(data[index]),
      [data, getRowId]
    ),
  });

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center text-gray-500 ${className}`} style={{ height: containerHeight }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto border rounded-lg ${className}`}
      style={{ height: containerHeight }}
    >
      <table className="w-full border-collapse">
        {/* Header fijo */}
        <thead className="sticky top-0 z-10 bg-gray-50">
          <tr style={{ height: headerHeight }}>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b"
                style={{
                  width: column.width,
                  textAlign: column.align || 'left',
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body virtualizado */}
        <tbody>
          <tr>
            <td
              colSpan={columns.length}
              style={{ height: `${virtualizer.getTotalSize()}px`, padding: 0 }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const item = data[virtualRow.index];
                const rowId = getRowId(item);
                const isSelected = rowId === selectedRowId;

                return (
                  <div
                    key={virtualRow.key}
                    onClick={() => onRowClick?.(item)}
                    className={`
                      absolute left-0 w-full flex border-b border-gray-100
                      transition-colors duration-150
                      ${onRowClick ? 'cursor-pointer' : ''}
                      ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    `}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {columns.map((column) => (
                      <div
                        key={column.key}
                        className="px-4 py-2 text-sm text-gray-700 flex items-center overflow-hidden"
                        style={{
                          width: column.width,
                          flex: column.width ? undefined : 1,
                          justifyContent: column.align === 'center' ? 'center' : column.align === 'right' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        {column.cell(item, virtualRow.index)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/**
 * Hook para usar virtualización en tablas personalizadas
 */
export function useVirtualTable<T>({
  data,
  rowHeight = 48,
  overscan = 5,
}: {
  data: T[];
  rowHeight?: number;
  overscan?: number;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => rowHeight, [rowHeight]),
    overscan,
  });

  return {
    parentRef,
    virtualizer,
    virtualRows: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
  };
}
