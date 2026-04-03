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
  importDataFromJSON,
  getCoachMessages,
  saveCoachMessage,
  clearCoachMessages,
  saveChecklistAsTemplate,
  getChecklistTemplate,
  applyChecklistTemplate,
  updateSideApp,
  validateDate,
  validateWritingEntry,
  validateHealthEntry,
  validateTechEntry,
  getStreakWarning,
  getCumulativeWords,
  getCumulativeMedia,
  getWeeklyDigest,
  getTodayStatus,
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

describe('importDataFromJSON', () => {
  beforeEach(() => { localStorage.clear(); });

  it('imports valid JSON data', () => {
    const backup = JSON.stringify({
      creative: { writingEntries: [], streakDays: 5, lastWritingDate: '2026-01-10' },
      tech: { logEntries: [], deepSeatsProgress: 50, currentPhase: 3, sideAppName: 'Test', sideAppDaysRemaining: 10 },
      media: { entries: [] },
      health: { entries: [] },
      weeklyChecklist: [],
      coachMessages: [],
      checklistTemplates: [],
    });
    const result = importDataFromJSON(backup);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    const data = loadData();
    expect(data.creative.streakDays).toBe(5);
    expect(data.tech.deepSeatsProgress).toBe(50);
  });

  it('rejects invalid JSON', () => {
    const result = importDataFromJSON('not valid json {{{');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to parse JSON');
  });

  it('rejects JSON missing required sections', () => {
    const result = importDataFromJSON(JSON.stringify({ creative: {}, tech: {} }));
    expect(result.success).toBe(false);
    expect(result.error).toContain('missing required data sections');
  });
});

describe('Coach Messages', () => {
  beforeEach(() => { localStorage.clear(); });

  it('saves and retrieves coach messages', () => {
    saveCoachMessage({ role: 'user', text: 'Hello', timestamp: '2026-01-01T10:00:00Z' });
    saveCoachMessage({ role: 'coach', text: 'Hi there!', timestamp: '2026-01-01T10:00:01Z' });
    const messages = getCoachMessages();
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('user');
    expect(messages[1].role).toBe('coach');
  });

  it('clears coach messages', () => {
    saveCoachMessage({ role: 'user', text: 'Hello', timestamp: '2026-01-01T10:00:00Z' });
    clearCoachMessages();
    expect(getCoachMessages()).toHaveLength(0);
  });

  it('caps messages at 100', () => {
    for (let i = 0; i < 105; i++) {
      saveCoachMessage({ role: 'user', text: `Message ${i}`, timestamp: `2026-01-01T10:${String(i).padStart(2, '0')}:00Z` });
    }
    const messages = getCoachMessages();
    expect(messages).toHaveLength(100);
    // Should keep the last 100 (messages 5-104)
    expect(messages[0].text).toBe('Message 5');
    expect(messages[99].text).toBe('Message 104');
  });
});

describe('Checklist Templating', () => {
  beforeEach(() => { localStorage.clear(); });

  it('saves a checklist as template and retrieves it', () => {
    getWeeklyChecklist(1); // creates defaults
    addCustomChecklistItem(1, 'My custom item');
    saveChecklistAsTemplate(1);
    const template = getChecklistTemplate();
    expect(template).toHaveLength(9); // 8 defaults + 1 custom
    expect(template).toContain('My custom item');
  });

  it('applies a template to a new week', () => {
    // Create a custom template from week 1
    getWeeklyChecklist(1);
    addCustomChecklistItem(1, 'Special task');
    saveChecklistAsTemplate(1);

    // Apply template to week 2
    const items = applyChecklistTemplate(2);
    expect(items).toHaveLength(9);
    expect(items.every(i => i.weekNumber === 2)).toBe(true);
    expect(items.every(i => i.completed === false)).toBe(true);
    expect(items.some(i => i.label === 'Special task')).toBe(true);
  });

  it('falls back to defaults when no template exists', () => {
    const items = applyChecklistTemplate(3);
    expect(items).toHaveLength(8); // default items
  });
});

describe('Side App', () => {
  beforeEach(() => { localStorage.clear(); });

  it('updates side app name and days remaining', () => {
    updateSideApp('New App', 15);
    const data = loadData();
    expect(data.tech.sideAppName).toBe('New App');
    expect(data.tech.sideAppDaysRemaining).toBe(15);
  });

  it('clamps days remaining to minimum 0', () => {
    updateSideApp('Test', -5);
    const data = loadData();
    expect(data.tech.sideAppDaysRemaining).toBe(0);
  });
});

describe('Date Validation', () => {
  beforeEach(() => { localStorage.clear(); });

  it('accepts a valid date in the current year', () => {
    const today = getTodayString();
    const result = validateDate(today);
    expect(result.valid).toBe(true);
  });

  it('rejects future dates', () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const result = validateDate(future.toISOString().split('T')[0]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('future');
  });

  it('rejects dates from the wrong year', () => {
    const result = validateDate('2025-06-15');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('current year');
  });

  it('rejects bad format', () => {
    const result = validateDate('01-15-2026');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('YYYY-MM-DD');
  });

  it('rejects empty string', () => {
    const result = validateDate('');
    expect(result.valid).toBe(false);
  });
});

describe('Entry Validation - Writing', () => {
  beforeEach(() => { localStorage.clear(); });

  it('accepts valid writing entry', () => {
    expect(validateWritingEntry(500, 60).valid).toBe(true);
  });

  it('rejects zero word count', () => {
    const result = validateWritingEntry(0, 60);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Word count');
  });

  it('rejects negative word count', () => {
    expect(validateWritingEntry(-10, 60).valid).toBe(false);
  });

  it('rejects word count over 50000', () => {
    expect(validateWritingEntry(50001, 60).valid).toBe(false);
  });

  it('accepts word count at max boundary', () => {
    expect(validateWritingEntry(50000, 60).valid).toBe(true);
  });

  it('rejects zero session minutes', () => {
    expect(validateWritingEntry(100, 0).valid).toBe(false);
  });

  it('rejects session minutes over 1440', () => {
    expect(validateWritingEntry(100, 1441).valid).toBe(false);
  });
});

describe('Entry Validation - Health', () => {
  beforeEach(() => { localStorage.clear(); });

  it('accepts valid health entry', () => {
    expect(validateHealthEntry(8000, 175).valid).toBe(true);
  });

  it('accepts zero steps', () => {
    expect(validateHealthEntry(0).valid).toBe(true);
  });

  it('rejects negative steps', () => {
    expect(validateHealthEntry(-1).valid).toBe(false);
  });

  it('rejects steps over 100000', () => {
    expect(validateHealthEntry(100001).valid).toBe(false);
  });

  it('accepts steps at max boundary', () => {
    expect(validateHealthEntry(100000).valid).toBe(true);
  });

  it('rejects zero weight', () => {
    expect(validateHealthEntry(5000, 0).valid).toBe(false);
  });

  it('rejects weight over 1000', () => {
    expect(validateHealthEntry(5000, 1001).valid).toBe(false);
  });

  it('accepts weight at max boundary', () => {
    expect(validateHealthEntry(5000, 1000).valid).toBe(true);
  });

  it('accepts entry without weight', () => {
    expect(validateHealthEntry(5000).valid).toBe(true);
  });
});

describe('Entry Validation - Tech', () => {
  beforeEach(() => { localStorage.clear(); });

  it('accepts valid tech entry', () => {
    expect(validateTechEntry('Build API', 3).valid).toBe(true);
  });

  it('rejects empty task', () => {
    expect(validateTechEntry('', 3).valid).toBe(false);
  });

  it('rejects whitespace-only task', () => {
    expect(validateTechEntry('   ', 3).valid).toBe(false);
  });

  it('rejects zero hours', () => {
    expect(validateTechEntry('Task', 0).valid).toBe(false);
  });

  it('rejects hours over 24', () => {
    expect(validateTechEntry('Task', 25).valid).toBe(false);
  });

  it('accepts fractional hours', () => {
    expect(validateTechEntry('Task', 0.5).valid).toBe(true);
  });

  it('accepts 24 hours exactly', () => {
    expect(validateTechEntry('Task', 24).valid).toBe(true);
  });
});

describe('Streak Warning', () => {
  beforeEach(() => { localStorage.clear(); });

  it('returns no warning with no data', () => {
    const warning = getStreakWarning();
    expect(warning.atRisk).toBe(false);
    expect(warning.message).toBe('');
    expect(warning.daysWithout).toBe(0);
  });

  it('returns no warning when wrote today', () => {
    addWritingEntry({ date: getTodayString(), project: 'xavier-transport', wordCount: 100, sessionMinutes: 15, notes: '' });
    const warning = getStreakWarning();
    expect(warning.atRisk).toBe(false);
    expect(warning.daysWithout).toBe(0);
  });

  it('returns at risk when last wrote 1 day ago', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    addWritingEntry({ date: dateStr, project: 'xavier-transport', wordCount: 100, sessionMinutes: 15, notes: '' });
    const warning = getStreakWarning();
    expect(warning.atRisk).toBe(true);
    expect(warning.daysWithout).toBe(1);
    expect(warning.message).toContain('streak alive');
  });

  it('returns last chance when last wrote 2 days ago', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const dateStr = twoDaysAgo.toISOString().split('T')[0];
    addWritingEntry({ date: dateStr, project: 'xavier-transport', wordCount: 100, sessionMinutes: 15, notes: '' });
    const warning = getStreakWarning();
    expect(warning.atRisk).toBe(true);
    expect(warning.daysWithout).toBe(2);
    expect(warning.message).toContain('Last chance');
  });

  it('returns streak broken when 3+ days ago', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const dateStr = threeDaysAgo.toISOString().split('T')[0];
    addWritingEntry({ date: dateStr, project: 'xavier-transport', wordCount: 100, sessionMinutes: 15, notes: '' });
    const warning = getStreakWarning();
    expect(warning.atRisk).toBe(false);
    expect(warning.daysWithout).toBe(3);
    expect(warning.message).toContain('Streak ended');
  });
});

describe('Cumulative Data', () => {
  beforeEach(() => { localStorage.clear(); });

  it('getCumulativeWords returns cumulative totals', () => {
    const result = getCumulativeWords();
    expect(result.length).toBeGreaterThan(0);
    // Cumulative should be non-decreasing
    for (let i = 1; i < result.length; i++) {
      expect(result[i].cumulative).toBeGreaterThanOrEqual(result[i - 1].cumulative);
    }
  });

  it('getCumulativeMedia returns cumulative counts by type', () => {
    const result = getCumulativeMedia();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('books');
    expect(result[0]).toHaveProperty('films');
    expect(result[0]).toHaveProperty('albums');
    // Cumulative should be non-decreasing
    for (let i = 1; i < result.length; i++) {
      expect(result[i].books).toBeGreaterThanOrEqual(result[i - 1].books);
      expect(result[i].films).toBeGreaterThanOrEqual(result[i - 1].films);
      expect(result[i].albums).toBeGreaterThanOrEqual(result[i - 1].albums);
    }
  });
});

describe('Weekly Digest', () => {
  beforeEach(() => { localStorage.clear(); });

  it('returns a string with expected sections', () => {
    const digest = getWeeklyDigest(1);
    expect(digest).toContain('Week 1 Summary');
    expect(digest).toContain('Writing:');
    expect(digest).toContain('Tech:');
    expect(digest).toContain('Media:');
    expect(digest).toContain('Health:');
    expect(digest).toContain('Checklist:');
    expect(digest).toContain('Streak:');
    expect(digest).toContain('Deep Seats:');
  });

  it('includes data from entries in the given week', () => {
    // Add a writing entry for a date in week 1
    const weekDates = getWeekDates(new Date().getFullYear(), 1);
    addWritingEntry({ date: weekDates[0], project: 'xavier-transport', wordCount: 1000, sessionMinutes: 60, notes: '' });
    const digest = getWeeklyDigest(1);
    expect(digest).toContain('1,000 words');
  });
});

describe('Today Status', () => {
  beforeEach(() => { localStorage.clear(); });

  it('returns all false with no entries', () => {
    const status = getTodayStatus();
    expect(status.wroteToday).toBe(false);
    expect(status.loggedHealth).toBe(false);
    expect(status.loggedTech).toBe(false);
    expect(status.loggedMedia).toBe(false);
    expect(status.todayWords).toBe(0);
    expect(status.todaySteps).toBe(0);
  });

  it('detects entries logged today', () => {
    const today = getTodayString();
    addWritingEntry({ date: today, project: 'xavier-transport', wordCount: 750, sessionMinutes: 45, notes: '' });
    addHealthEntry({ date: today, steps: 9000, weight: 180, liftingSession: true, freeMealUsed: false, notes: '' });
    addTechLogEntry({ date: today, project: 'deep-seats', task: 'Test', hoursSpent: 2, milestone: 'v1', completed: false });
    addMediaEntry({ date: today, type: 'book', title: 'Book', creator: 'Author', notes: '', completed: true });

    const status = getTodayStatus();
    expect(status.wroteToday).toBe(true);
    expect(status.loggedHealth).toBe(true);
    expect(status.loggedTech).toBe(true);
    expect(status.loggedMedia).toBe(true);
    expect(status.todayWords).toBe(750);
    expect(status.todaySteps).toBe(9000);
  });
});
