/**
 * Calcula cuántos partidos juega cada equipo en round-robin
 * Si hay n equipos en un grupo, cada uno juega n-1 partidos
 */
function calcularPartidosPorEquipo(equiposPorGrupo: number): number {
  return equiposPorGrupo - 1;
}

/**
 * Calcula la distribución de equipos en grupos de forma balanceada
 * Retorna array con cantidad de equipos por grupo
 */
function calcularDistribucion(totalEquipos: number, numGrupos: number): number[] {
  const equiposPorGrupo = Math.floor(totalEquipos / numGrupos);
  const equiposRestantes = totalEquipos % numGrupos;

  const distribucion: number[] = [];
  for (let i = 0; i < numGrupos; i++) {
    // Los primeros 'equiposRestantes' grupos tienen un equipo extra
    distribucion.push(equiposPorGrupo + (i < equiposRestantes ? 1 : 0));
  }

  return distribucion;
}

/**
 * Calcula la "injusticia" de una configuración de grupos
 * Es la diferencia entre el máximo y mínimo de partidos que juega un equipo
 */
function calcularInjusticia(distribucion: number[]): number {
  const partidosPorEquipo = distribucion.map(calcularPartidosPorEquipo);
  const max = Math.max(...partidosPorEquipo);
  const min = Math.min(...partidosPorEquipo);
  return max - min;
}

/**
 * Calcula automáticamente el número óptimo de grupos para un torneo
 * Minimiza la diferencia de partidos entre equipos en diferentes grupos
 */
export function calcularGruposAuto(totalEquipos: number) {
  const minPorGrupo = 2; // Reducido de 3 a 2 para permitir más flexibilidad
  const maxPorGrupo = 5;

  // Caso especial: pocos equipos
  if (totalEquipos <= maxPorGrupo) return 1;

  let mejorOpcion = {
    grupos: 1,
    injusticia: Infinity,
    distribucion: [] as number[],
  };

  // Probar diferentes cantidades de grupos
  const maxGruposPosibles = Math.floor(totalEquipos / minPorGrupo);

  for (let numGrupos = 1; numGrupos <= maxGruposPosibles; numGrupos++) {
    const distribucion = calcularDistribucion(totalEquipos, numGrupos);

    // Verificar que todos los grupos estén dentro de los límites
    const todosDentroLimites = distribucion.every(
      (equipos) => equipos >= minPorGrupo && equipos <= maxPorGrupo
    );

    if (!todosDentroLimites) continue;

    const injusticia = calcularInjusticia(distribucion);

    // Preferir configuraciones con menor injusticia
    // En caso de empate, preferir menos grupos (más competitivo)
    if (injusticia < mejorOpcion.injusticia ||
        (injusticia === mejorOpcion.injusticia && numGrupos < mejorOpcion.grupos)) {
      mejorOpcion = { grupos: numGrupos, injusticia, distribucion };
    }
  }

  return mejorOpcion.grupos;
}
