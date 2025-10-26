export enum MainCategory {
  Masculino = 'Masculino',
  Femenino = 'Femenino',
  Mixto = 'Mixto',
}

export enum SubCategory {
  Basico = 'Básico',
  Intermedio = 'Intermedio',
  Avanzado = 'Avanzado',
}

export enum TournamentType {
  quick = 'QUICK',
  standard = 'STANDARD',
}

export enum Position {
  Setter = 'Colocador',
  Libero = 'Líbero',
  MiddleBlocker = 'Central',
  OutsideHitter = 'Punta Receptor',
  OppositeHitter = 'Opuesto',
}



export interface PlayerStats {
  attack: number;
  defense: number;
  block: number;
  pass: number;
}

export interface StatsRecord {
  id: string;
  date: string; // ISO string
  stats: PlayerStats;
}

export interface Player {
  id: string;
  name: string;
  document: string;
  address: string;
  phone: string;
  joinDate: string; // ISO string format
  birthDate: string; // YYYY-MM-DD
  avatarUrl: string;
  mainCategories: MainCategory[];
  subCategory: SubCategory;
  position: Position;
  statsHistory: StatsRecord[];
  lastPaymentDate?: string; // ISO string format
}

export type PlayerCreationData = Omit<Player, 'id' | 'joinDate' | 'statsHistory'> & {
  statsHistory: Omit<StatsRecord, 'id'>[];
};
export type TournamentCreationData = Omit<Tournament, 'id'>;

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  document: string;
  avatarUrl: string;
}

export type CoachCreationData = Omit<Coach, 'id'>;
export type MatchCreationData = Omit<Match, 'id'>;

export interface GenerateMatchesRequest {
  tournamentId: string;
}


export interface Team {
  id: string;
  name: string;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  playerIds: string[];
  tournament?: string;
  tournamentPosition?: string;
  coachId?: string;
  coach?: {
    firstName: string;
    lastName: string;
  };
}

export interface TournamentTeam {
  id: string;
  isExternal: boolean;
  externalClub?: string;
  // points?: number;
  team?: Team;
}


export interface TournamentGroup {
  id: string;
  tournamentId: string;
  name: string;
  matches: Match[];
  teams: TournamentTeam[];
  createdAt: string;
}


export interface Tournament {
  id: string;
  name: string;
  category: string;
  purpose: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  registrationDeadline: string;
  entryFee: number;
  description: string;
  rules: string;
  prizes: string;
  organizerContact: string;
  type?: TournamentType;
  quickTeamNames?: string[];
  registeredTeams?: TournamentTeam[];
  matches?: Match[];
  groups?: TournamentGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface TournamentPosition {
  id: string;
  teamName: string;
  teamId: string;
  played:   number;
  wins  :   number;
  draws :   number;
  losses:   number;
  points:   number;
  createdAt :String;
  updatedAt :String; 
}

export interface MatchSet {
  id: string;
  matchId: string;
  setNumber: number;
  teamAPoints: number;
  teamBPoints: number;
  winnerId?: string | null;
  status: "pending" |  "in_progress" | "finished";
}

export interface FinishSetResponse {
  finishedSet: MatchSet;
  nextSet: MatchSet;
  allSets: MatchSet[];
}

export interface Match {
  id: string;
  tournamentId: string;
  teamAId: string;
  teamBId: string;

  sportType: string;     
  round?: number | null;
  date?: string | Date | null;
  status: "pending" | "in_progress" | "finished";
  winnerId?: string | null;
  notes?: string | null;
  metadata?: Record<string, any> | null; 
  groupId?: string | null;
  sets?: MatchSet[]; 
}


export interface Attendance {
  playerId: string;
  date: string; // YYYY-MM-DD
  status: 'Presente' | 'Ausente';
}

export interface ClubSettings {
  name: string;
  logoUrl: string;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
  },
  teamCreationEnabled: boolean;
  monthlyPaymentEnabled: boolean;
}