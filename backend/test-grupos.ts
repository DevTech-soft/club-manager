/**
 * Script de prueba para validar el algoritmo de distribución de grupos
 * Ejecutar con: npx ts-node test-grupos.ts
 */

function calcularPartidosPorEquipo(equiposPorGrupo: number): number {
  return equiposPorGrupo - 1;
}

function calcularDistribucion(totalEquipos: number, numGrupos: number): number[] {
  const equiposPorGrupo = Math.floor(totalEquipos / numGrupos);
  const equiposRestantes = totalEquipos % numGrupos;

  const distribucion: number[] = [];
  for (let i = 0; i < numGrupos; i++) {
    distribucion.push(equiposPorGrupo + (i < equiposRestantes ? 1 : 0));
  }

  return distribucion;
}

function calcularInjusticia(distribucion: number[]): number {
  const partidosPorEquipo = distribucion.map(calcularPartidosPorEquipo);
  const max = Math.max(...partidosPorEquipo);
  const min = Math.min(...partidosPorEquipo);
  return max - min;
}

function calcularGruposAuto(totalEquipos: number) {
  const minPorGrupo = 2;
  const maxPorGrupo = 5;

  // Para el caso especial, retornar objeto completo
  if (totalEquipos <= maxPorGrupo) {
    return {
      grupos: 1,
      injusticia: 0,
      distribucion: [totalEquipos],
    };
  }

  let mejorOpcion = {
    grupos: 1,
    injusticia: Infinity,
    distribucion: [] as number[],
  };

  const maxGruposPosibles = Math.floor(totalEquipos / minPorGrupo);

  for (let numGrupos = 1; numGrupos <= maxGruposPosibles; numGrupos++) {
    const distribucion = calcularDistribucion(totalEquipos, numGrupos);

    const todosDentroLimites = distribucion.every(
      (equipos) => equipos >= minPorGrupo && equipos <= maxPorGrupo
    );

    if (!todosDentroLimites) continue;

    const injusticia = calcularInjusticia(distribucion);

    if (injusticia < mejorOpcion.injusticia ||
        (injusticia === mejorOpcion.injusticia && numGrupos < mejorOpcion.grupos)) {
      mejorOpcion = { grupos: numGrupos, injusticia, distribucion };
    }
  }

  return mejorOpcion;
}

function calcularTotalPartidos(distribucion: number[]): number {
  return distribucion.reduce((total, equipos) => {
    // En round-robin: C(n,2) = n*(n-1)/2
    return total + (equipos * (equipos - 1)) / 2;
  }, 0);
}

// Pruebas con diferentes números de equipos
console.log('='.repeat(80));
console.log('ANÁLISIS DE DISTRIBUCIÓN DE GRUPOS - ALGORITMO MEJORADO');
console.log('='.repeat(80));
console.log();

const casos = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

for (const equipos of casos) {
  const resultado = calcularGruposAuto(equipos);
  const totalPartidos = calcularTotalPartidos(resultado.distribucion);
  const partidosPorEquipo = resultado.distribucion.map(calcularPartidosPorEquipo);

  console.log(`\n📊 ${equipos} EQUIPOS:`);
  console.log(`   Grupos: ${resultado.grupos}`);
  console.log(`   Distribución: ${resultado.distribucion.join(', ')}`);
  console.log(`   Partidos por equipo: ${partidosPorEquipo.join(', ')}`);
  console.log(`   Injusticia: ${resultado.injusticia} partido${resultado.injusticia !== 1 ? 's' : ''} de diferencia`);
  console.log(`   Total de partidos: ${totalPartidos}`);

  if (resultado.injusticia === 0) {
    console.log('   ✅ Distribución PERFECTA');
  } else if (resultado.injusticia === 1) {
    console.log('   ⚠️  Distribución ACEPTABLE (1 partido de diferencia)');
  } else {
    console.log('   ❌ Distribución DESBALANCEADA');
  }
}

console.log('\n' + '='.repeat(80));
console.log('FIN DEL ANÁLISIS');
console.log('='.repeat(80));
