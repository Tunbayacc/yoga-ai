export function validPoint(point, dimensions = 2) {
  return !!point && ['x', 'y', ...(dimensions === 3 ? ['z'] : [])].every(key => Number.isFinite(point[key]));
}

export function calculateAngle(a, b, c, dimensions = 2) {
  if (![2, 3].includes(dimensions) || ![a, b, c].every(p => validPoint(p, dimensions))) return null;
  const keys = dimensions === 3 ? ['x', 'y', 'z'] : ['x', 'y'];
  const u = keys.map(k => a[k] - b[k]);
  const v = keys.map(k => c[k] - b[k]);
  const length = Math.hypot(...u) * Math.hypot(...v);
  if (!Number.isFinite(length) || length < 1e-10) return null;
  const cosine = u.reduce((sum, value, i) => sum + value * v[i], 0) / length;
  return Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 / Math.PI;
}

export function tiltFromVertical(a, b) {
  if (![a, b].every(p => validPoint(p)) || Math.hypot(a.x - b.x, a.y - b.y) < 1e-10) return null;
  return Math.atan2(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) * 180 / Math.PI;
}

export function tiltFromHorizontal(a, b) {
  const vertical = tiltFromVertical(a, b);
  return vertical === null ? null : 90 - vertical;
}
