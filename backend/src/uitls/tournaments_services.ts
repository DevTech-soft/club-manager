export function calcularGruposAuto(totalEquipos: number) {
  const minPorGrupo = 3;
  const maxPorGrupo = 5;

  if (totalEquipos <= maxPorGrupo) return 1;

  // Estimación base: idealmente 4 por grupo
  let grupos = Math.round(totalEquipos / 4);

  // Ajuste para no pasarse de límites
  if (totalEquipos / grupos > maxPorGrupo) grupos++;
  if (totalEquipos / grupos < minPorGrupo) grupos--;

  return Math.max(1, grupos);
}
