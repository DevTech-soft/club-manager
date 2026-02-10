import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import {
  Player,
  Team,
  Attendance,
  PlayerCreationData,
  Coach,
  CoachCreationData,
  Tournament,
  TournamentCreationData,
  Match,
  TournamentGroup,
  MatchSet,
  FinishSetResponse,
  TournamentPosition,
} from "../types";
import { playersApi } from "../services/resources/players.api";
import { teamsApi } from "../services/resources/teams.api";
import { attendancesApi } from "../services/resources/attendances.api";
import { coachesApi } from "../services/resources/coaches.api";
import { tournamentsApi } from "../services/resources/tournaments.api";
import { groupsApi } from "../services/resources/groups.api";
import { matchesApi } from "../services/resources/matches.api";
import { FinishSetRequest, UpdateSetScoreRequest } from "@/services/api.types";
// queryClient ya no es necesario aquí, usamos useQueryClient
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Query keys
const keys = {
  players: ["players"] as const,
  teams: ["teams"] as const,
  attendances: ["attendances"] as const,
  coaches: ["coaches"] as const,
  tournaments: ["tournaments"] as const,
};

interface DataContextType {
  players: Player[];
  teams: Team[];
  attendances: Attendance[];
  coaches: Coach[];
  tournaments: Tournament[];
  loading: boolean;
  error: Error | null;
  createTeam: (teamData: Omit<Team, "id" | "coach">) => Promise<Team>;
  createPlayer: (playerData: PlayerCreationData) => Promise<Player>;
  createCoach: (coachData: CoachCreationData) => Promise<Coach>;
  recordAttendance: (
    record: Pick<Attendance, "playerId" | "status">
  ) => Promise<void>;
  updatePlayer: (playerData: Player) => Promise<void>;
  updateTeam: (teamData: Team) => Promise<void>;
  recordPlayerPayment: (playerId: string) => Promise<void>;
  deletePlayer: (playerId: string) => Promise<void>;
  refetchData: () => void;
  createTournament: (
    tournamentData: Omit<Tournament, "id">
  ) => Promise<Tournament>;
  updateTournament: (tournamentData: Tournament) => Promise<void>;
  deleteTournament: (tournamentId: string) => Promise<void>;
  getTournamentById: (tournamentId: string) => Promise<Tournament | undefined>;
  generateMatches: (tournamentId: string) => Promise<void>;
  getMatchesByTournamentId: (tournamentId: string) => Promise<Match[]>;
  generateGroupsAndMatches: (tournamentId: string, groupsCount: number) => Promise<void>;
  getGroupsByTournamentId: (tournamentId: string) => Promise<TournamentGroup[]>;
  getMatchesByGroupId: (groupId: string) => Promise<Match[]>;
  updateMatch: (matchData: Match) => Promise<Match>;
  getMatchById: (matchId: string) => Promise<Match | undefined>;
  createSet: (matchId: string) => Promise<MatchSet>;
  finishSet: (matchId: string, setId: string, data: FinishSetRequest) => Promise<FinishSetResponse>;
  updateSetScore: (matchId: string, setId: string, data: UpdateSetScoreRequest) => Promise<MatchSet>;
  finishMatch: (matchId: string, data: { status: string; winnerId: string }) => Promise<Match>;
  getPositionsByTournamentId: (tournamentId: string) => Promise<TournamentPosition[]>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();

  // Queries
  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: keys.players,
    queryFn: playersApi.getAll,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 30,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: keys.teams,
    queryFn: teamsApi.getAll,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 30,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const { data: attendances = [], isLoading: attendancesLoading } = useQuery({
    queryKey: keys.attendances,
    queryFn: attendancesApi.getAll,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 15,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const { data: coaches = [], isLoading: coachesLoading } = useQuery({
    queryKey: keys.coaches,
    queryFn: coachesApi.getAll,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: false,
  });

  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery({
    queryKey: keys.tournaments,
    queryFn: tournamentsApi.getAll,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 30,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  // Loading global
  const loading = playersLoading || teamsLoading || attendancesLoading || coachesLoading || tournamentsLoading;

  // Mutations
  const createPlayerMutation = useMutation({
    mutationFn: playersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.players });
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: teamsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.teams });
    },
  });

  const createCoachMutation = useMutation({
    mutationFn: coachesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.coaches });
    },
  });

  const recordAttendanceMutation = useMutation({
    mutationFn: attendancesApi.record,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.attendances });
      queryClient.invalidateQueries({ queryKey: keys.players });
    },
  });

  const updatePlayerMutation = useMutation({
    mutationFn: playersApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.players });
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: teamsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.teams });
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: playersApi.recordPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.players });
    },
  });

  const deletePlayerMutation = useMutation({
    mutationFn: playersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.players });
    },
  });

  const createTournamentMutation = useMutation({
    mutationFn: tournamentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.tournaments });
    },
  });

  const updateTournamentMutation = useMutation({
    mutationFn: tournamentsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.tournaments });
    },
  });

  const deleteTournamentMutation = useMutation({
    mutationFn: tournamentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.tournaments });
    },
  });

  // Funciones del contexto (mantienen misma interfaz)
  const createTeam = async (teamData: Omit<Team, "id" | "coach">): Promise<Team> => {
    return createTeamMutation.mutateAsync(teamData);
  };

  const createPlayer = async (playerData: PlayerCreationData): Promise<Player> => {
    return createPlayerMutation.mutateAsync(playerData);
  };

  const createCoach = async (coachData: CoachCreationData): Promise<Coach> => {
    return createCoachMutation.mutateAsync(coachData);
  };

  const recordAttendance = async (record: Pick<Attendance, "playerId" | "status">) => {
    await recordAttendanceMutation.mutateAsync(record);
  };

  const updatePlayer = async (playerData: Player) => {
    await updatePlayerMutation.mutateAsync(playerData);
  };

  const updateTeam = async (teamData: Team) => {
    await updateTeamMutation.mutateAsync(teamData);
  };

  const recordPlayerPayment = async (playerId: string) => {
    await recordPaymentMutation.mutateAsync(playerId);
  };

  const deletePlayer = async (playerId: string) => {
    await deletePlayerMutation.mutateAsync(playerId);
  };

  const refetchData = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  const createTournament = async (tournamentData: Omit<Tournament, "id">): Promise<Tournament> => {
    return createTournamentMutation.mutateAsync(tournamentData);
  };

  const updateTournament = async (tournamentData: Tournament) => {
    await updateTournamentMutation.mutateAsync(tournamentData);
  };

  const deleteTournament = async (tournamentId: string) => {
    await deleteTournamentMutation.mutateAsync(tournamentId);
  };

  const getTournamentById = async (tournamentId: string): Promise<Tournament | undefined> => {
    return tournamentsApi.getById(tournamentId);
  };

  const generateMatches = async (tournamentId: string) => {
    await matchesApi.create({ tournamentId });
    await refetchData();
  };

  const getMatchesByTournamentId = async (tournamentId: string): Promise<Match[]> => {
    return matchesApi.getByTournamentId(tournamentId);
  };

  const generateGroupsAndMatches = async (tournamentId: string, groupsCount: number) => {
    await groupsApi.generateGroupsAndMatches(tournamentId, groupsCount);
    await refetchData();
  };

  const getGroupsByTournamentId = async (tournamentId: string): Promise<TournamentGroup[]> => {
    return groupsApi.getByTournamentId(tournamentId);
  };

  const getMatchesByGroupId = async (groupId: string): Promise<Match[]> => {
    return matchesApi.getByGroupId(groupId);
  };

  const updateMatch = async (matchData: Match): Promise<Match> => {
    return matchesApi.update(matchData);
  };

  const getMatchById = async (matchId: string): Promise<Match | undefined> => {
    return matchesApi.getById(matchId);
  };

  const createSet = async (matchId: string): Promise<MatchSet> => {
    return matchesApi.createSet(matchId);
  };

  const finishSet = async (matchId: string, setId: string, data: FinishSetRequest): Promise<FinishSetResponse> => {
    return matchesApi.finishSet(matchId, setId, data);
  };

  const updateSetScore = async (matchId: string, setId: string, data: UpdateSetScoreRequest): Promise<MatchSet> => {
    return matchesApi.updateSetScore(matchId, setId, data);
  };

  const finishMatch = async (matchId: string, data: { status: string; winnerId: string }): Promise<Match> => {
    return matchesApi.finish(matchId, data);
  };

  const getPositionsByTournamentId = async (tournamentId: string): Promise<TournamentPosition[]> => {
    return tournamentsApi.getPositions(tournamentId);
  };

  return (
    <DataContext.Provider
      value={{
        players,
        teams,
        attendances,
        coaches,
        tournaments,
        loading,
        error: null,
        createTeam,
        createPlayer,
        createCoach,
        recordAttendance,
        updatePlayer,
        updateTeam,
        recordPlayerPayment,
        deletePlayer,
        refetchData,
        createTournament,
        updateTournament,
        deleteTournament,
        getTournamentById,
        generateMatches,
        getMatchesByTournamentId,
        generateGroupsAndMatches,
        getGroupsByTournamentId,
        getMatchesByGroupId,
        updateMatch,
        getMatchById,
        createSet,
        finishSet,
        updateSetScore,
        finishMatch,
        getPositionsByTournamentId,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
