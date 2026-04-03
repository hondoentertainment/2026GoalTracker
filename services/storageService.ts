
import {
  AppData,
  WritingEntry,
  TechLogEntry,
  MediaEntry,
  HealthEntry,
  WeeklyChecklistItem,
} from '../types';

const STORAGE_KEY = '2026-blueprint-data';

const DEFAULT_DATA: AppData = {
  creative: {
    writingEntries: [],
    streakDays: 0,
    lastWritingDate: null,
  },
  tech: {
    logEntries: [],
    deepSeatsProgress: 0,
    currentPhase: 2,
    sideAppName: 'Writing Streak Visualizer',
    sideAppDaysRemaining: 30,
  },
  media: {
    entries: [],
  },
  health: {
    entries: [],
  },
  weeklyChecklist: [],
};

// --- Core Read/Write ---

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_DATA;
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// --- Writing Entries ---

export function addWritingEntry(entry: Omit<WritingEntry, 'id'>): WritingEntry {
  const data = loadData();
  const newEntry: WritingEntry = { ...entry, id: generateId() };
  data.creative.writingEntries.push(newEntry);
  updateWritingStreak(data);
  saveData(data);
  return newEntry;
}

export function getWritingEntries(): WritingEntry[] {
  return loadData().creative.writingEntries;
}

export function deleteWritingEntry(id: string): void {
  const data = loadData();
  data.creative.writingEntries = data.creative.writingEntries.filter(e => e.id !== id);
  updateWritingStreak(data);
  saveData(data);
}

function updateWritingStreak(data: AppData): void {
  const entries = data.creative.writingEntries;
  if (entries.length === 0) {
    data.creative.streakDays = 0;
    data.creative.lastWritingDate = null;
    return;
  }

  const uniqueDates = [...new Set(entries.map(e => e.date))].sort().reverse();
  data.creative.lastWritingDate = uniqueDates[0];

  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = new Date(uniqueDates[i]);
    const prev = new Date(uniqueDates[i + 1]);
    const diffDays = (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
    } else if (diffDays === 2) {
      // "Never miss twice" — allow one gap day
      streak++;
    } else {
      break;
    }
  }
  data.creative.streakDays = streak;
}

// --- Tech Log Entries ---

export function addTechLogEntry(entry: Omit<TechLogEntry, 'id'>): TechLogEntry {
  const data = loadData();
  const newEntry: TechLogEntry = { ...entry, id: generateId() };
  data.tech.logEntries.push(newEntry);
  saveData(data);
  return newEntry;
}

export function getTechLogEntries(): TechLogEntry[] {
  return loadData().tech.logEntries;
}

export function deleteTechLogEntry(id: string): void {
  const data = loadData();
  data.tech.logEntries = data.tech.logEntries.filter(e => e.id !== id);
  saveData(data);
}

export function updateDeepSeatsProgress(progress: number): void {
  const data = loadData();
  data.tech.deepSeatsProgress = Math.min(100, Math.max(0, progress));
  saveData(data);
}

export function updateCurrentPhase(phase: number): void {
  const data = loadData();
  data.tech.currentPhase = Math.min(4, Math.max(1, phase));
  saveData(data);
}

// --- Media Entries ---

export function addMediaEntry(entry: Omit<MediaEntry, 'id'>): MediaEntry {
  const data = loadData();
  const newEntry: MediaEntry = { ...entry, id: generateId() };
  data.media.entries.push(newEntry);
  saveData(data);
  return newEntry;
}

export function getMediaEntries(): MediaEntry[] {
  return loadData().media.entries;
}

export function updateMediaEntry(id: string, updates: Partial<MediaEntry>): void {
  const data = loadData();
  const idx = data.media.entries.findIndex(e => e.id === id);
  if (idx !== -1) {
    data.media.entries[idx] = { ...data.media.entries[idx], ...updates };
    saveData(data);
  }
}

export function deleteMediaEntry(id: string): void {
  const data = loadData();
  data.media.entries = data.media.entries.filter(e => e.id !== id);
  saveData(data);
}

// --- Health Entries ---

export function addHealthEntry(entry: Omit<HealthEntry, 'id'>): HealthEntry {
  const data = loadData();
  const newEntry: HealthEntry = { ...entry, id: generateId() };
  data.health.entries.push(newEntry);
  saveData(data);
  return newEntry;
}

export function getHealthEntries(): HealthEntry[] {
  return loadData().health.entries;
}

export function deleteHealthEntry(id: string): void {
  const data = loadData();
  data.health.entries = data.health.entries.filter(e => e.id !== id);
  saveData(data);
}

// --- Weekly Checklist ---

export function getWeeklyChecklist(weekNumber: number): WeeklyChecklistItem[] {
  const data = loadData();
  const existing = data.weeklyChecklist.filter(c => c.weekNumber === weekNumber);
  if (existing.length > 0) return existing;

  // Create default checklist for the week
  const defaultItems = [
    'Finish 2 books (1 fiction / 1 non-fiction)',
    '2 Ebert Films + short reflections',
    '2 Rolling Stone Albums logged',
    '1 recipe documented for Schafer Cookbook',
    'Daily weigh-in + 8k steps average',
    'Lift 3x sessions complete',
    'Ship Deep Seats milestone',
    'Xavier Transport: 2,500 words added',
  ];

  const newItems: WeeklyChecklistItem[] = defaultItems.map(label => ({
    id: generateId(),
    weekNumber,
    label,
    completed: false,
  }));

  data.weeklyChecklist.push(...newItems);
  saveData(data);
  return newItems;
}

export function toggleChecklistItem(id: string): void {
  const data = loadData();
  const item = data.weeklyChecklist.find(c => c.id === id);
  if (item) {
    item.completed = !item.completed;
    saveData(data);
  }
}

// --- Aggregation Helpers ---

export function getWeekWritingDays(weekNumber: number): number {
  const entries = getWritingEntries();
  const year = new Date().getFullYear();
  const weekDates = getWeekDates(year, weekNumber);
  const entryDates = new Set(entries.map(e => e.date));
  return weekDates.filter(d => entryDates.has(d)).length;
}

export function getWeekWordCount(weekNumber: number): number {
  const entries = getWritingEntries();
  const year = new Date().getFullYear();
  const weekDatesSet = new Set(getWeekDates(year, weekNumber));
  return entries
    .filter(e => weekDatesSet.has(e.date))
    .reduce((sum, e) => sum + e.wordCount, 0);
}

export function getTotalMediaCount(): { books: number; films: number; albums: number } {
  const entries = getMediaEntries().filter(e => e.completed);
  return {
    books: entries.filter(e => e.type === 'book').length,
    films: entries.filter(e => e.type === 'film').length,
    albums: entries.filter(e => e.type === 'album').length,
  };
}

export function getWeekHealthAvg(weekNumber: number): { avgSteps: number; liftSessions: number; avgWeight: number | null } {
  const entries = getHealthEntries();
  const year = new Date().getFullYear();
  const weekDatesSet = new Set(getWeekDates(year, weekNumber));
  const weekEntries = entries.filter(e => weekDatesSet.has(e.date));

  if (weekEntries.length === 0) return { avgSteps: 0, liftSessions: 0, avgWeight: null };

  const avgSteps = Math.round(weekEntries.reduce((s, e) => s + e.steps, 0) / weekEntries.length);
  const liftSessions = weekEntries.filter(e => e.liftingSession).length;
  const weights = weekEntries.filter(e => e.weight != null).map(e => e.weight!);
  const avgWeight = weights.length > 0 ? Math.round((weights.reduce((s, w) => s + w, 0) / weights.length) * 10) / 10 : null;

  return { avgSteps, liftSessions, avgWeight };
}

// --- Date Utilities ---

export function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.ceil((diff / oneWeek));
}

export function getWeekDates(year: number, weekNumber: number): string[] {
  const jan1 = new Date(year, 0, 1);
  const dayOfWeek = jan1.getDay();
  const startOffset = (weekNumber - 1) * 7 - dayOfWeek + 1; // Monday-based
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(year, 0, startOffset + i + 1);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentQuarter(): number {
  return Math.ceil((new Date().getMonth() + 1) / 3);
}

// --- Summary for AI Coach ---

export function getDataSummaryForCoach(): string {
  const data = loadData();
  const week = getCurrentWeekNumber();
  const media = getTotalMediaCount();
  const health = getWeekHealthAvg(week);
  const totalWords = data.creative.writingEntries.reduce((s, e) => s + e.wordCount, 0);
  const weekWords = getWeekWordCount(week);
  const writingDays = getWeekWritingDays(week);

  return `
Current Status (Week ${week} of 52):
- Writing streak: ${data.creative.streakDays} days
- This week: ${writingDays}/7 writing days, ${weekWords} words
- Total words written: ${totalWords}
- Deep Seats v1: ${data.tech.deepSeatsProgress}% (Phase ${data.tech.currentPhase}/4)
- Tech log entries this week: ${data.tech.logEntries.filter(e => new Set(getWeekDates(new Date().getFullYear(), week)).has(e.date)).length}
- Books completed: ${media.books}/104
- Films watched: ${media.films}/104
- Albums listened: ${media.albums}/100
- Health this week: Avg ${health.avgSteps} steps, ${health.liftSessions}/3 lift sessions${health.avgWeight ? `, Avg weight: ${health.avgWeight}lb` : ''}
`;
}
