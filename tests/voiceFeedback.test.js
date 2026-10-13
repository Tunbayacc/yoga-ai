import test from 'node:test';
import assert from 'node:assert/strict';
import { voiceFeedback, VoiceReminderPlanner, vietnameseVoice } from '../src/services/voiceFeedback.js';

const fail = { status: 'fail', criteria: [
  { id: 'leftKnee', label: 'Gối trái', status: 'fail', advice: 'Duỗi nhẹ chân trái.' },
  { id: 'torso', label: 'Thân người', status: 'fail', advice: 'Giữ thân người thẳng.' },
] };
const pass = { status: 'pass', criteria: [{ id: 'leftKnee', status: 'pass' }] };
test('Lời nhắc chỉ rõ khớp và luân phiên hướng dẫn', () => {
  assert.match(voiceFeedback(fail, true, 0).text, /Gối trái.*Duỗi nhẹ chân trái/);
  assert.match(voiceFeedback(fail, true, 1).text, /Thân người.*Giữ thân người thẳng/);
});
test('Chỉ xác nhận tham chiếu khi mọi tiêu chí đạt, không khen dữ liệu thiếu', () => {
  assert.match(voiceFeedback(pass, true).text, /đạt các tiêu chí tham chiếu/);
  assert.match(voiceFeedback(pass, false).text, /Chưa tìm thấy người/);
  assert.match(voiceFeedback({ status: 'unknown' }, true).text, /Chưa đủ dữ liệu/);
  assert.equal(voiceFeedback({ ...pass, criteria: [] }, true), null);
  assert.equal(voiceFeedback({ ...pass, criteria: [{ status: 'unknown' }] }, true), null);
  assert.equal(voiceFeedback({ status: 'pending' }, true), null);
});
test('Chờ ổn định 1.5 giây; không nhắc lại liên tục; luân phiên sau 20 giây', () => {
  const planner = new VoiceReminderPlanner();
  assert.equal(planner.next(fail, true, 0), null);
  assert.equal(planner.next(fail, true, 1499), null);
  assert.match(planner.next(fail, true, 1500), /Gối trái/);
  assert.equal(planner.next(fail, true, 10000), null);
  assert.match(planner.next(fail, true, 21500), /Thân người/);
});
test('Thay đổi kết quả vẫn có khoảng nghỉ 8 giây và đợi xác nhận', () => {
  const planner = new VoiceReminderPlanner();
  planner.next(fail, true, 0); planner.next(fail, true, 1500);
  assert.equal(planner.next(pass, true, 1600), null);
  assert.equal(planner.next(pass, true, 4000), null);
  assert.match(planner.next(pass, true, 9500), /đạt các tiêu chí/);
});
test('Frame chập chờn và đang xác nhận không tạo lời nhắc cũ', () => {
  const planner = new VoiceReminderPlanner();
  planner.next(pass, true, 0);
  assert.equal(planner.next({ status: 'pending' }, true, 1000), null);
  assert.equal(planner.next(pass, true, 1600), null);
  assert.equal(planner.next(pass, true, 3000), null);
  assert.match(planner.next(pass, true, 3100), /đạt các tiêu chí/);
  planner.reset();
  assert.equal(planner.next(fail, true, 3200), null);
});
test('Ưu tiên giọng tiếng Việt local, không chọn nhầm ngôn ngữ', () => {
  const remote = { lang: 'vi-VN', localService: false }, local = { lang: 'vi-VN', localService: true };
  assert.equal(vietnameseVoice([{ lang: 'en-US' }, remote, local]), local);
  assert.equal(vietnameseVoice([remote]), remote);
  assert.equal(vietnameseVoice([{ lang: 'en-US' }]), null);
});
