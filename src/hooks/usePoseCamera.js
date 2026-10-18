import { useCallback, useEffect, useRef, useState } from 'react';
import { PoseDetector, drawSkeleton } from '../services/poseDetector.js';
import { evaluatePose } from '../services/poseEvaluator.js';
import { FeedbackEngine } from '../services/feedbackEngine.js';
import { PracticeTracker, emptyPractice } from '../services/practiceTracker.js';
import { cameraConstraints, isMobileCameraDevice } from '../services/cameraSettings.js';

const initial = { phase: 'idle', error: '', feedback: null, detected: false, delegate: null, live: emptyPractice() };
export function cameraError(error) {
  const messages = { NotAllowedError: 'Bạn chưa cho phép truy cập camera. Hãy cấp quyền camera trong trình duyệt rồi thử lại.',
    NotFoundError: 'Không tìm thấy webcam. Hãy kết nối camera rồi thử lại.', NotReadableError: 'Camera đang được ứng dụng khác sử dụng hoặc không thể mở.',
    OverconstrainedError: 'Camera không hỗ trợ cấu hình hình ảnh được yêu cầu.', SecurityError: 'Trình duyệt đã chặn camera. Hãy mở bằng localhost hoặc HTTPS.' };
  return messages[error.name] ?? 'Không thể khởi động camera hoặc AI. Kiểm tra tài nguyên mô hình (npm run setup:assets), tải lại trang và thử lại.';
}
export function usePoseCamera(poseId, options) {
  const videoRef = useRef(null), canvasRef = useRef(null), session = useRef(null);
  const config = useRef({ poseId, options });
  const feedbackEngine = useRef(new FeedbackEngine());
  const practiceTracker = useRef(new PracticeTracker());
  const [state, setState] = useState(initial);
  const [mobile] = useState(() => isMobileCameraDevice());
  const [facing, setFacing] = useState('user');
  const facingRef = useRef('user');
  useEffect(() => {
    config.current = { poseId, options }; feedbackEngine.current.reset(); practiceTracker.current.reset();
    if (canvasRef.current) canvasRef.current.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setState(s => ({ ...s, feedback: null, detected: false, live: emptyPractice() }));
  }, [poseId, options.frontSide, options.standingSide]);
  const dispose = useCallback(() => {
    const current = session.current;
    session.current = null;
    if (current) { cancelAnimationFrame(current.frame); current.stream?.getTracks().forEach(t => t.stop()); current.detector.close(); }
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.srcObject = null; }
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    feedbackEngine.current.reset();
    practiceTracker.current.reset();
  }, []);
  const stop = useCallback(() => { dispose(); setState(initial); }, [dispose]);
  const start = useCallback(async (requestedFacing) => {
    if (session.current) return;
    if (!navigator.mediaDevices?.getUserMedia) { setState({ ...initial, phase: 'error', error: 'Camera cần trình duyệt hỗ trợ webcam và địa chỉ localhost hoặc HTTPS.' }); return; }
    const current = { detector: new PoseDetector(), stream: null, frame: 0 };
    session.current = current; setState({ ...initial, phase: 'loading' });
    try {
      const selectedFacing = mobile && typeof requestedFacing === 'string' ? requestedFacing : facingRef.current;
      const stream = await navigator.mediaDevices.getUserMedia(cameraConstraints(selectedFacing, mobile));
      if (session.current !== current) { stream.getTracks().forEach(t => t.stop()); return; }
      current.stream = stream;
      const actualFacing = stream.getVideoTracks()[0]?.getSettings?.().facingMode ?? selectedFacing;
      facingRef.current = actualFacing === 'environment' ? 'environment' : 'user';
      setFacing(facingRef.current);
      for (const track of stream.getVideoTracks()) track.addEventListener('ended', () => {
        if (session.current === current) { dispose(); setState({ ...initial, phase: 'error', error: 'Camera đã ngắt kết nối. Hãy kết nối lại và bật camera.' }); }
      }, { once: true });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      await current.detector.initialize();
      if (session.current !== current) return;
      setState({ ...initial, phase: 'running', delegate: current.detector.delegate });
      let lastInference = 0, lastVideo = -1, lastState = 0;
      function loop(time) {
        if (session.current !== current) return;
        const video = videoRef.current;
        try {
          if (video.readyState >= 2 && video.videoWidth && time - lastInference >= 80 && video.currentTime !== lastVideo) {
            lastInference = time; lastVideo = video.currentTime;
            const result = current.detector.detect(video, time);
            const landmarks = result?.landmarks?.[0];
            const { poseId: selected, options: settings } = config.current;
            const evaluation = evaluatePose(landmarks, selected, { ...settings, width: video.videoWidth, height: video.videoHeight });
            const feedback = feedbackEngine.current.update(evaluation);
            const live = practiceTracker.current.update({ feedback, rawFeedback: evaluation, landmarks, detected: !!landmarks, timestamp: time, suspended: document.hidden });
            drawSkeleton(canvasRef.current, video, landmarks, feedback.criteria);
            if (time - lastState >= 200) {
              lastState = time; setState({ phase: 'running', error: '', feedback, detected: !!landmarks, delegate: current.detector.delegate, live });
            }
          } else if (time - lastInference > 600 && time - lastState >= 200) {
            practiceTracker.current.reset(); feedbackEngine.current.reset();
            lastState = time;
            canvasRef.current.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            setState({ ...initial, phase: 'running', delegate: current.detector.delegate, live: { ...emptyPractice(), stage: 'waiting' } });
          }
          current.frame = requestAnimationFrame(loop);
        } catch {
          dispose(); setState({ ...initial, phase: 'error', error: 'Quá trình nhận diện gặp lỗi. Hãy bật lại camera; nếu lỗi lặp lại, thử Chrome hoặc Edge mới nhất.' });
        }
      }
      current.frame = requestAnimationFrame(loop);
    } catch (error) {
      if (session.current !== current) return;
      dispose(); setState({ ...initial, phase: 'error', error: mobile && ['OverconstrainedError', 'NotFoundError'].includes(error.name)
        ? 'Không mở được camera đã chọn. Hãy đổi camera hoặc thử bật lại.' : cameraError(error) });
    }
  }, [dispose, mobile]);
  const switchCamera = useCallback(() => {
    if (!mobile || state.phase === 'loading') return;
    const next = facingRef.current === 'user' ? 'environment' : 'user';
    const restart = state.phase === 'running';
    dispose(); setState(initial);
    facingRef.current = next; setFacing(next);
    if (restart) void start(next);
  }, [mobile, state.phase, dispose, start]);
  useEffect(() => {
    const onExit = () => { dispose(); setState(initial); };
    window.addEventListener('pagehide', onExit);
    const onVisibility = () => {
      if (document.hidden) { onExit(); return; }
      practiceTracker.current.reset();
      if (session.current) setState(s => ({ ...s, live: { ...emptyPractice(), stage: 'waiting' } }));
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { window.removeEventListener('pagehide', onExit); document.removeEventListener('visibilitychange', onVisibility); dispose(); };
  }, [dispose]);
  return { ...state, start, stop, videoRef, canvasRef, mobile, facing, switchCamera };
}
