// QA navigateur: caméra synthétique vide ou erreurs simulées, jamais une vraie capture utilisateur.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const require = createRequire(`${process.argv[2]}/package.json`);
const { chromium } = require('playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.argv[3] || 'http://127.0.0.1:5174/');
  await page.getByRole('heading', { name: /Vững tư thế/ }).waitFor();
  await page.getByRole('button', { name: /Warrior II/ }).click();
  await page.getByLabel('Chân trước').selectOption('right');
  await page.getByRole('button', { name: /Tree Pose/ }).click();
  await page.getByLabel('Chân trụ').selectOption('right');
  assert.equal(await page.getByRole('button', { name: /Tree Pose/ }).getAttribute('aria-pressed'), 'true');
  results.push('Chọn ba tư thế và bên chân: đạt');
  await page.evaluate(() => {
    navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('QA denied', 'NotAllowedError'); };
  });
  await page.getByRole('button', { name: /Bật camera/ }).first().click();
  await page.getByRole('alert').filter({ hasText: /chưa cho phép/ }).waitFor();
  results.push('Lỗi quyền camera: đạt');
  await page.reload();
  await page.evaluate(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480;
      const context = canvas.getContext('2d'); context.fillStyle = '#222'; context.fillRect(0, 0, 640, 480);
      window.qaStream = canvas.captureStream(10);
      window.qaInterval = setInterval(() => { context.fillRect(0, 0, 640, 480); }, 100);
      return window.qaStream;
    };
  });
  await page.getByRole('button', { name: /Bật camera/ }).first().click();
  await page.getByRole('button', { name: 'Tắt camera' }).waitFor();
  await page.getByRole('status').filter({ hasText: 'Chưa tìm thấy người' }).waitFor({ timeout: 90000 });
  assert.equal(await page.locator('.criteria .unknown').count(), 9);
  results.push('Mô hình MediaPipe/WASM thực chạy trên video trống: không kết luận sai, đạt');
  await page.getByRole('button', { name: 'Tắt camera' }).click();
  assert.equal(await page.evaluate(() => window.qaStream.getTracks().every(track => track.readyState === 'ended')), true);
  assert.equal(await page.evaluate(() => document.querySelector('video').srcObject), null);
  await page.evaluate(() => clearInterval(window.qaInterval));
  results.push('Dừng camera giải phóng tracks và video: đạt');
  await page.evaluate(() => {
    navigator.mediaDevices.getUserMedia = () => new Promise(resolve => { window.qaResolve = resolve; });
  });
  await page.getByRole('button', { name: /Bật camera/ }).first().click();
  await page.getByRole('button', { name: 'Tắt camera' }).click();
  await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width=640;c.height=480;
    window.qaLateStream = c.captureStream(10); window.qaResolve(window.qaLateStream);
  });
  await page.waitForFunction(() => window.qaLateStream.getTracks().every(t => t.readyState === 'ended'));
  results.push('Dừng trong lúc chờ quyền: stream đến muộn được giải phóng, đạt');
  // Ảnh mẫu công khai của MediaPipe, kiểm thử suy luận thực; không phải webcam thật.
  const imageResponse = await fetch('https://developers.google.com/static/mediapipe/images/solutions/examples/pose_detector.png');
  assert.equal(imageResponse.ok, true);
  const referenceImage = Buffer.from(await imageResponse.arrayBuffer()).toString('base64');
  const referenceResult = await page.evaluate(async base64 => {
    const { PoseDetector, drawSkeleton } = await import('/src/services/poseDetector.js');
    const { evaluatePose } = await import('/src/services/poseEvaluator.js');
    const image = new Image(); image.src = `data:image/png;base64,${base64}`; await image.decode();
    const detector = new PoseDetector();
    try {
      await detector.initialize();
      const result = detector.detect(image, performance.now());
      const landmarks = result.landmarks[0];
      const canvas = document.createElement('canvas');
      const evaluation = evaluatePose(landmarks, 'tree', { width: image.width, height: image.height });
      drawSkeleton(canvas, { videoWidth: image.width, videoHeight: image.height }, landmarks, evaluation.criteria);
      const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      return { count: landmarks?.length ?? 0, worldCount: result.worldLandmarks[0]?.length ?? 0,
        drawn: pixels.some((value, index) => index % 4 === 3 && value > 0), delegate: detector.delegate };
    } finally { detector.close(); }
  }, referenceImage);
  assert.equal(referenceResult.count, 33);
  assert.equal(referenceResult.worldCount, 33);
  assert.equal(referenceResult.drawn, true);
  results.push(`Ảnh mẫu MediaPipe: suy luận thực 33 điểm + 33 điểm 3D, canvas có bộ xương (${referenceResult.delegate}): đạt`);
  await mkdir('docs/screenshots', { recursive: true });
  await page.screenshot({ path: 'docs/screenshots/desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.screenshot({ path: 'docs/screenshots/mobile.png', fullPage: true });
  results.push('Viewport 390px không tràn ngang: đạt');
  assert.deepEqual(errors, []);
  results.push('Không có pageerror: đạt');
  console.log(results.join('\n'));
} finally { await browser.close(); }
