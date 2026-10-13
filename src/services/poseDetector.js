import { FilesetResolver, PoseLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';

export class PoseDetector {
  constructor() { this.task = null; this.closed = false; this.delegate = null; }
  async initialize() {
    const vision = await FilesetResolver.forVisionTasks(`${import.meta.env.BASE_URL}wasm`);
    if (this.closed) return;
    const options = { runningMode: 'VIDEO', numPoses: 1, minPoseDetectionConfidence: 0.6,
      minPosePresenceConfidence: 0.6, minTrackingConfidence: 0.6, outputSegmentationMasks: false };
    let task;
    try {
      task = await PoseLandmarker.createFromOptions(vision, { ...options, baseOptions: { modelAssetPath: `${import.meta.env.BASE_URL}models/pose_landmarker_lite.task`, delegate: 'GPU' } });
      this.delegate = 'GPU';
    } catch {
      if (this.closed) return;
      task = await PoseLandmarker.createFromOptions(vision, { ...options, baseOptions: { modelAssetPath: `${import.meta.env.BASE_URL}models/pose_landmarker_lite.task`, delegate: 'CPU' } });
      this.delegate = 'CPU';
    }
    if (this.closed) task.close(); else this.task = task;
  }
  detect(video, timestamp) { return this.task?.detectForVideo(video, timestamp); }
  close() { this.closed = true; this.task?.close(); this.task = null; }
}

export function drawSkeleton(canvas, video, landmarks, criteria = []) {
  const context = canvas.getContext('2d');
  if (!context) return;
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
  }
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!landmarks) return;
  const visible = p => p && (p.visibility ?? 0) >= 0.65 && (p.presence ?? 1) >= 0.65;
  const drawing = new DrawingUtils(context);
  const connections = PoseLandmarker.POSE_CONNECTIONS.filter(c => visible(landmarks[c.start]) && visible(landmarks[c.end]));
  drawing.drawConnectors(landmarks, connections, { color: '#7ce5ba', lineWidth: 3 });
  const failed = new Set(criteria.filter(c => c.status === 'fail').flatMap(c => c.joints));
  landmarks.forEach((p, index) => {
    if (!visible(p)) return;
    context.beginPath(); context.arc(p.x * canvas.width, p.y * canvas.height, index < 11 ? 2 : 5, 0, 2 * Math.PI);
    context.fillStyle = failed.has(index) ? '#ffb275' : '#e8fff3'; context.fill();
  });
}
