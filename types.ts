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
  name:string;
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

export type TournamentCreationData = Omit<Tournament, 'id' >;

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  document: string;
  avatarUrl: string;
}

export type CoachCreationData = Omit<Coach, 'id'>;


export interface TournamentTeam {
  id: string;
  isExternal: boolean;
  externalClub?: string;
  team?: Team;
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