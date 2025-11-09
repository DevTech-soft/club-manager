import type { Player } from '../types';

// --- ENUM MAPPINGS ---
// To handle discrepancies between frontend display values and Prisma enum keys.

export const subCategoryToPrisma: { [key: string]: 'Basico' | 'Intermedio' | 'Avanzado' } = {
  'Básico': 'Basico',
  'Intermedio': 'Intermedio',
  'Avanzado': 'Avanzado',
};

export const subCategoryFromPrisma: { [key: string]: string } = {
  'Basico': 'Básico',
  'Intermedio': 'Intermedio',
  'Avanzado': 'Avanzado',
};

export const positionToPrisma: { [key: string]: 'Setter' | 'Libero' | 'MiddleBlocker' | 'OutsideHitter' | 'OppositeHitter' } = {
  'Colocador': 'Setter',
  'Líbero': 'Libero',
  'Central': 'MiddleBlocker',
  'Punta Receptor': 'OutsideHitter',
  'Opuesto': 'OppositeHitter',
};

export const positionFromPrisma: { [key: string]: string } = {
  'Setter': 'Colocador',
  'Libero': 'Líbero',
  'MiddleBlocker': 'Central',
  'OutsideHitter': 'Punta Receptor',
  'OppositeHitter': 'Opuesto',
};

// MainCategory enum values match Prisma keys, so no mapping is needed.

// --- HELPER FUNCTIONS FOR DATA MAPPING ---

export const mapPlayerForFrontend = (player: any): Player => {
  if (!player) return player;
  const { birthDate, joinDate, lastPaymentDate, statsHistory, ...rest } = player;
  return {
    ...rest,
    birthDate: birthDate.toISOString().split('T')[0],
    joinDate: joinDate.toISOString(),
    lastPaymentDate: lastPaymentDate ? lastPaymentDate.toISOString() : undefined,
    statsHistory: statsHistory.map((sh: any) => ({ ...sh, stats: sh.stats as any, date: sh.date.toISOString() })),
    subCategory: subCategoryFromPrisma[player.subCategory] || player.subCategory,
    position: positionFromPrisma[player.position] || player.position,
  };
};

export const mapTeamForFrontend = (team: any) => {
  if (!team) return team;
  const { players, ...teamData } = team;
  return {
    ...teamData,
    playerIds: players.map((p: { id: string }) => p.id),
    subCategory: subCategoryFromPrisma[teamData.subCategory] || teamData.subCategory,
  };
};

export const MapTournamentTeamsForFrontend = (tournamentTeam: any) => {
  if (!tournamentTeam) return tournamentTeam;

  const { team, ...teamEntryData } = tournamentTeam;
  const players = team?.players || [];

  return {
    ...teamEntryData,
    ...team,
    playerIds: players.map((p: { id: string }) => p.id),
    subCategory: subCategoryFromPrisma[team?.subCategory] || team?.subCategory,
  };
};
