import { prisma } from '../config/database';
import { calcularGruposAuto } from '../utils/tournaments';
import { updateTournamentPositions } from './positions.service';

/**
 * Service layer for Matches
 * Contains all business logic related to tournament matches
 */

/**
 * Get matches by tournament ID
 */
export const getMatchesByTournament = async (tournamentId: string) => {
  const matches = await prisma.match.findMany({
    where: { tournamentId },
  });

  return matches;
};

/**
 * Get matches by group ID
 */
export const getMatchesByGroup = async (groupId: string) => {
  const matches = await prisma.match.findMany({
    where: { groupId },
    include: {
      group: true,
    },
  });

  return matches;
};

/**
 * Get a single match by ID with full details
 */
export const getMatchById = async (id: string) => {
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      teamA: {
        include: {
          team: {
            include: {
              players: true,
              coach: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
      teamB: {
        include: {
          team: {
            include: {
              players: true,
              coach: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
      sets: {
        orderBy: { setNumber: 'asc' },
      },
      group: true,
      tournament: true,
    },
  });

  if (!match) {
    return null;
  }

  // Add friendly team names
  const cleanMatch = {
    ...match,
    teamAName: match.teamA.team?.name || match.teamA.teamName,
    teamBName: match.teamB.team?.name || match.teamB.teamName,
  };

  return cleanMatch;
};

/**
 * Generate matches for a tournament (round robin - all vs all)
 */
export const generateMatches = async (tournamentId: string) => {
  // Get all registered teams
  const registrations = await prisma.tournamentTeam.findMany({
    where: { tournamentId },
  });

  if (registrations.length < 2) {
    throw new Error('At least 2 teams required');
  }

  // Create match records (round robin - everyone plays everyone)
  const toCreate = [];
  for (let i = 0; i < registrations.length; i++) {
    for (let j = i + 1; j < registrations.length; j++) {
      toCreate.push({
        data: {
          tournamentId,
          teamAId: registrations[i].id,
          teamBId: registrations[j].id,
          sportType: 'volleyball',
          status: 'pending',
        },
      });
    }
  }

  // Execute in transaction
  const createdMatches = await prisma.$transaction(
    toCreate.map((item) => prisma.match.create(item))
  );

  return {
    created: createdMatches.length,
    matches: createdMatches,
  };
};

/**
 * Generate groups and matches automatically
 * Uses calcularGruposAuto to determine optimal number of groups
 * Distributes teams randomly and creates round-robin matches within each group
 */
export const generateGroupsAndMatches = async (tournamentId: string) => {
  // Get all teams
  const teams = await prisma.tournamentTeam.findMany({
    where: { tournamentId },
  });

  if (teams.length < 2) {
    throw new Error('At least 2 teams required');
  }

  // Calculate optimal number of groups
  const groupsCount = calcularGruposAuto(teams.length);

  // Shuffle teams randomly
  const shuffled = [...teams].sort(() => Math.random() - 0.5);

  // Create empty groups array
  const groups: any[] = Array.from({ length: groupsCount }, () => []);

  // Distribute teams in balanced round-robin style
  shuffled.forEach((team, i) => {
    groups[i % groupsCount].push(team);
  });

  // Transaction: create groups and matches
  const createdGroups = await prisma.$transaction(async (tx) => {
    const groupRecords = [];
    const matchRecords = [];

    for (let g = 0; g < groups.length; g++) {
      // Create group (A, B, C...)
      const groupName = `Grupo ${String.fromCharCode(65 + g)}`;
      const group = await tx.tournamentGroup.create({
        data: { tournamentId, name: groupName },
      });
      groupRecords.push(group);

      // Assign teams to group
      for (const team of groups[g]) {
        await tx.tournamentTeam.update({
          where: { id: team.id },
          data: { groupId: group.id },
        });
      }

      // Generate round-robin matches within the group
      for (let i = 0; i < groups[g].length; i++) {
        for (let j = i + 1; j < groups[g].length; j++) {
          matchRecords.push({
            tournamentId,
            groupId: group.id,
            teamAId: groups[g][i].id,
            teamBId: groups[g][j].id,
            sportType: 'volleyball',
            status: 'pending',
          });
        }
      }
    }

    // Create all matches
    await tx.match.createMany({ data: matchRecords, skipDuplicates: true });

    return { groups: groupRecords, matches: matchRecords.length };
  });

  return {
    message: `✅ Se generaron automáticamente ${createdGroups.groups.length} grupos y ${createdGroups.matches} encuentros.`,
    groups: createdGroups.groups,
    matchesCount: createdGroups.matches,
  };
};

/**
 * Update a match
 */
export const updateMatch = async (id: string, data: any) => {
  const match = await prisma.match.update({
    where: { id },
    data: {
      tournament: data.tournamentId
        ? { connect: { id: data.tournamentId } }
        : undefined,
      group: data.groupId ? { connect: { id: data.groupId } } : undefined,
      date: data.date,
      status: data.status,
      sets: data.sets,
      winnerId: data.winnerId,
    },
  });

  return match;
};

/**
 * Finish a match and update tournament positions
 */
export const finishMatch = async (
  id: string,
  status: string,
  winnerId: string
) => {
  const updatedMatch = await prisma.match.update({
    where: { id },
    data: { status, winnerId },
    include: { teamA: true, teamB: true, sets: true, tournament: true },
  });

  // Update tournament positions
  await updateTournamentPositions(id);

  return updatedMatch;
};
