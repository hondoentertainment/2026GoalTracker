
import {
  AppData,
  WritingEntry,
  TechLogEntry,
  MediaEntry,
  HealthEntry,
  WeeklyChecklistItem,
  CoachMessage,
  ValidationResult,
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
  coachMessages: [],
  checklistTemplates: [],
};

// --- Core Read/Write ---

function cloneDefault(): AppData {
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefault();
    return { ...cloneDefault(), ...JSON.parse(raw) };
  } catch {
    return cloneDefault();
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

// --- Data Export ---

export function exportDataAsJSON(): string {
  return JSON.stringify(loadData(), null, 2);
}

export function exportDataAsCSV(): string {
  const data = loadData();
  const lines: string[] = [];

  // Writing entries
  lines.push('--- Writing Entries ---');
  lines.push('Date,Project,WordCount,SessionMinutes,Notes');
  data.creative.writingEntries.forEach(e => {
    lines.push(`${e.date},${e.project},${e.wordCount},${e.sessionMinutes},"${e.notes.replace(/"/g, '""')}"`);
  });

  // Tech log entries
  lines.push('');
  lines.push('--- Tech Log Entries ---');
  lines.push('Date,Project,Task,HoursSpent,Milestone,Completed');
  data.tech.logEntries.forEach(e => {
    lines.push(`${e.date},${e.project},"${e.task.replace(/"/g, '""')}",${e.hoursSpent},"${e.milestone.replace(/"/g, '""')}",${e.completed}`);
  });

  // Media entries
  lines.push('');
  lines.push('--- Media Entries ---');
  lines.push('Date,Type,Title,Creator,Rating,Notes,Completed');
  data.media.entries.forEach(e => {
    lines.push(`${e.date},${e.type},"${e.title.replace(/"/g, '""')}","${e.creator.replace(/"/g, '""')}",${e.rating ?? ''},\"${e.notes.replace(/"/g, '""')}",${e.completed}`);
  });

  // Health entries
  lines.push('');
  lines.push('--- Health Entries ---');
  lines.push('Date,Steps,Weight,LiftingSession,FreeMealUsed,Notes');
  data.health.entries.forEach(e => {
    lines.push(`${e.date},${e.steps},${e.weight ?? ''},${e.liftingSession},${e.freeMealUsed},"${e.notes.replace(/"/g, '""')}"`);
  });

  return lines.join('\n');
}

// --- Pace Projections ---

export function getMediaPaceProjection(type: 'book' | 'film' | 'album'): {
  current: number;
  target: number;
  weeklyRate: number;
  projectedTotal: number;
  onPace: boolean;
  weeksToTarget: number | null;
  projectedCompletionWeek: number | null;
} {
  const targets = { book: 104, film: 104, album: 100 };
  const entries = getMediaEntries().filter(e => e.completed && e.type === type);
  const current = entries.length;
  const target = targets[type];
  const week = getCurrentWeekNumber();

  const weeklyRate = week > 0 ? current / week : 0;
  const projectedTotal = Math.round(weeklyRate * 52);
  const onPace = projectedTotal >= target;
  const remaining = target - current;

  let weeksToTarget: number | null = null;
  let projectedCompletionWeek: number | null = null;
  if (weeklyRate > 0 && remaining > 0) {
    weeksToTarget = Math.ceil(remaining / weeklyRate);
    projectedCompletionWeek = week + weeksToTarget;
  } else if (remaining <= 0) {
    weeksToTarget = 0;
    projectedCompletionWeek = week;
  }

  return { current, target, weeklyRate, projectedTotal, onPace, weeksToTarget, projectedCompletionWeek };
}

// --- Weekly Word Count History (for chart) ---

export function getWeeklyWordCounts(): { week: number; words: number }[] {
  const week = getCurrentWeekNumber();
  const result: { week: number; words: number }[] = [];
  for (let w = 1; w <= week; w++) {
    result.push({ week: w, words: getWeekWordCount(w) });
  }
  return result;
}

// --- Monthly/Quarterly Rollup ---

export function getMonthlyRollup(): {
  month: number;
  monthName: string;
  writingSessions: number;
  totalWords: number;
  techHours: number;
  mediaCompleted: number;
  avgSteps: number;
  liftSessions: number;
}[] {
  const data = loadData();
  const months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const currentMonth = new Date().getMonth(); // 0-based

  for (let m = 0; m <= currentMonth; m++) {
    const year = new Date().getFullYear();
    const monthStr = String(m + 1).padStart(2, '0');
    const prefix = `${year}-${monthStr}`;

    const writingEntries = data.creative.writingEntries.filter(e => e.date.startsWith(prefix));
    const techEntries = data.tech.logEntries.filter(e => e.date.startsWith(prefix));
    const mediaEntries = data.media.entries.filter(e => e.completed && e.date.startsWith(prefix));
    const healthEntries = data.health.entries.filter(e => e.date.startsWith(prefix));

    const avgSteps = healthEntries.length > 0
      ? Math.round(healthEntries.reduce((s, e) => s + e.steps, 0) / healthEntries.length)
      : 0;

    months.push({
      month: m + 1,
      monthName: monthNames[m],
      writingSessions: writingEntries.length,
      totalWords: writingEntries.reduce((s, e) => s + e.wordCount, 0),
      techHours: Math.round(techEntries.reduce((s, e) => s + e.hoursSpent, 0) * 10) / 10,
      mediaCompleted: mediaEntries.length,
      avgSteps,
      liftSessions: healthEntries.filter(e => e.liftingSession).length,
    });
  }

  return months;
}

export function getQuarterlyRollup(): {
  quarter: number;
  totalWords: number;
  techHours: number;
  mediaCompleted: number;
  avgSteps: number;
}[] {
  const monthly = getMonthlyRollup();
  const quarters: { quarter: number; totalWords: number; techHours: number; mediaCompleted: number; avgSteps: number }[] = [];

  for (let q = 1; q <= 4; q++) {
    const qMonths = monthly.filter(m => Math.ceil(m.month / 3) === q);
    if (qMonths.length === 0) continue;
    quarters.push({
      quarter: q,
      totalWords: qMonths.reduce((s, m) => s + m.totalWords, 0),
      techHours: Math.round(qMonths.reduce((s, m) => s + m.techHours, 0) * 10) / 10,
      mediaCompleted: qMonths.reduce((s, m) => s + m.mediaCompleted, 0),
      avgSteps: Math.round(qMonths.reduce((s, m) => s + m.avgSteps, 0) / qMonths.length),
    });
  }

  return quarters;
}

// --- Custom Checklist ---

export function addCustomChecklistItem(weekNumber: number, label: string): void {
  const data = loadData();
  const newItem: WeeklyChecklistItem = {
    id: generateId(),
    weekNumber,
    label,
    completed: false,
  };
  data.weeklyChecklist.push(newItem);
  saveData(data);
}

export function deleteChecklistItem(id: string): void {
  const data = loadData();
  data.weeklyChecklist = data.weeklyChecklist.filter(c => c.id !== id);
  saveData(data);
}

export function updateChecklistItemLabel(id: string, label: string): void {
  const data = loadData();
  const item = data.weeklyChecklist.find(c => c.id === id);
  if (item) {
    item.label = label;
    saveData(data);
  }
}

// --- Data Import ---

export function importDataFromJSON(jsonString: string): { success: boolean; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.creative || !parsed.tech || !parsed.media || !parsed.health) {
      return { success: false, error: 'Invalid backup format: missing required data sections.' };
    }
    const data = { ...cloneDefault(), ...parsed };
    saveData(data);
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to parse JSON. Make sure the file is a valid backup.' };
  }
}

// --- Coach Message Persistence ---

export function getCoachMessages(): CoachMessage[] {
  return loadData().coachMessages;
}

export function saveCoachMessage(message: CoachMessage): void {
  const data = loadData();
  data.coachMessages.push(message);
  // Keep last 100 messages to avoid bloating localStorage
  if (data.coachMessages.length > 100) {
    data.coachMessages = data.coachMessages.slice(-100);
  }
  saveData(data);
}

export function clearCoachMessages(): void {
  const data = loadData();
  data.coachMessages = [];
  saveData(data);
}

// --- Checklist Templating ---

export function saveChecklistAsTemplate(weekNumber: number): void {
  const data = loadData();
  const items = data.weeklyChecklist.filter(c => c.weekNumber === weekNumber);
  data.checklistTemplates = items.map(i => i.label);
  saveData(data);
}

export function getChecklistTemplate(): string[] {
  return loadData().checklistTemplates;
}

export function applyChecklistTemplate(weekNumber: number): WeeklyChecklistItem[] {
  const data = loadData();
  const template = data.checklistTemplates;
  if (template.length === 0) return getWeeklyChecklist(weekNumber);

  // Remove existing items for this week
  data.weeklyChecklist = data.weeklyChecklist.filter(c => c.weekNumber !== weekNumber);

  const newItems: WeeklyChecklistItem[] = template.map(label => ({
    id: generateId(),
    weekNumber,
    label,
    completed: false,
  }));
  data.weeklyChecklist.push(...newItems);
  saveData(data);
  return newItems;
}

// --- Side App CRUD ---

export function updateSideApp(name: string, daysRemaining: number): void {
  const data = loadData();
  data.tech.sideAppName = name;
  data.tech.sideAppDaysRemaining = Math.max(0, daysRemaining);
  saveData(data);
}

// --- Date Validation ---

export function validateDate(dateStr: string): ValidationResult {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { valid: false, error: 'Date must be in YYYY-MM-DD format.' };
  }
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date.' };
  }
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) {
    return { valid: false, error: 'Cannot log entries for future dates.' };
  }
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  if (date < yearStart) {
    return { valid: false, error: 'Date must be in the current year.' };
  }
  return { valid: true };
}

export function validateWritingEntry(wordCount: number, sessionMinutes: number): ValidationResult {
  if (wordCount <= 0) return { valid: false, error: 'Word count must be greater than 0.' };
  if (wordCount > 50000) return { valid: false, error: 'Word count seems unrealistic (max 50,000).' };
  if (sessionMinutes <= 0) return { valid: false, error: 'Duration must be greater than 0.' };
  if (sessionMinutes > 1440) return { valid: false, error: 'Duration cannot exceed 24 hours.' };
  return { valid: true };
}

export function validateHealthEntry(steps: number, weight?: number): ValidationResult {
  if (isNaN(steps) || steps < 0) return { valid: false, error: 'Steps must be a non-negative number.' };
  if (steps > 100000) return { valid: false, error: 'Steps seem unrealistic (max 100,000).' };
  if (weight !== undefined) {
    if (weight <= 0) return { valid: false, error: 'Weight must be positive.' };
    if (weight > 1000) return { valid: false, error: 'Weight seems unrealistic.' };
  }
  return { valid: true };
}

export function validateTechEntry(task: string, hours: number): ValidationResult {
  if (!task.trim()) return { valid: false, error: 'Task description is required.' };
  if (hours <= 0) return { valid: false, error: 'Hours must be greater than 0.' };
  if (hours > 24) return { valid: false, error: 'Hours cannot exceed 24.' };
  return { valid: true };
}

// --- Streak Warning ---

export function getStreakWarning(): { atRisk: boolean; message: string; daysWithout: number } {
  const data = loadData();
  const lastDate = data.creative.lastWritingDate;
  const streak = data.creative.streakDays;

  if (!lastDate || streak === 0) {
    return { atRisk: false, message: '', daysWithout: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(lastDate + 'T00:00:00');
  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { atRisk: false, message: '', daysWithout: 0 };
  }
  if (diffDays === 1) {
    return { atRisk: true, message: `Write today to keep your ${streak}-day streak alive!`, daysWithout: 1 };
  }
  if (diffDays === 2) {
    return { atRisk: true, message: `Last chance! Write now or lose your ${streak}-day streak.`, daysWithout: 2 };
  }
  return { atRisk: false, message: `Streak ended at ${streak} days. Start a new one today!`, daysWithout: diffDays };
}

// --- Cumulative Data ---

export function getCumulativeWords(): { week: number; cumulative: number }[] {
  const week = getCurrentWeekNumber();
  let total = 0;
  const result: { week: number; cumulative: number }[] = [];
  for (let w = 1; w <= week; w++) {
    total += getWeekWordCount(w);
    result.push({ week: w, cumulative: total });
  }
  return result;
}

export function getCumulativeMedia(): { week: number; books: number; films: number; albums: number }[] {
  const data = loadData();
  const week = getCurrentWeekNumber();
  const year = new Date().getFullYear();
  let books = 0, films = 0, albums = 0;
  const result: { week: number; books: number; films: number; albums: number }[] = [];

  for (let w = 1; w <= week; w++) {
    const weekDatesSet = new Set(getWeekDates(year, w));
    const weekMedia = data.media.entries.filter(e => e.completed && weekDatesSet.has(e.date));
    books += weekMedia.filter(e => e.type === 'book').length;
    films += weekMedia.filter(e => e.type === 'film').length;
    albums += weekMedia.filter(e => e.type === 'album').length;
    result.push({ week: w, books, films, albums });
  }
  return result;
}

// --- Weekly Digest ---

export function getWeeklyDigest(weekNumber: number): string {
  const year = new Date().getFullYear();
  const weekDatesSet = new Set(getWeekDates(year, weekNumber));
  const data = loadData();

  const writingEntries = data.creative.writingEntries.filter(e => weekDatesSet.has(e.date));
  const totalWords = writingEntries.reduce((s, e) => s + e.wordCount, 0);
  const writingDays = new Set(writingEntries.map(e => e.date)).size;

  const techEntries = data.tech.logEntries.filter(e => weekDatesSet.has(e.date));
  const techHours = techEntries.reduce((s, e) => s + e.hoursSpent, 0);
  const techCompleted = techEntries.filter(e => e.completed).length;

  const mediaEntries = data.media.entries.filter(e => e.completed && weekDatesSet.has(e.date));
  const mediaBooks = mediaEntries.filter(e => e.type === 'book').length;
  const mediaFilms = mediaEntries.filter(e => e.type === 'film').length;
  const mediaAlbums = mediaEntries.filter(e => e.type === 'album').length;

  const healthEntries = data.health.entries.filter(e => weekDatesSet.has(e.date));
  const avgSteps = healthEntries.length > 0
    ? Math.round(healthEntries.reduce((s, e) => s + e.steps, 0) / healthEntries.length)
    : 0;
  const liftSessions = healthEntries.filter(e => e.liftingSession).length;

  const checklist = data.weeklyChecklist.filter(c => c.weekNumber === weekNumber);
  const checklistDone = checklist.filter(c => c.completed).length;

  const lines = [
    `Week ${weekNumber} Summary`,
    `========================`,
    ``,
    `Writing: ${writingDays}/7 days, ${totalWords.toLocaleString()} words`,
    `Tech: ${techHours.toFixed(1)} hours, ${techCompleted} tasks completed`,
    `Media: ${mediaBooks} books, ${mediaFilms} films, ${mediaAlbums} albums`,
    `Health: ${avgSteps.toLocaleString()} avg steps, ${liftSessions}/3 lifts`,
    `Checklist: ${checklistDone}/${checklist.length} completed`,
    ``,
    `Streak: ${data.creative.streakDays} days`,
    `Deep Seats: ${data.tech.deepSeatsProgress}%`,
  ];

  return lines.join('\n');
}

// --- Today's Status ---

export function getTodayStatus(): {
  wroteToday: boolean;
  loggedHealth: boolean;
  loggedTech: boolean;
  loggedMedia: boolean;
  todayWords: number;
  todaySteps: number;
} {
  const today = getTodayString();
  const data = loadData();

  const todayWriting = data.creative.writingEntries.filter(e => e.date === today);
  const todayHealth = data.health.entries.filter(e => e.date === today);
  const todayTech = data.tech.logEntries.filter(e => e.date === today);
  const todayMedia = data.media.entries.filter(e => e.date === today);

  return {
    wroteToday: todayWriting.length > 0,
    loggedHealth: todayHealth.length > 0,
    loggedTech: todayTech.length > 0,
    loggedMedia: todayMedia.length > 0,
    todayWords: todayWriting.reduce((s, e) => s + e.wordCount, 0),
    todaySteps: todayHealth.length > 0 ? todayHealth[0].steps : 0,
  };
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
