import React, { memo, useCallback } from 'react';
import { Player } from '../../types';
import { User, Phone, Calendar, CreditCard, TrendingUp } from 'lucide-react';

interface OptimizedPlayerCardProps {
  player: Player;
  onClick?: (player: Player) => void;
  onPayment?: (playerId: string) => void;
  selected?: boolean;
}

/**
 * PlayerCard optimizado con memoización
 * Solo se re-renderiza si cambian las props relevantes
 */
export const OptimizedPlayerCard = memo(function OptimizedPlayerCard({
  player,
  onClick,
  onPayment,
  selected = false,
}: OptimizedPlayerCardProps) {
  // Memoizar callbacks para evitar re-renders innecesarios
  const handleClick = useCallback(() => {
    onClick?.(player);
  }, [onClick, player.id]);

  const handlePayment = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPayment?.(player.id);
  }, [onPayment, player.id]);

  // Calcular si el pago está vencido
  const isPaymentOverdue = React.useMemo(() => {
    if (!player.lastPaymentDate) return true;
    const lastPayment = new Date(player.lastPaymentDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastPayment < thirtyDaysAgo;
  }, [player.lastPaymentDate]);

  // Obtener el último registro de stats
  const latestStats = React.useMemo(() => {
    return player.statsHistory?.[0]?.stats;
  }, [player.statsHistory]);

  const averageStats = React.useMemo(() => {
    if (!latestStats) return 0;
    const { attack, defense, block, pass } = latestStats;
    return Math.round((attack + defense + block + pass) / 4);
  }, [latestStats]);

  return (
    <div
      onClick={handleClick}
      className={`
        relative p-4 rounded-lg border cursor-pointer transition-all duration-200
        ${selected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:shadow-md hover:border-gray-300'
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {player.avatarUrl ? (
            <img
              src={player.avatarUrl}
              alt={player.name}
              className="w-14 h-14 rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-7 h-7 text-gray-400" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {player.name}
          </h3>
          
          <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {player.phone}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(player.birthDate).toLocaleDateString()}
            </span>
          </div>

          {/* Categorías */}
          <div className="mt-2 flex flex-wrap gap-1">
            {player.mainCategories.map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700"
              >
                {cat}
              </span>
            ))}
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
              {player.subCategory}
            </span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
              {player.position}
            </span>
          </div>
        </div>

        {/* Stats y Acciones */}
        <div className="flex flex-col items-end gap-2">
          {/* Promedio de stats */}
          {averageStats > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="font-medium text-gray-700">{averageStats}</span>
            </div>
          )}

          {/* Botón de pago */}
          {onPayment && (
            <button
              onClick={handlePayment}
              className={`
                p-2 rounded-full transition-colors
                ${isPaymentOverdue
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
                }
              `}
              title={isPaymentOverdue ? 'Pago vencido' : 'Registrar pago'}
            >
              <CreditCard className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparación personalizada para memo
  // Solo re-renderizar si cambian estas props específicas
  return (
    prevProps.player.id === nextProps.player.id &&
    prevProps.player.lastPaymentDate === nextProps.player.lastPaymentDate &&
    prevProps.selected === nextProps.selected
  );
});
