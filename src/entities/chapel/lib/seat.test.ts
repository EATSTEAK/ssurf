import { describe, expect, it } from 'vitest';

import { getChapelDoorDirection, getChapelSeatId } from './seat';

describe('getChapelSeatId', () => {
  it('normalizes a U-Saint seat assignment', () => {
    expect(getChapelSeatId(1, 'C - 14 - 2')).toBe('C-14-2');
    expect(getChapelSeatId(1, ' a-01-03 ')).toBe('A-1-3');
  });

  it('rejects malformed or mismatched floor assignments', () => {
    expect(getChapelSeatId(1, 'H-16-9')).toBeNull();
    expect(getChapelSeatId(3, 'invalid')).toBeNull();
  });
});

describe('getChapelDoorDirection', () => {
  it.each([
    ['C-10-5', '정면 좌측 문'],
    ['C-10-10', '정면 우측 문'],
    ['H-16-4', '좌측 문'],
    ['H-16-5', '우측 문'],
  ])('returns the entrance for %s', (seat, entrance) => {
    expect(getChapelDoorDirection(seat)).toBe(entrance);
  });
});
