import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAngle, tiltFromVertical, tiltFromHorizontal } from '../src/services/angleCalculator.js';
test('Góc 0, 90 và 180 độ', () => {
  const center = { x: 0, y: 0 }, right = { x: 1, y: 0 };
  assert.equal(calculateAngle(right, center, right), 0);
  assert.equal(calculateAngle(right, center, { x: 0, y: 1 }), 90);
  assert.equal(calculateAngle(right, center, { x: -1, y: 0 }), 180);
});
test('Góc 3D sử dụng trục z', () => {
  assert.equal(calculateAngle({ x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 3), 90);
});
test('Điểm trùng, thiếu, NaN, Infinity hoặc chiều không hợp lệ trả null', () => {
  const p = { x: 1, y: 1 };
  assert.equal(calculateAngle(p, p, p), null);
  for (const bad of [null, undefined, { x: NaN, y: 0 }, { x: Infinity, y: 0 }]) assert.equal(calculateAngle(bad, p, { x: 2, y: 2 }), null);
  assert.equal(calculateAngle(p, p, p, 4), null);
  assert.equal(calculateAngle(p, p, p, 3), null);
});
test('Độ nghiêng theo trục dọc và ngang', () => {
  const a = { x: 0, y: 0 };
  assert.equal(tiltFromVertical(a, { x: 0, y: 1 }), 0);
  assert.equal(tiltFromHorizontal(a, { x: 1, y: 0 }), 0);
  assert.equal(tiltFromVertical(a, a), null);
});
