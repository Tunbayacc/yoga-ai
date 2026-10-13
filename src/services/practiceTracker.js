import { QUALITY } from '../data/yogaPoses.js';

export const HOLD_TARGET_SECONDS = 5;
export const emptyPractice = () => ({ score: null, passed: 0, total: 0, visible: 0, required: 0, holdSeconds: 0, progress: 0, stage: 'waiting' });

export class PracticeTracker {
  constructor(targetSeconds = HOLD_TARGET_SECONDS) { this.targetSeconds = targetSeconds; this.reset(); }
  reset() { this.lastTime = null; this.wasHolding = false; this.elapsed = 0; }
  update({ feedback, rawFeedback = feedback, landmarks, detected, timestamp, suspended = false }) {
    const criteria = feedback?.criteria ?? [];
    const requiredIds = [...new Set(criteria.flatMap(c => c.joints ?? []))];
    const visible = requiredIds.filter(id => {
      const p = landmarks?.[id];
      return p && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1 &&
        (p.visibility ?? 0) >= QUALITY.visibility && (p.presence ?? 1) >= QUALITY.presence;
    }).length;
    const known = detected && criteria.length > 0 && criteria.every(c => ['pass', 'fail'].includes(c.status));
    const passed = criteria.filter(c => c.status === 'pass').length;
    const holding = !suspended && known && feedback.status === 'pass' && criteria.every(c => c.status === 'pass') &&
      rawFeedback?.status === 'pass' && rawFeedback.criteria?.every(c => c.status === 'pass');
    const delta = this.lastTime === null ? 0 : timestamp - this.lastTime;
    if (holding && this.wasHolding && delta >= 0 && delta <= 500) this.elapsed = Math.min(this.targetSeconds * 1000, this.elapsed + delta);
    else this.elapsed = 0;
    this.lastTime = timestamp; this.wasHolding = holding;
    const holdSeconds = Math.min(this.targetSeconds, this.elapsed / 1000);
    const stage = suspended ? 'waiting' : !detected ? 'searching' : !feedback || feedback.status === 'pending' ? 'confirming' :
      feedback.status === 'unknown' ? 'limited' : !holding ? 'adjusting' : holdSeconds >= this.targetSeconds ? 'complete' : 'holding';
    return { score: known && !suspended ? Math.round(passed / criteria.length * 100) : null,
      passed, total: criteria.length, visible, required: requiredIds.length, holdSeconds,
      progress: holdSeconds / this.targetSeconds * 100, stage };
  }
}
