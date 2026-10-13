export class FeedbackEngine {
  constructor(confirmFrames = 4) { this.confirmFrames = confirmFrames; this.reset(); }
  reset() { this.history = new Map(); this.poseId = null; }
  update(result) {
    if (result.poseId !== this.poseId) { this.reset(); this.poseId = result.poseId; }
    const criteria = result.criteria.map(item => {
      if (item.status === 'unknown') { this.history.delete(item.id); return item; }
      const previous = this.history.get(item.id) ?? { candidate: item.status, count: 0, stable: 'pending' };
      previous.count = previous.candidate === item.status ? previous.count + 1 : 1;
      previous.candidate = item.status;
      if (previous.count >= this.confirmFrames) previous.stable = item.status;
      this.history.set(item.id, previous);
      return { ...item, status: previous.stable };
    });
    const status = criteria.some(c => c.status === 'unknown') ? 'unknown' : criteria.some(c => c.status === 'pending') ? 'pending' : criteria.every(c => c.status === 'pass') ? 'pass' : 'fail';
    return { ...result, criteria, status };
  }
}
