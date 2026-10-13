import test from 'node:test';
import assert from 'node:assert/strict';
import { PracticeTracker } from '../src/services/practiceTracker.js';

const feedback = (...statuses) => ({ status: statuses.some(s => s === 'unknown') ? 'unknown' : statuses.some(s => s === 'pending') ? 'pending' : statuses.every(s => s === 'pass') ? 'pass' : 'fail',
  criteria: statuses.map((status, id) => ({ id: `${id}`, status, joints: [11, 12] })) });
const good = feedback('pass', 'pass');
const input = (timestamp, extra = {}) => ({ timestamp, feedback: good, detected: true, ...extra });
test('Điểm là tỷ lệ tiêu chí đạt; dữ liệu thiếu hoặc pending không có điểm', () => {
  const tracker = new PracticeTracker();
  assert.equal(tracker.update(input(0, { feedback: feedback('pass','fail','fail') })).score,33);
  assert.equal(tracker.update(input(100, { feedback: feedback('pass','unknown') })).score,null);
  assert.equal(tracker.update(input(200, { feedback: feedback('pass','pending') })).score,null);
  assert.equal(tracker.update(input(300, { detected:false })).score,null);
});
test('Giữ đúng liên tục tích lũy từ frame thật đến mục tiêu 5s', () => {
  const tracker = new PracticeTracker();
  assert.equal(tracker.update(input(0)).holdSeconds,0);
  let result;
  for (let t=200;t<=5000;t+=200) result=tracker.update(input(t));
  assert.equal(result.holdSeconds,5); assert.equal(result.progress,100); assert.equal(result.stage,'complete');
  assert.equal(tracker.update(input(5200)).holdSeconds,5);
});
test('Lỗi raw ngắt giữ ngay dù phản hồi làm mượt vẫn đạt', () => {
  const tracker = new PracticeTracker(); tracker.update(input(0)); tracker.update(input(200));
  const result=tracker.update(input(400,{rawFeedback:feedback('pass','fail')}));
  assert.equal(result.holdSeconds,0); assert.equal(result.stage,'adjusting');
  assert.equal(tracker.update(input(600)).holdSeconds,0);
  assert.equal(tracker.update(input(800)).holdSeconds,.2);
});
test('Mất người, góc quay hoặc khớp thiếu ngắt giữ và hiển thị trạng thái đúng', () => {
  for (const [extra,stage] of [[{detected:false},'searching'],[{feedback:feedback('unknown')},'limited'],[{feedback:feedback('pending')},'confirming']]) {
    const tracker = new PracticeTracker();tracker.update(input(0));tracker.update(input(200));
    const result=tracker.update(input(400,extra));
    assert.equal(result.holdSeconds,0);assert.equal(result.stage,stage);
  }
});
test('Không cộng bù khoảng frame ngừng, chuyển tab hoặc thời gian đi lùi', () => {
  const tracker = new PracticeTracker();tracker.update(input(0));tracker.update(input(200));
  assert.equal(tracker.update(input(2000)).holdSeconds,0);
  tracker.update(input(2200));
  assert.equal(tracker.update(input(2400,{suspended:true})).holdSeconds,0);
  assert.equal(tracker.update(input(2600)).holdSeconds,0);
  assert.equal(tracker.update(input(2500)).holdSeconds,0);
});
test('Đếm khớp cần đo, không dùng toàn bộ 33 điểm làm độ chính xác AI', () => {
  const landmarks=[];landmarks[11]={x:.4,y:.2,visibility:.9,presence:.9};landmarks[12]={x:.6,y:.2,visibility:.1,presence:.9};
  const result=new PracticeTracker().update(input(0,{landmarks}));
  assert.equal(result.required,2);assert.equal(result.visible,1);
});
test('Reset khi đổi tư thế hoặc dừng camera xóa thời gian cũ', () => {
  const tracker=new PracticeTracker();tracker.update(input(0));tracker.update(input(200));tracker.reset();
  assert.equal(tracker.update(input(400)).holdSeconds,0);
});
