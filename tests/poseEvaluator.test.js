import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePose } from '../src/services/poseEvaluator.js';
import { FeedbackEngine } from '../src/services/feedbackEngine.js';

// Dữ liệu tổng hợp chỉ dùng kiểm thử, không được đưa vào giao diện.
function mountain() {
  const points = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.1, z: 0, visibility: 0.99, presence: 0.99 }));
  for (const [id, x, y] of [[11,.4,.2],[12,.6,.2],[23,.4,.5],[24,.6,.5],[25,.4,.7],[26,.6,.7],[27,.4,.95],[28,.6,.95]]) Object.assign(points[id], { x, y });
  return points;
}
function warrior(front = 'left') {
  const p = mountain();
  const coords = front === 'left' ? [[25,.15,.5],[27,.15,.9],[26,.75,.7],[28,.9,.9]] : [[26,.85,.5],[28,.85,.9],[25,.25,.7],[27,.1,.9]];
  for (const [id,x,y] of [...coords,[13,.25,.2],[15,.1,.2],[14,.75,.2],[16,.9,.2]]) Object.assign(p[id],{x,y});
  return p;
}
function tree(standing = 'left') {
  const p = mountain();
  for (const [id,x,y] of standing === 'left' ? [[26,.8,.7],[28,.42,.75]] : [[25,.2,.7],[27,.58,.75]]) Object.assign(p[id],{x,y});
  return p;
}
test('Mountain thẳng đạt bộ quy tắc riêng', () => {
  const r = evaluatePose(mountain(), 'mountain');
  assert.equal(r.status,'pass'); assert.equal(r.criteria.length,9);
});
test('Mountain gối lệch trả điều chỉnh và chỉ rõ khớp', () => {
  const p = mountain(); p[25].x = .15;
  const r = evaluatePose(p,'mountain');
  assert.equal(r.status,'fail'); assert.equal(r.criteria.find(c => c.id === 'leftKnee').status,'fail');
});
test('Warrior II hỗ trợ cả hai chân trước', () => {
  for (const frontSide of ['left','right']) assert.equal(evaluatePose(warrior(frontSide),'warrior',{frontSide}).status,'pass');
});
test('Warrior II từ chối hai chân thẳng và tay hướng vào trong', () => {
  const p = warrior(); Object.assign(p[15],{x:.7,y:.2});
  assert.equal(evaluatePose(p,'warrior').criteria.find(c => c.id === 'leftOutward').status,'fail');
  assert.equal(evaluatePose(mountain(),'warrior').criteria.find(c => c.id === 'frontKnee').status,'fail');
});
test('Tree hỗ trợ hai bên và phát hiện bàn chân chưa nâng', () => {
  for (const standingSide of ['left','right']) assert.equal(evaluatePose(tree(standingSide),'tree',{standingSide}).status,'pass');
  const p = tree(); p[28].y = .95;
  assert.equal(evaluatePose(p,'tree').criteria.find(c => c.id === 'footHeight').status,'fail');
});
test('Tất cả tư thế không đủ dữ liệu khi không tìm thấy người', () => {
  for (const pose of ['mountain','warrior','tree']) {
    const r = evaluatePose(undefined,pose);
    assert.equal(r.status,'unknown'); assert.ok(r.criteria.every(c => c.value === null));
  }
});
test('Điểm khuất, ngoài ảnh, presence thấp, NaN không được kết luận đạt', () => {
  for (const patch of [{visibility:.1},{presence:.1},{x:1.2},{x:NaN},{visibility:undefined}]) {
    const p=mountain(); Object.assign(p[27],patch);
    assert.equal(evaluatePose(p,'mountain').status,'unknown');
  }
});
test('Camera nhìn nghiêng bị loại', () => {
  const p = mountain(); p[11].x = .495; p[12].x = .505;
  const r = evaluatePose(p,'mountain');
  assert.equal(r.status,'unknown'); assert.match(r.message,/góc quay/);
});
test('Mất một vai không làm lỗi khi xét hướng cánh tay Warrior', () => {
  const p = warrior(); p[12] = undefined;
  const result = evaluatePose(p, 'warrior');
  assert.equal(result.status, 'unknown');
  assert.equal(result.criteria.find(c => c.id === 'leftOutward').status, 'unknown');
});
test('Góc chiếu dùng kích thước ảnh và ngưỡng điều chỉnh được', () => {
  const p=mountain();p[25].x=.45;
  const square=evaluatePose(p,'mountain',{width:100,height:100});
  const wide=evaluatePose(p,'mountain',{width:200,height:100});
  assert.notEqual(square.criteria[0].value,wide.criteria[0].value);
  assert.equal(evaluatePose(p,'mountain',{thresholds:{knee:[100,180]}}).criteria[0].status,'pass');
});
test('Feedback xác nhận nhiều frame, bỏ kết quả cũ ngay khi mất điểm', () => {
  const engine=new FeedbackEngine(3), good=evaluatePose(mountain(),'mountain');
  assert.equal(engine.update(good).status,'pending'); assert.equal(engine.update(good).status,'pending'); assert.equal(engine.update(good).status,'pass');
  assert.equal(engine.update(evaluatePose(undefined,'mountain')).status,'unknown');
  assert.equal(engine.update(good).status,'pending');
  assert.equal(engine.update(evaluatePose(warrior(),'warrior')).status,'pending');
});
test('Feedback không đổi theo một frame nhiễu', () => {
  const engine=new FeedbackEngine(2),good=evaluatePose(mountain(),'mountain');
  engine.update(good);engine.update(good);
  const p=mountain();p[25].x=.15;const bad=evaluatePose(p,'mountain');
  assert.equal(engine.update(bad).status,'pass');assert.equal(engine.update(bad).status,'fail');
});
