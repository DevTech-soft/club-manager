import { prisma } from '../config/database';

/**
 * Service layer for Tournament Positions
 * Contains all business logic related to tournament position tables
 */

/**
 * Get tournament positions table
 * Ordered by points descending
 */
export const getTournamentPositions = async (tournamentId: string) => {
  const positions = await prisma.tournamentPosition.findMany({
    where: { tournamentId },
    orderBy: { points: 'desc' },
  });

  return positions;
};

/**
 * Update tournament positions based on a finished match
 * This function calculates points, sets won/lost, and updates the position table
 */
export const updateTournamentPositions = async (matchId: string) => {
  // Fetch match with all necessary data
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      teamA: true,
      teamB: true,
      sets: true,
      tournament: true,
    },
  });

  if (!match) {
    throw new Error('Match not found');
  }

  // Calculate sets won by each team
  const teamAWins = match.sets.filter((s) => s.winnerId === match.teamAId).length;
  const teamBWins = match.sets.filter((s) => s.winnerId === match.teamBId).length;

  console.log(`Sets in match ${matchId}:`, match.sets);
  console.log(
    `Updating positions for match ${matchId}: Team A wins ${teamAWins}, Team B wins ${teamBWins}`
  );

  // Calculate sets won/lost
  const setsA = { won: teamAWins, lost: teamBWins };
  const setsB = { won: teamBWins, lost: teamAWins };

  // Calculate points scored
  const pointsA = match.sets.reduce((acc, set) => acc + set.teamAPoints, 0);
  const pointsB = match.sets.reduce((acc, set) => acc + set.teamBPoints, 0);

  // Determine match result and assign points
  let resultA = { wins: 0, draws: 0, losses: 0, points: 0 };
  let resultB = { wins: 0, draws: 0, losses: 0, points: 0 };

  if (teamAWins > teamBWins) {
    resultA = { wins: 1, draws: 0, losses: 0, points: 3 };
    resultB = { wins: 0, draws: 0, losses: 1, points: 0 };
  } else if (teamBWins > teamAWins) {
    resultB = { wins: 1, draws: 0, losses: 0, points: 3 };
    resultA = { wins: 0, draws: 0, losses: 1, points: 0 };
  } else {
    // Draw (rare in volleyball but supported)
    resultA = resultB = { wins: 0, draws: 1, losses: 0, points: 1 };
  }

  // Update or create position for Team A
  const existingPositionA = await prisma.tournamentPosition.findFirst({
    where: {
      tournamentId: match.tournamentId,
      teamName: match.teamA.teamName,
    },
  });

  if (existingPositionA) {
    await prisma.tournamentPosition.update({
      where: { id: existingPositionA.id },
      data: {
        played: { increment: 1 },
        wins: { increment: resultA.wins },
        draws: { increment: resultA.draws },
        losses: { increment: resultA.losses },
        points: { increment: resultA.points },
        setsWon: { increment: setsA.won },
        setsLost: { increment: setsA.lost },
        pointsFor: { increment: pointsA },
        pointsAgainst: { increment: pointsB },
      },
    });
  } else {
    await prisma.tournamentPosition.create({
      data: {
        tournamentId: match.tournamentId,
        teamName: match.teamA.teamName,
        played: 1,
        wins: resultA.wins,
        draws: resultA.draws,
        losses: resultA.losses,
        points: resultA.points,
        setsWon: setsA.won,
        setsLost: setsA.lost,
        pointsFor: pointsA,
        pointsAgainst: pointsB,
      },
    });
  }

  // Update or create position for Team B
  const existingPositionB = await prisma.tournamentPosition.findFirst({
    where: {
      tournamentId: match.tournamentId,
      teamName: match.teamB.teamName,
    },
  });

  if (existingPositionB) {
    await prisma.tournamentPosition.update({
      where: { id: existingPositionB.id },
      data: {
        played: { increment: 1 },
        wins: { increment: resultB.wins },
        draws: { increment: resultB.draws },
        losses: { increment: resultB.losses },
        points: { increment: resultB.points },
        setsWon: { increment: setsB.won },
        setsLost: { increment: setsB.lost },
        pointsFor: { increment: pointsB },
        pointsAgainst: { increment: pointsA },
      },
    });
  } else {
    await prisma.tournamentPosition.create({
      data: {
        tournamentId: match.tournamentId,
        teamName: match.teamB.teamName,
        played: 1,
        wins: resultB.wins,
        draws: resultB.draws,
        losses: resultB.losses,
        points: resultB.points,
        setsWon: setsB.won,
        setsLost: setsB.lost,
        pointsFor: pointsB,
        pointsAgainst: pointsA,
      },
    });
  }
};
