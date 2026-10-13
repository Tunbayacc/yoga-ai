import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePose } from '../src/services/poseEvaluator.js';
import { voiceFeedback, reminderStillRelevant } from '../src/services/voiceFeedback.js';

function fixture() {
  const p = Array.from({ length: 33 }, () => ({ x: .5, y: .1, z: 0, visibility: .99, presence: .99 }));
  for (const [id,x,y] of [[11,.4,.2],[12,.6,.2],[23,.4,.5],[24,.6,.5],[25,.15,.5],[27,.15,.9],[26,.75,.7],[28,.9,.9],[13,.25,.2],[15,.1,.2],[14,.75,.2],[16,.9,.2]]) Object.assign(p[id], { x,y });
  return p;
}
test('Warrior phân biệt gối trước gập sâu với còn duỗi, đúng bên cơ thể', () => {
  const deep = fixture(); deep[27].x = .4;
  const deepCheck = evaluatePose(deep,'warrior').criteria.find(c => c.id === 'frontKnee');
  assert.equal(deepCheck.direction,'below');
  assert.match(deepCheck.advice,/nâng hông.*duỗi bớt gối trái/);
  const straight = fixture(); Object.assign(straight[25],{x:.4,y:.7}); Object.assign(straight[27],{x:.4,y:.9});
  const straightCheck = evaluatePose(straight,'warrior').criteria.find(c => c.id === 'frontKnee');
  assert.equal(straightCheck.direction,'above');
  assert.match(straightCheck.advice,/gập gối trái thêm/);
  const right = fixture(); Object.assign(right[26],{x:.6,y:.7}); Object.assign(right[28],{x:.6,y:.9});
  assert.match(evaluatePose(right,'warrior',{frontSide:'right'}).criteria.find(c => c.id === 'frontKnee').advice,/gập gối phải thêm/);
});
test('Tay cao và thấp nhận hướng chỉnh trái ngược', () => {
  const high = fixture(); high[15].y = .01;
  const low = fixture(); low[15].y = .4;
  const find = p => evaluatePose(p,'warrior').criteria.find(c => c.id === 'leftArm').advice;
  assert.match(find(high),/cao hơn.*Hạ cả cánh tay trái/);
  assert.match(find(low),/thấp hơn.*Nâng cả cánh tay trái/);
});
test('Tree bàn chân nâng quá cao nhận hạ, không nhắc nâng thêm', () => {
  const p = fixture(); Object.assign(p[28],{x:.4,y:.01});
  const criterion = evaluatePose(p,'tree').criteria.find(c => c.id === 'footHeight');
  assert.equal(criterion.direction,'above');
  assert.match(criterion.advice,/Hạ chân gập/);
  assert.doesNotMatch(criterion.advice,/nâng nhẹ bàn chân/);
});
test('Vai cao được nhận diện theo tọa độ, chỉ đúng bên cần thả lỏng', () => {
  const p = fixture(); p[11].y = .1;
  assert.match(evaluatePose(p,'mountain').criteria.find(c => c.id === 'shoulders').advice,/vai trái đang cao hơn.*Thả lỏng vai trái/);
});
test('Thiếu cổ chân nhắc vùng thật sự bị thiếu; góc quay có hướng dẫn riêng', () => {
  const p = fixture(); p[27].visibility = .1;
  const feedback = evaluatePose(p,'warrior');
  assert.deepEqual(feedback.missingParts,['cổ chân trái']);
  const text = voiceFeedback(feedback,true).text;
  assert.match(text,/cổ chân trái/); assert.doesNotMatch(text,/gập gối.*thêm/);
  p[11].x=.495; p[12].x=.505;
  assert.match(voiceFeedback(evaluatePose(p,'warrior'),true).text,/góc quay.*Hướng ngực và hông/);
});
test('Lời nhắc giữ tư thế đạt có nội dung riêng từng tư thế', () => {
  const criteria=[{status:'pass'}];
  assert.match(voiceFeedback({poseId:'mountain',status:'pass',criteria},true).text,/đầu gối mềm/);
  assert.match(voiceFeedback({poseId:'warrior',status:'pass',criteria},true).text,/chân trước gập/);
  assert.match(voiceFeedback({poseId:'tree',status:'pass',criteria},true).text,/một điểm cố định/);
});
test('Đọc hết hướng dẫn khi lỗi khác thay đổi; hủy khi lỗi đang nhắc đã hết', () => {
  const original = evaluatePose(fixture(), 'mountain');
  const reminder = voiceFeedback(original, true);
  const changed = { ...original, criteria: original.criteria.filter(c => c.id === reminder.criterionId) };
  assert.equal(reminderStillRelevant(reminder, changed, true), true);
  assert.equal(reminderStillRelevant(reminder, { ...changed, criteria: changed.criteria.map(c => ({ ...c, status: 'pass' })) }, true), false);
  assert.equal(reminderStillRelevant(reminder, changed, false), false);
});
