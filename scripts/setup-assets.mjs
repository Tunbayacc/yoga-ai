import { mkdir, cp, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
await mkdir(new URL('public/models/', root), { recursive: true });
await cp(new URL('node_modules/@mediapipe/tasks-vision/wasm/', root), new URL('public/wasm/', root), { recursive: true });
const target = new URL('public/models/pose_landmarker_lite.task', root);
try { await access(target); console.log('Mô hình đã tồn tại.'); }
catch {
  const url = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
  const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`Không tải được mô hình: HTTP ${response.status}`);
  const data = new Uint8Array(await response.arrayBuffer());
  if (data.length < 1000000) throw new Error('Mô hình tải về không hợp lệ.');
  await writeFile(target, data);
  console.log(`Đã tải mô hình: ${data.length} bytes.`);
}
console.log(`WASM và mô hình sẵn sàng tại ${fileURLToPath(new URL('public/', root))}`);
