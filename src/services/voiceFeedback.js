import { holdCoaching } from './poseCoaching.js';

export function voiceFeedback(feedback, detected, index = 0) {
  if (!feedback || feedback.status === 'pending') return null;
  if (!detected) return { key: 'missing-person', text: 'Chưa tìm thấy người. Lùi lại đến khi camera thấy từ đầu đến bàn chân, rồi đứng ở giữa khung hình. Đặt camera cố định, ngang khoảng hông và bật thêm ánh sáng phía trước nếu ảnh tối.' };
  if (feedback.status === 'unknown') {
    if (feedback.message?.includes('góc quay')) return { key: 'unknown:camera-angle', text: 'Chưa đủ dữ liệu vì góc quay chưa phù hợp. Hướng ngực và hông về camera, giữ camera cố định ngang hông. Hãy giữ nguyên vị trí một chút để hệ thống nhận lại các khớp.' };
    const missing = feedback.missingParts ?? [];
    const body = missing.length ? `Camera chưa quan sát rõ vùng ${missing.slice(0, 2).join(' và ').toLowerCase()}.` : 'Camera chưa thấy rõ các khớp cần kiểm tra.';
    return { key: `unknown:${missing.join('|')}`, text: `Chưa đủ dữ liệu để đánh giá. ${body} Đưa các vùng này vào khung hình, tránh để tay hoặc đồ vật che khuất và tăng ánh sáng phía trước. Giữ vị trí ổn định để hệ thống kiểm tra lại.` };
  }
  if (!feedback.criteria?.length || feedback.criteria.some(c => c.status === 'unknown' || c.status === 'pending')) return null;
  if (feedback.status === 'pass' && feedback.criteria.every(c => c.status === 'pass')) {
    return { key: 'pass', text: `Tư thế đang đạt các tiêu chí tham chiếu. ${holdCoaching[feedback.poseId] ?? 'Giữ tư thế thoải mái, hít vào nhẹ nhàng và thở ra chậm.'}` };
  }
  const failed = feedback.criteria.filter(c => c.status === 'fail' && c.advice);
  if (!failed.length) return null;
  const criterion = failed[index % failed.length];
  return { key: `fail:${failed.map(c => `${c.id}:${c.advice}`).join('|')}`, criterionId: criterion.id, advice: criterion.advice,
    text: criterion.detailedCoaching || criterion.advice.startsWith(criterion.label) ? criterion.advice : `${criterion.label}. ${criterion.advice}` };
}

export function reminderStillRelevant(reminder, feedback, detected) {
  if (!reminder) return true; // Câu xác nhận bật giọng nói không mô tả tư thế.
  if (reminder.criterionId) {
    if (!detected || !feedback || ['unknown', 'pending'].includes(feedback.status)) return false;
    return feedback.criteria?.some(c => c.id === reminder.criterionId && c.status === 'fail' && c.advice === reminder.advice) ?? false;
  }
  return voiceFeedback(feedback, detected)?.key === reminder.key;
}

export class VoiceReminderPlanner {
  constructor({ settleMs = 1500, cooldownMs = 8000, repeatMs = 20000 } = {}) {
    Object.assign(this, { settleMs, cooldownMs, repeatMs }); this.reset();
  }
  reset() { this.candidate = null; this.since = 0; this.lastKey = null; this.lastSpoken = -Infinity; this.index = 0; this.lastReminder = null; }
  next(feedback, detected, now) {
    const message = voiceFeedback(feedback, detected, this.index);
    if (!message) { this.candidate = null; return null; }
    if (message.key !== this.candidate) { this.candidate = message.key; this.since = now; this.index = 0; return null; }
    if (now - this.since < this.settleMs || now - this.lastSpoken < this.cooldownMs) return null;
    if (message.key === this.lastKey && now - this.lastSpoken < this.repeatMs) return null;
    const ready = voiceFeedback(feedback, detected, this.index);
    this.lastKey = ready.key; this.lastSpoken = now; this.index += 1;
    this.lastReminder = ready;
    return ready.text;
  }
}

export function vietnameseVoice(voices) {
  const matches = voices.filter(voice => /^vi(?:[-_]|$)/i.test(voice.lang));
  return matches.find(voice => voice.localService) ?? matches[0] ?? null;
}
