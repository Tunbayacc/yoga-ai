import test from 'node:test';
import assert from 'node:assert/strict';
import { cameraConstraints, isMobileCameraDevice } from '../src/services/cameraSettings.js';

test('Điện thoại Android/iPhone được đổi camera, desktop màn hình nhỏ không bị nhận nhầm', () => {
  assert.equal(isMobileCameraDevice({ userAgent: 'Mozilla Android Mobile' }), true);
  assert.equal(isMobileCameraDevice({ userAgent: 'iPhone' }), true);
  assert.equal(isMobileCameraDevice({ userAgent: 'Windows NT', maxTouchPoints: 10 }), false);
});
test('Điện thoại yêu cầu đúng camera, desktop luôn camera trước và không microphone', () => {
  for (const facing of ['user', 'environment']) {
    const mobile = cameraConstraints(facing, true);
    assert.deepEqual(mobile.video.facingMode, { exact: facing });
    assert.equal(mobile.audio, false);
    assert.equal(cameraConstraints(facing, false).video.facingMode, 'user');
  }
});
