import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateDate,
  validateWritingEntry,
  validateHealthEntry,
  validateTechEntry,
  getTodayString,
} from '../services/storageService';

describe('validateDate - edge cases', () => {
  beforeEach(() => { localStorage.clear(); });

  it('rejects empty string', () => {
    expect(validateDate('').valid).toBe(false);
  });

  it('accepts January 1 of current year', () => {
    const year = new Date().getFullYear();
    expect(validateDate(`${year}-01-01`).valid).toBe(true);
  });

  it('accepts today', () => {
    expect(validateDate(getTodayString()).valid).toBe(true);
  });

  it('rejects tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = validateDate(tomorrow.toISOString().split('T')[0]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('future');
  });

  it('rejects date from previous year', () => {
    const year = new Date().getFullYear() - 1;
    const result = validateDate(`${year}-12-31`);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('current year');
  });

  it('rejects malformed date MM-DD-YYYY', () => {
    const result = validateDate('01-15-2026');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('YYYY-MM-DD');
  });

  it('rejects date with slashes', () => {
    const result = validateDate('2026/01/15');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('YYYY-MM-DD');
  });

  it('rejects date with text', () => {
    const result = validateDate('Jan 15, 2026');
    expect(result.valid).toBe(false);
  });

  it('rejects incomplete date', () => {
    const result = validateDate('2026-01');
    expect(result.valid).toBe(false);
  });
});

describe('validateWritingEntry - word count limits', () => {
  beforeEach(() => { localStorage.clear(); });

  it('rejects 0 words', () => {
    const result = validateWritingEntry(0, 30);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Word count');
  });

  it('accepts 1 word', () => {
    expect(validateWritingEntry(1, 30).valid).toBe(true);
  });

  it('accepts 50000 words (max boundary)', () => {
    expect(validateWritingEntry(50000, 30).valid).toBe(true);
  });

  it('rejects 50001 words (over max)', () => {
    const result = validateWritingEntry(50001, 30);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('unrealistic');
  });

  it('rejects negative word count', () => {
    expect(validateWritingEntry(-100, 30).valid).toBe(false);
  });
});

describe('validateWritingEntry - session minutes limits', () => {
  beforeEach(() => { localStorage.clear(); });

  it('rejects 0 minutes', () => {
    expect(validateWritingEntry(100, 0).valid).toBe(false);
  });

  it('accepts 1 minute', () => {
    expect(validateWritingEntry(100, 1).valid).toBe(true);
  });

  it('accepts 1440 minutes (24 hours, max boundary)', () => {
    expect(validateWritingEntry(100, 1440).valid).toBe(true);
  });

  it('rejects 1441 minutes (over max)', () => {
    const result = validateWritingEntry(100, 1441);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('24 hours');
  });

  it('rejects negative minutes', () => {
    expect(validateWritingEntry(100, -10).valid).toBe(false);
  });
});

describe('validateHealthEntry - steps limits', () => {
  beforeEach(() => { localStorage.clear(); });

  it('accepts 0 steps', () => {
    expect(validateHealthEntry(0).valid).toBe(true);
  });

  it('accepts 100000 steps (max boundary)', () => {
    expect(validateHealthEntry(100000).valid).toBe(true);
  });

  it('rejects 100001 steps (over max)', () => {
    const result = validateHealthEntry(100001);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('unrealistic');
  });

  it('rejects negative steps', () => {
    expect(validateHealthEntry(-1).valid).toBe(false);
  });

  it('rejects NaN steps', () => {
    expect(validateHealthEntry(NaN).valid).toBe(false);
  });
});

describe('validateHealthEntry - weight limits', () => {
  beforeEach(() => { localStorage.clear(); });

  it('accepts no weight (undefined)', () => {
    expect(validateHealthEntry(5000).valid).toBe(true);
  });

  it('accepts valid weight', () => {
    expect(validateHealthEntry(5000, 175).valid).toBe(true);
  });

  it('rejects 0 weight', () => {
    const result = validateHealthEntry(5000, 0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Weight must be positive');
  });

  it('rejects -1 weight', () => {
    expect(validateHealthEntry(5000, -1).valid).toBe(false);
  });

  it('accepts 1000 weight (max boundary)', () => {
    expect(validateHealthEntry(5000, 1000).valid).toBe(true);
  });

  it('rejects 1001 weight (over max)', () => {
    const result = validateHealthEntry(5000, 1001);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('unrealistic');
  });

  it('accepts 0.5 weight (fractional)', () => {
    expect(validateHealthEntry(5000, 0.5).valid).toBe(true);
  });
});

describe('validateTechEntry - hours limits', () => {
  beforeEach(() => { localStorage.clear(); });

  it('rejects 0 hours', () => {
    const result = validateTechEntry('Task', 0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Hours');
  });

  it('accepts 0.5 hours', () => {
    expect(validateTechEntry('Task', 0.5).valid).toBe(true);
  });

  it('accepts 24 hours (max boundary)', () => {
    expect(validateTechEntry('Task', 24).valid).toBe(true);
  });

  it('rejects 25 hours (over max)', () => {
    const result = validateTechEntry('Task', 25);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceed 24');
  });

  it('rejects negative hours', () => {
    expect(validateTechEntry('Task', -1).valid).toBe(false);
  });
});

describe('validateTechEntry - task description', () => {
  beforeEach(() => { localStorage.clear(); });

  it('rejects empty string', () => {
    const result = validateTechEntry('', 3);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Task description');
  });

  it('rejects whitespace-only string', () => {
    expect(validateTechEntry('   ', 3).valid).toBe(false);
  });

  it('rejects tab-only string', () => {
    expect(validateTechEntry('\t', 3).valid).toBe(false);
  });

  it('accepts single character task', () => {
    expect(validateTechEntry('x', 1).valid).toBe(true);
  });

  it('accepts long task description', () => {
    expect(validateTechEntry('A'.repeat(1000), 1).valid).toBe(true);
  });
});
