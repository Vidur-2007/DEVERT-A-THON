import { describe, expect, it } from 'vitest';
import { matchOption, matchSpokenAnswer, matchYesNo, parseSpokenNumber } from '../matchAnswer';

describe('matchYesNo', () => {
  it('matches English yes/no', () => {
    expect(matchYesNo('yes')).toBe(true);
    expect(matchYesNo('no')).toBe(false);
  });

  it('matches Hindi/Telugu/Tamil synonyms regardless of UI language', () => {
    expect(matchYesNo('haan')).toBe(true);
    expect(matchYesNo('नहीं')).toBe(false);
    expect(matchYesNo('avunu')).toBe(true);
    expect(matchYesNo('ledu')).toBe(false);
    expect(matchYesNo('aamaa')).toBe(true);
    expect(matchYesNo('illai')).toBe(false);
  });

  it('matches a synonym embedded in a longer sentence', () => {
    expect(matchYesNo('haan mera hai')).toBe(true);
  });

  it('returns null when nothing matches, or both yes and no appear', () => {
    expect(matchYesNo('maybe later')).toBeNull();
    expect(matchYesNo('yes no')).toBeNull();
  });
});

describe('matchOption', () => {
  const options = [
    { value: 'farmer', label: 'Farmer' },
    { value: 'street_vendor', label: 'Street vendor' },
    { value: 'homemaker', label: 'Homemaker' },
  ];

  it('matches an exact label (case-insensitive)', () => {
    expect(matchOption('farmer', options)).toBe('farmer');
    expect(matchOption('FARMER', options)).toBe('farmer');
  });

  it('matches a label spoken inside a longer phrase', () => {
    expect(matchOption('I am a street vendor', options)).toBe('street_vendor');
  });

  it('fuzzy-matches a near-miss within edit distance 2', () => {
    expect(matchOption('farmar', options)).toBe('farmer'); // 1 substitution
    expect(matchOption('homemakr', options)).toBe('homemaker'); // 1 deletion
  });

  it('returns null when nothing is close enough', () => {
    expect(matchOption('astronaut', options)).toBeNull();
  });
});

describe('parseSpokenNumber', () => {
  it('parses a plain number', () => {
    expect(parseSpokenNumber('45')).toBe(45);
  });

  it('parses lakh amounts across scripts', () => {
    expect(parseSpokenNumber('2 lakh')).toBe(200000);
    expect(parseSpokenNumber('2.5 lakh')).toBe(250000);
    expect(parseSpokenNumber('२ लाख')).toBe(200000);
    expect(parseSpokenNumber('2 లక్షలు')).toBe(200000);
    expect(parseSpokenNumber('2 லட்சம்')).toBe(200000);
  });

  it('parses thousand (hazaar) amounts', () => {
    expect(parseSpokenNumber('50 hazaar')).toBe(50000);
    expect(parseSpokenNumber('50 हज़ार')).toBe(50000);
  });

  it('parses crore amounts', () => {
    expect(parseSpokenNumber('1 crore')).toBe(10000000);
  });

  it('returns null for non-numeric speech', () => {
    expect(parseSpokenNumber('I do not know')).toBeNull();
  });
});

describe('matchSpokenAnswer', () => {
  it('dispatches boolean/enum/number by type', () => {
    expect(matchSpokenAnswer('yes', 'boolean')).toEqual({ matched: true, value: true });
    expect(matchSpokenAnswer('2 lakh', 'number')).toEqual({ matched: true, value: 200000 });
    expect(
      matchSpokenAnswer('farmer', 'enum', [{ value: 'farmer', label: 'Farmer' }]),
    ).toEqual({ matched: true, value: 'farmer' });
  });

  it('reports no match instead of guessing', () => {
    expect(matchSpokenAnswer('maybe', 'boolean')).toEqual({ matched: false });
    expect(matchSpokenAnswer('', 'number')).toEqual({ matched: false });
  });
});
