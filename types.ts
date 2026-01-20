
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
