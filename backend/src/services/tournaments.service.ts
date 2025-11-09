import { prisma } from '../config/database';
import type { TournamentCreationData } from '../types';
import { MapTournamentTeamsForFrontend } from '../utils/mappers';

/**
 * Service layer for Tournaments
 * Contains all business logic related to tournaments
 */

/**
 * Format tournament dates to YYYY-MM-DD
 */
const formatTournamentDates = (tournament: any) => ({
  ...tournament,
  startDate: tournament.startDate.toISOString().split('T')[0],
  endDate: tournament.endDate.toISOString().split('T')[0],
  registrationDeadline: tournament.registrationDeadline.toISOString().split('T')[0],
  registeredTeams: tournament.registeredTeams?.map((rt: any) => MapTournamentTeamsForFrontend(rt)) || [],
});

/**
 * Validate and prepare team registrations for STANDARD tournaments
 */
const prepareTeamRegistrations = async (registeredTeams: string[]) => {
  // Fetch teams from database
  const teams = await prisma.team.findMany({
    where: { id: { in: registeredTeams } },
  });

  // Validate that all teams have valid names
  const teamsWithoutName = teams.filter((t) => !t.name || t.name.trim() === '');
  if (teamsWithoutName.length > 0) {
    throw new Error(
      `Todos los equipos deben tener un nombre válido. Equipos sin nombre: ${teamsWithoutName.map((t) => t.id).join(', ')}`
    );
  }

  // Create TournamentTeam entries
  return {
    create: registeredTeams.map((teamId: string) => {
      const team = teams.find((t) => t.id === teamId);
      if (!team) {
        throw new Error(`Equipo con ID ${teamId} no encontrado`);
      }
      return {
        teamName: team.name,
        isExternal: false,
        externalClub: 'Sin club',
        team: { connect: { id: teamId } },
      };
    }),
  };
};

/**
 * Get all tournaments with registered teams
 */
export const getAllTournaments = async () => {
  const tournaments = await prisma.tournament.findMany({
    include: {
      registeredTeams: {
        include: {
          team: {
            include: {
              players: { select: { id: true } },
              coach: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
    orderBy: { startDate: 'desc' },
  });

  return tournaments.map(formatTournamentDates);
};

/**
 * Get a single tournament by ID
 */
export const getTournamentById = async (id: string) => {
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      registeredTeams: {
        include: {
          team: {
            include: {
              players: { select: { id: true } },
              coach: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
      groups: {
        include: {
          teams: true,
          matches: true,
        },
      },
    },
  });

  if (!tournament) {
    return null;
  }

  // Note: Don't format dates here to preserve original format for detailed view
  return tournament;
};

/**
 * Create a new tournament
 * Supports both QUICK and STANDARD types
 */
export const createTournament = async (tournamentData: any) => {
  const {
    id,
    type,
    quickTeamNames,
    registeredTeams,
    matches,
    groups,
    createdAt,
    updatedAt,
    ...data
  } = tournamentData;

  // Prepare team registrations for STANDARD tournaments
  let teamRegistrations = undefined;
  if (type === 'STANDARD' && registeredTeams && registeredTeams.length > 0) {
    teamRegistrations = await prepareTeamRegistrations(registeredTeams);
  }

  // Create tournament
  const tournament = await prisma.tournament.create({
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      registrationDeadline: new Date(data.registrationDeadline),
      type,
      quickTeamNames: quickTeamNames || [],
      registeredTeams: teamRegistrations,
    },
    include: {
      registeredTeams: {
        include: {
          team: {
            include: {
              players: { select: { id: true } },
              coach: { select: { firstName: true, lastName: true } },
              tournamentEntries: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  return tournament;
};

/**
 * Update a tournament
 */
export const updateTournament = async (id: string, tournamentData: any) => {
  const { registeredTeams, ...data } = tournamentData;

  const tournament = await prisma.tournament.update({
    where: { id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      registrationDeadline: data.registrationDeadline
        ? new Date(data.registrationDeadline)
        : undefined,
    },
    include: {
      registeredTeams: {
        include: {
          team: {
            include: {
              players: { select: { id: true } },
              coach: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
  });

  return tournament;
};

/**
 * Delete a tournament
 */
export const deleteTournament = async (id: string) => {
  await prisma.tournament.delete({
    where: { id },
  });

  return { success: true };
};
