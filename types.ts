
export enum Category {
  CREATIVE = 'Creative',
  TECH = 'Tech',
  MEDIA = 'Media',
  HEALTH = 'Health',
  SCOREBOARD = 'Scoreboard'
}

export interface Metric {
  label: string;
  value: number;
  target: number;
  unit: string;
}

export interface Project {
  id: string;
  name: string;
  theme: string;
  progress: number;
  milestones: string[];
  tasks: string[];
}

export interface WeeklyData {
  week: number;
  writingDays: number; // 0-7
  milestoneMoved: boolean;
  techProgress: number; // 0-100
  booksFinished: number;
  mediaLogged: number; // films + albums
  weightTrend: 'down' | 'stable' | 'up';
}

// --- Data Entry Types ---

export interface WritingEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  project: 'xavier-transport' | 'which-direction-home' | 'schafer-cookbook';
  wordCount: number;
  sessionMinutes: number;
  notes: string;
}

export interface TechLogEntry {
  id: string;
  date: string;
  project: 'deep-seats' | 'side-app' | 'ai-learning';
  task: string;
  hoursSpent: number;
  milestone: string;
  completed: boolean;
}

export interface MediaEntry {
  id: string;
  date: string;
  type: 'book' | 'film' | 'album';
  title: string;
  creator: string; // author, director, or artist
  rating?: number; // 1-5
  notes: string;
  completed: boolean;
}

export interface HealthEntry {
  id: string;
  date: string;
  steps: number;
  weight?: number;
  liftingSession: boolean;
  freeMealUsed: boolean;
  notes: string;
}

export interface WeeklyChecklistItem {
  id: string;
  weekNumber: number;
  label: string;
  completed: boolean;
}

// --- Aggregated State ---

export interface CreativeState {
  writingEntries: WritingEntry[];
  streakDays: number;
  lastWritingDate: string | null;
}

export interface TechState {
  logEntries: TechLogEntry[];
  deepSeatsProgress: number; // 0-100
  currentPhase: number; // 1-4
  sideAppName: string;
  sideAppDaysRemaining: number;
}

export interface MediaState {
  entries: MediaEntry[];
}

export interface HealthState {
  entries: HealthEntry[];
}

export interface AppData {
  creative: CreativeState;
  tech: TechState;
  media: MediaState;
  health: HealthState;
  weeklyChecklist: WeeklyChecklistItem[];
  coachMessages: CoachMessage[];
  checklistTemplates: string[];
}

// --- Coach ---

export interface CoachMessage {
  role: 'user' | 'coach';
  text: string;
  timestamp: string;
}

// --- Validation ---

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// --- Toast ---

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
  undoAction?: () => void;
}
