/// <reference types="node" />

import assert from 'node:assert/strict';

import { getChapelDoorDirection, getChapelSeatId } from '../src/entities/chapel/lib/seat';
import { chapelSeatBounds } from '../src/features/chapel/ui/seatmap/chapel-seat-bounds';

assert.equal(getChapelSeatId(1, ' a-01-03 '), 'A-1-3');
assert.equal(getChapelSeatId(1, 'C - 14 - 2'), 'C-14-2');
assert.equal(getChapelSeatId(2, 'H-16-9'), 'H-16-9');
assert.equal(getChapelSeatId(1, 'H-16-9'), null);
assert.equal(getChapelSeatId(3, 'invalid'), null);
assert.deepEqual(chapelSeatBounds['1:C-14-2'], [380.182, 411, 17.182, 15]);
assert.equal(Object.keys(chapelSeatBounds).length, 1163);

assert.equal(getChapelDoorDirection('C-10-5'), '정면 좌측 문');
assert.equal(getChapelDoorDirection('C-10-10'), '정면 우측 문');
assert.equal(getChapelDoorDirection('H-16-4'), '좌측 문');
assert.equal(getChapelDoorDirection('H-16-5'), '우측 문');

console.log('chapel seat checks passed');
