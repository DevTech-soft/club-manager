import React, {
  createContext,
  useState,
  useEffect,
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
import { api } from "../services/api";
import { FinishSetRequest, UpdateSetScoreRequest } from "@/services/api.types";


interface DataContextType {
  players: Player[];
  teams: Team[];
  attendances: Attendance[];
  coaches: Coach[];
  tournaments: Tournament[];
  loading: boolean;
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
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    // For background fetches, we don't want to show a loading spinner.
    // The main loading state is only for the initial page load.
    try {
      const [
        playersData,
        teamsData,
        attendancesData,
        coachesData,
        tournamentsData,
      ] = await Promise.all([
        api.getPlayers(),
        api.getTeams(),
        api.getAttendances(),
        api.getCoaches(),
        api.getTournaments(),
      ]);
      setPlayers(playersData);
      setTeams(teamsData);
      setAttendances(attendancesData);
      setCoaches(coachesData);
      setTournaments(tournamentsData);
      // console.log("Data fetched in background", playersData);
    } catch (error) {
      console.error("Failed to fetch data in background", error);
    } finally {
      // This ensures the main loading spinner is disabled after the first successful fetch.
      if (loading) {
        setLoading(false);
      }
    }
  }, [loading]);

  const createTeam = async (
    teamData: Omit<Team, "id" | "coach">
  ): Promise<Team> => {
    try {
      const newTeam = await api.createTeam(teamData);
      setTeams((prev) => [...prev, newTeam]); // Update local state only
      return newTeam;
    } catch (error) {
      console.error("Failed to create team:", error);
      throw error; // Re-throw so components can handle with toast
    }
  };

  const createPlayer = async (
    playerData: PlayerCreationData
  ): Promise<Player> => {
    try {
      const newPlayer = await api.createPlayer(playerData);
      setPlayers((prev) => [...prev, newPlayer]); // Update local state only
      return newPlayer;
    } catch (error) {
      console.error("Failed to create player:", error);
      throw error; // Re-throw so components can handle with toast
    }
  };

  const createCoach = async (coachData: CoachCreationData): Promise<Coach> => {
    try {
      const newCoach = await api.createCoach(coachData);
      setCoaches((prev) => [...prev, newCoach]); // Update local state only
      return newCoach;
    } catch (error) {
      console.error("Failed to create coach:", error);
      throw error; // Re-throw so components can handle with toast
    }
  };

  const recordAttendance = async (
    record: Pick<Attendance, "playerId" | "status">
  ) => {
    const today = new Date().toISOString().split("T")[0];
    const optimisticRecord: Attendance = { ...record, date: today };

    // Optimistic UI update for instant feedback to the user who performed the action.
    setAttendances((prev) => {
      const existingIndex = prev.findIndex(
        (a) => a.playerId === record.playerId && a.date === today
      );
      const newAttendances = [...prev];
      if (existingIndex > -1) {
        newAttendances[existingIndex] = optimisticRecord;
      } else {
        newAttendances.push(optimisticRecord);
      }
      return newAttendances;
    });

    try {
      await api.recordAttendance(record);
      // After successfully recording, refetch all data to sync state across all users.
      await fetchData();
    } catch (error) {
      console.error("Failed to record attendance, reverting state:", error);
      // On error, revert by refetching data from the server to undo the optimistic update.
      await fetchData();
      throw error;
    }
  };

  const updatePlayer = async (playerData: Player) => {
    try {
      await api.updatePlayer(playerData);
      setPlayers((prev) =>
        prev.map((player) => player.id === playerData.id ? playerData : player)
      ); // Update only the specific player
    } catch (error) {
      console.error("Failed to update player:", error);
      throw error; // Re-throw so components can handle with toast
    }
  };

  const updateTeam = async (teamData: Team) => {
    try {
      await api.updateTeam(teamData);
      setTeams((prev) =>
        prev.map((team) => team.id === teamData.id ? teamData : team)
      ); // Update only the specific team
    } catch (error) {
      console.error("Failed to update team:", error);
      throw error; // Re-throw so components can handle with toast
    }
  };

  const recordPlayerPayment = async (playerId: string) => {
    try {
      const updatedPlayer = await api.recordPlayerPayment(playerId);
      setPlayers((prev) =>
        prev.map((player) => player.id === playerId ? updatedPlayer : player)
      ); // Update only the specific player's payment status
    } catch (error) {
      console.error("Failed to record payment:", error);
      throw error; // Re-throw so components can handle with toast
    }
  };

  const createTournament = async (tournamentData: TournamentCreationData) => {
    try {
      const newTournament = await api.createTournament(tournamentData);
      setTournaments((prev) => [...prev, newTournament]); // Update local state only
      return newTournament;
    } catch (error) {
      console.error("Failed to create tournament:", error);
      throw error; // Re-throw so components can handle with toast
    }
  };

  const getTournamentById = async (tournamentId: string) => {
    const tournament = await api.getTournamentById(tournamentId);
    // No need to refetch all data for a read operation
    return tournament;
  };

  const updateTournament = async (tournamentData: Tournament) => {
    try {
      await api.updateTournament(tournamentData);
      setTournaments((prev) =>
        prev.map((tournament) => tournament.id === tournamentData.id ? tournamentData : tournament)
      ); // Update only the specific tournament
    } catch (error) {
      console.error("Failed to update tournament:", error);
      throw error; // Re-throw so components can handle with toast
    }
  };

  const deleteTournament = async (tournamentId: string) => {
    try {
      await api.deleteTournament(tournamentId);
      setTournaments((prev) => prev.filter((tournament) => tournament.id !== tournamentId)); // Remove from local state only
    } catch (error) {
      console.error("Failed to delete tournament:", error);
      throw error; // Re-throw so components can handle with toast
    }
  };

  const generateMatches = async (tournamentId: string) => {
    await api.createMatch({ tournamentId });
    await fetchData(); // Refetch to get the canonical state.
  };

  const deletePlayer = async (playerId: string) => {
    try {
      await api.deletePlayer(playerId);
      setPlayers((prev) => prev.filter((player) => player.id !== playerId)); // Remove from local state only
    } catch (error) {
      console.error("Failed to delete player:", error);
      throw error; // Re-throw so components can handle with toast
    }
  };

  const getMatchesByTournamentId = async (tournamentId: string) => {
    const matches = await api.getMatchesByTournamentId(tournamentId);
    // No need to refetch all data for a read operation
    return matches;
  };

  const generateGroupsAndMatches = async (tournamentId: string, groupsCount: number) => {
    await api.generateGroupsAndMatches(tournamentId, groupsCount);
    await fetchData(); // Refetch to get the canonical state.
  };

  const getGroupsByTournamentId = async (tournamentId: string) => {
    const groups = await api.getGroupsByTournamentId(tournamentId);
    // No need to refetch all data for a read operation
    return groups;
  };

  const getMatchesByGroupId = async (groupId: string) => {
    const matches = await api.getMatchesByGroupId(groupId);
    // No need to refetch all data for a read operation
    return matches;
  };

  const updateMatch = async (matchData: Match) => {
    const updatedMatch = await api.updateMatch(matchData);
    // Match updates don't affect our main state collections
    return updatedMatch;
  };

  const getMatchById = async (matchId: string) => {
    const match = await api.getMatchById(matchId);
    // No need to refetch all data for a read operation
    return match;
  }

  const finishMatch = async (matchId: string, data: { status: string; winnerId: string }) => {
    const updatedMatch = await api.finishMatch(matchId, data);
    // Match updates don't affect our main state collections
    return updatedMatch;
  };

  const createSet = async (matchId: string) => {
    const newSet = await api.createSet(matchId);
    // Set operations don't affect our main state collections
    return newSet;
  }

  const finishSet = async (matchId: string, setId: string, data: FinishSetRequest) => {
    const updatedSet = await api.finishSet(matchId, setId,  data);
    // Set operations don't affect our main state collections
    return updatedSet;
  };

  const updateSetScore = async (matchId: string, setId: string, data: UpdateSetScoreRequest) => {
    const updatedSet = await api.updateSetScore(matchId, setId, data);
    // Set operations don't affect our main state collections
    return updatedSet;
  };

  const getPositionsByTournamentId = async (tournamentId: string) => {
    const positions = await api.getPositionsByTournamentId(tournamentId);
    // No need to refetch all data for a read operation
    return positions;
  }

  // Initial data fetch on component mount.
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up smart polling to refetch data periodically for synchronization across users.
  // Only polls when document is visible to save resources.
  useEffect(() => {
    const pollingInterval = 30000; // Poll every 30 seconds (reduced from 15s for better performance)

    const pollIfVisible = () => {
      // Only fetch if the page is visible to the user
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    const intervalId = setInterval(pollIfVisible, pollingInterval);

    return () => clearInterval(intervalId); // Clean up interval on component unmount.
  }, [fetchData]);

  // Refetch data when the window/tab gets focus to ensure data is fresh.
  useEffect(() => {
    window.addEventListener("focus", fetchData);
    return () => {
      window.removeEventListener("focus", fetchData);
    };
  }, [fetchData]);

  return (
    <DataContext.Provider
      value={{
        players,
        teams,
        attendances,
        coaches,
        tournaments,
        loading,
        createTeam,
        createPlayer,
        createCoach,
        recordAttendance,
        updatePlayer,
        updateTeam,
        recordPlayerPayment,
        deletePlayer,
        refetchData: fetchData,
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
        finishSet,
        updateSetScore,
        createSet,
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
