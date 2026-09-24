import { describe, expect, it } from 'vitest';
import { detectLang, parseStoredLang } from './langStore';

describe('detectLang', () => {
  it('picks German when any preferred language is German', () => {
    expect(detectLang({ languages: ['de-DE', 'de', 'en'] })).toBe('de');
    expect(detectLang({ languages: ['en-US', 'de-CH'] })).toBe('de');
    expect(detectLang({ languages: ['DE-at'] })).toBe('de');
    expect(detectLang({ languages: [], language: 'de' })).toBe('de');
  });

  it('falls back to English otherwise', () => {
    expect(detectLang({ languages: ['en-US', 'en'] })).toBe('en');
    expect(detectLang({ languages: ['fr-FR', 'nl'] })).toBe('en');
    expect(detectLang({ languages: ['dev', 'dsb'] })).toBe('en');
    expect(detectLang({})).toBe('en');
  });
});

describe('parseStoredLang', () => {
  it('accepts only en and de', () => {
    expect(parseStoredLang('de')).toBe('de');
    expect(parseStoredLang('en')).toBe('en');
    expect(parseStoredLang(null)).toBeNull();
    expect(parseStoredLang('fr')).toBeNull();
    expect(parseStoredLang('"de"')).toBeNull();
  });
});
