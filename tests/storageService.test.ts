import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadData,
  saveData,
  addWritingEntry,
  getWritingEntries,
  deleteWritingEntry,
  addTechLogEntry,
  getTechLogEntries,
  deleteTechLogEntry,
  updateDeepSeatsProgress,
  updateCurrentPhase,
  addMediaEntry,
  getMediaEntries,
  updateMediaEntry,
  deleteMediaEntry,
  addHealthEntry,
  getHealthEntries,
  deleteHealthEntry,
  getWeeklyChecklist,
  toggleChecklistItem,
  addCustomChecklistItem,
  deleteChecklistItem,
  updateChecklistItemLabel,
  getCurrentWeekNumber,
  getWeekDates,
  getTodayString,
  getCurrentQuarter,
  getTotalMediaCount,
  getWeekWritingDays,
  getWeekWordCount,
  exportDataAsJSON,
  exportDataAsCSV,
  getMediaPaceProjection,
  getMonthlyRollup,
  getQuarterlyRollup,
  getWeeklyWordCounts,
} from '../services/storageService';

function clearStorage() {
  localStorage.clear();
  // Also directly remove the key in case clear() has issues
  localStorage.removeItem('2026-blueprint-data');
}

describe('Core Read/Write', () => {
  beforeEach(clearStorage);

  it('loadData returns default data when nothing stored', () => {
    const data = loadData();
    expect(data.creative.writingEntries).toEqual([]);
    expect(data.creative.streakDays).toBe(0);
    expect(data.tech.deepSeatsProgress).toBe(0);
    expect(data.media.entries).toEqual([]);
    expect(data.health.entries).toEqual([]);
  });

  it('saveData and loadData round-trip', () => {
    const data = loadData();
    data.tech.deepSeatsProgress = 42;
    saveData(data);
    const loaded = loadData();
    expect(loaded.tech.deepSeatsProgress).toBe(42);
  });
});

describe('Writing Entries', () => {
  beforeEach(clearStorage);

  it('adds and retrieves writing entries', () => {
    addWritingEntry({
      date: '2026-01-15',
      project: 'xavier-transport',
      wordCount: 500,
      sessionMinutes: 45,
      notes: 'Good session',
    });

    const entries = getWritingEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].wordCount).toBe(500);
    expect(entries[0].project).toBe('xavier-transport');
    expect(entries[0].id).toBeTruthy();
  });

  it('deletes writing entries', () => {
    const entry = addWritingEntry({
      date: '2026-01-15',
      project: 'xavier-transport',
      wordCount: 300,
      sessionMinutes: 30,
      notes: '',
    });
    expect(getWritingEntries()).toHaveLength(1);

    deleteWritingEntry(entry.id);
    expect(getWritingEntries()).toHaveLength(0);
  });

  it('calculates streak for consecutive days', () => {
    addWritingEntry({ date: '2026-01-13', project: 'xavier-transport', wordCount: 100, sessionMinutes: 15, notes: '' });
    addWritingEntry({ date: '2026-01-14', project: 'xavier-transport', wordCount: 100, sessionMinutes: 15, notes: '' });
    addWritingEntry({ date: '2026-01-15', project: 'xavier-transport', wordCount: 100, sessionMinutes: 15, notes: '' });

    const data = loadData();
    expect(data.creative.streakDays).toBe(3);
  });

  it('allows one-day gaps in streak (never miss twice)', () => {
    addWritingEntry({ date: '2026-01-13', project: 'xavier-transport', wordCount: 100, sessionMinutes: 15, notes: '' });
    // skip Jan 14
    addWritingEntry({ date: '2026-01-15', project: 'xavier-transport', wordCount: 100, sessionMinutes: 15, notes: '' });

    const data = loadData();
    expect(data.creative.streakDays).toBe(2);
  });

  it('breaks streak on 2+ day gap', () => {
    addWritingEntry({ date: '2026-01-10', project: 'xavier-transport', wordCount: 100, sessionMinutes: 15, notes: '' });
    // skip Jan 11, 12
    addWritingEntry({ date: '2026-01-13', project: 'xavier-transport', wordCount: 100, sessionMinutes: 15, notes: '' });

    const data = loadData();
    expect(data.creative.streakDays).toBe(1);
  });
});

describe('Tech Log Entries', () => {
  beforeEach(clearStorage);

  it('CRUD operations', () => {
    const entry = addTechLogEntry({
      date: '2026-02-01',
      project: 'deep-seats',
      task: 'Build API',
      hoursSpent: 3,
      milestone: 'MVP',
      completed: false,
    });
    expect(getTechLogEntries()).toHaveLength(1);

    deleteTechLogEntry(entry.id);
    expect(getTechLogEntries()).toHaveLength(0);
  });

  it('updates Deep Seats progress', () => {
    updateDeepSeatsProgress(75);
    expect(loadData().tech.deepSeatsProgress).toBe(75);
  });

  it('clamps progress to 0-100', () => {
    updateDeepSeatsProgress(150);
    expect(loadData().tech.deepSeatsProgress).toBe(100);
    updateDeepSeatsProgress(-10);
    expect(loadData().tech.deepSeatsProgress).toBe(0);
  });

  it('updates phase', () => {
    updateCurrentPhase(3);
    expect(loadData().tech.currentPhase).toBe(3);
  });

  it('clamps phase to 1-4', () => {
    updateCurrentPhase(5);
    expect(loadData().tech.currentPhase).toBe(4);
    updateCurrentPhase(0);
    expect(loadData().tech.currentPhase).toBe(1);
  });
});

describe('Media Entries', () => {
  beforeEach(clearStorage);

  it('CRUD operations', () => {
    const entry = addMediaEntry({
      date: '2026-01-20',
      type: 'book',
      title: 'Test Book',
      creator: 'Author',
      rating: 5,
      notes: '',
      completed: true,
    });
    expect(getMediaEntries()).toHaveLength(1);

    updateMediaEntry(entry.id, { rating: 4 });
    expect(getMediaEntries()[0].rating).toBe(4);

    deleteMediaEntry(entry.id);
    expect(getMediaEntries()).toHaveLength(0);
  });

  it('counts completed media by type', () => {
    addMediaEntry({ date: '2026-01-01', type: 'book', title: 'B1', creator: '', notes: '', completed: true });
    addMediaEntry({ date: '2026-01-02', type: 'book', title: 'B2', creator: '', notes: '', completed: false });
    addMediaEntry({ date: '2026-01-01', type: 'film', title: 'F1', creator: '', notes: '', completed: true });

    const counts = getTotalMediaCount();
    expect(counts.books).toBe(1);
    expect(counts.films).toBe(1);
    expect(counts.albums).toBe(0);
  });
});

describe('Health Entries', () => {
  beforeEach(clearStorage);

  it('CRUD operations', () => {
    const entry = addHealthEntry({
      date: '2026-03-01',
      steps: 10000,
      weight: 180,
      liftingSession: true,
      freeMealUsed: false,
      notes: 'Good day',
    });
    expect(getHealthEntries()).toHaveLength(1);
    expect(getHealthEntries()[0].steps).toBe(10000);

    deleteHealthEntry(entry.id);
    expect(getHealthEntries()).toHaveLength(0);
  });
});

describe('Weekly Checklist', () => {
  beforeEach(clearStorage);

  it('creates default checklist items', () => {
    const items = getWeeklyChecklist(1);
    expect(items.length).toBe(8);
    expect(items[0].completed).toBe(false);
  });

  it('toggles checklist items', () => {
    const items = getWeeklyChecklist(1);
    toggleChecklistItem(items[0].id);
    const updated = getWeeklyChecklist(1);
    expect(updated[0].completed).toBe(true);
  });

  it('adds custom checklist items', () => {
    getWeeklyChecklist(1); // creates defaults
    addCustomChecklistItem(1, 'Custom task');
    const items = getWeeklyChecklist(1);
    expect(items.length).toBe(9);
    expect(items[8].label).toBe('Custom task');
  });

  it('deletes checklist items', () => {
    const items = getWeeklyChecklist(1);
    deleteChecklistItem(items[0].id);
    const updated = getWeeklyChecklist(1);
    expect(updated.length).toBe(7);
  });

  it('updates checklist item labels', () => {
    const items = getWeeklyChecklist(1);
    updateChecklistItemLabel(items[0].id, 'Updated label');
    const updated = getWeeklyChecklist(1);
    expect(updated[0].label).toBe('Updated label');
  });
});

describe('Date Utilities', () => {
  it('getCurrentWeekNumber returns a positive number', () => {
    const week = getCurrentWeekNumber();
    expect(week).toBeGreaterThan(0);
    expect(week).toBeLessThanOrEqual(53);
  });

  it('getWeekDates returns 7 dates', () => {
    const dates = getWeekDates(2026, 1);
    expect(dates).toHaveLength(7);
    dates.forEach(d => expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/));
  });

  it('getTodayString returns YYYY-MM-DD format', () => {
    expect(getTodayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('getCurrentQuarter returns 1-4', () => {
    const q = getCurrentQuarter();
    expect(q).toBeGreaterThanOrEqual(1);
    expect(q).toBeLessThanOrEqual(4);
  });
});

describe('Data Export', () => {
  beforeEach(clearStorage);

  it('exportDataAsJSON returns valid JSON', () => {
    addWritingEntry({ date: '2026-01-15', project: 'xavier-transport', wordCount: 200, sessionMinutes: 20, notes: 'test' });
    const json = exportDataAsJSON();
    const parsed = JSON.parse(json);
    expect(parsed.creative.writingEntries).toHaveLength(1);
  });

  it('exportDataAsCSV returns string with headers', () => {
    addWritingEntry({ date: '2026-01-15', project: 'xavier-transport', wordCount: 200, sessionMinutes: 20, notes: 'test' });
    const csv = exportDataAsCSV();
    expect(csv).toContain('--- Writing Entries ---');
    expect(csv).toContain('Date,Project,WordCount');
    expect(csv).toContain('xavier-transport');
  });
});

describe('Pace Projections', () => {
  beforeEach(clearStorage);

  it('returns zero rate with no entries', () => {
    const proj = getMediaPaceProjection('book');
    expect(proj.current).toBe(0);
    expect(proj.weeklyRate).toBe(0);
    expect(proj.projectedTotal).toBe(0);
  });
});

describe('Rollup Functions', () => {
  beforeEach(clearStorage);

  it('getMonthlyRollup returns array for current months', () => {
    const rollup = getMonthlyRollup();
    expect(rollup.length).toBeGreaterThan(0);
    expect(rollup[0]).toHaveProperty('monthName');
    expect(rollup[0]).toHaveProperty('totalWords');
  });

  it('getQuarterlyRollup returns array', () => {
    const rollup = getQuarterlyRollup();
    expect(rollup.length).toBeGreaterThan(0);
    expect(rollup[0]).toHaveProperty('quarter');
  });

  it('getWeeklyWordCounts returns array', () => {
    const counts = getWeeklyWordCounts();
    expect(counts.length).toBeGreaterThan(0);
    expect(counts[0]).toHaveProperty('week');
    expect(counts[0]).toHaveProperty('words');
  });
});
