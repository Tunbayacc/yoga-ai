import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { voiceClips } from '../src/data/voiceClips.js';
import { coachingClip, recordedReminder } from '../src/services/recordedVoice.js';
import { evaluatePose } from '../src/services/poseEvaluator.js';

test('48 bản thu MP3 đủ, có header và đồng bộ nội dung kịch bản', () => {
  const files = readdirSync(new URL('../public/audio/vi/', import.meta.url));
  assert.equal(Object.keys(voiceClips).length, 48);
  assert.deepEqual(files.sort(), Object.keys(voiceClips).map(id => `${id}.mp3`).sort());
  const doc = readFileSync(new URL('../docs/VOICE_RECORDING_SCRIPT.md', import.meta.url), 'utf8');
  for (const [id, text] of Object.entries(voiceClips)) {
    const bytes = readFileSync(new URL(`../public/audio/vi/${id}.mp3`, import.meta.url));
    assert.ok(bytes.length > 1000);
    assert.ok(bytes.toString('ascii', 0, 3) === 'ID3' || (bytes[0] === 255 && (bytes[1] & 224) === 224));
    assert.ok(doc.includes(text));
  }
});

test('Ánh xạ hai bên, nâng/hạ và vai cao đúng tệp', () => {
  for (const side of ['left', 'right']) {
    for (const direction of ['above', 'below']) {
      assert.equal(coachingClip('warrior', 'frontKnee', { side, direction }), `warrior-${side}-front-knee-${direction}`);
      assert.equal(coachingClip('warrior', `${side}Arm`, { side, armPosition: direction }), `warrior-${side}-arm-${direction}`);
      for (const id of ['bentKnee', 'footHeight', 'kneeOpening']) assert.ok(voiceClips[coachingClip('tree', id, { side, direction })]);
    }
    assert.equal(coachingClip('mountain', 'shoulders', { raisedSide: side }), `shoulders-${side}`);
  }
});

test('Evaluator cung cấp tệp đúng cho mọi tiêu chí sai; thiếu dữ liệu không chọn câu đạt', () => {
  for (const pose of ['mountain', 'warrior', 'tree']) for (const side of ['left', 'right']) {
    const p = Array.from({ length: 33 }, (_, i) => ({ x: i % 2 ? .35 : .65, y: .2 + (i % 7) * .1, z: 0, visibility: .99 }));
    Object.assign(p[11], { x: .3, y: .2 }); Object.assign(p[12], { x: .7, y: .2 });
    Object.assign(p[23], { x: .4, y: .5 }); Object.assign(p[24], { x: .6, y: .5 });
    const feedback = evaluatePose(p, pose, { standingSide: side, frontSide: side });
    for (const c of feedback.criteria.filter(c => c.status === 'fail')) {
      assert.ok(voiceClips[c.audioId], `${pose}:${c.id}`);
      assert.equal(recordedReminder({ criterionId: c.id }, feedback).id, c.audioId);
    }
    assert.equal(recordedReminder({ key: 'pass' }, { poseId: pose }).id, `pass-${pose}`);
  }
  assert.equal(recordedReminder({ key: 'unknown:left' }).id, 'missing-joints');
  assert.equal(recordedReminder({ key: 'unknown:camera-angle' }).id, 'camera-angle');
  assert.equal(recordedReminder({ key: 'missing-person' }).id, 'missing-person');
  assert.equal(recordedReminder({ key: 'pending' }), null);
});
