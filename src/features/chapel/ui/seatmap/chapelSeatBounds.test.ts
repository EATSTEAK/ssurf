import { describe, expect, it } from 'vitest';

import { chapelSeatBounds } from './chapelSeatBounds';

describe('chapelSeatBounds', () => {
  it('contains every seat from the chapel seatmap assets', () => {
    expect(Object.keys(chapelSeatBounds)).toHaveLength(1163);
  });

  it('locates the known U-Saint assignment in the first-floor viewBox', () => {
    expect(chapelSeatBounds['1:C-14-2']).toEqual([380.182, 411, 17.182, 15]);
  });
});
