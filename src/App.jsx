import { useState } from 'react';
import { yogaPoses } from './data/yogaPoses.js';
import { usePoseCamera } from './hooks/usePoseCamera.js';
import PoseIllustration from './components/PoseIllustration.jsx';
import { useVoiceFeedback } from './hooks/useVoiceFeedback.js';
import { voiceFeedback } from './services/voiceFeedback.js';
import LiveProgress, { trackingLabels } from './components/LiveProgress.jsx';
import { HOLD_TARGET_SECONDS } from './services/practiceTracker.js';
import { useFullscreen } from './hooks/useFullscreen.js';

const statusLabels = { pass: 'Đạt tham chiếu', fail: 'Cần điều chỉnh', unknown: 'Không đủ dữ liệu', pending: 'Đang xác nhận' };
export default function App() {
  const [poseId, setPoseId] = useState('mountain');
  const [frontSide, setFrontSide] = useState('left');
  const [standingSide, setStandingSide] = useState('left');
  const [showSkeleton, setShowSkeleton] = useState(true);
  const pose = yogaPoses.find(p => p.id === poseId);
  const fullscreen = useFullscreen();
  const camera = usePoseCamera(poseId, { frontSide, standingSide });
  const audio = useVoiceFeedback({ phase: camera.phase, feedback: camera.feedback, detected: camera.detected, sessionKey: `${poseId}:${frontSide}:${standingSide}:${camera.facing}` });
  const running = camera.phase === 'running', loading = camera.phase === 'loading';
  const criteria = camera.feedback?.criteria ?? [];
  const passed = criteria.filter(c => c.status === 'pass').length;
  const spokenGuidance = voiceFeedback(camera.feedback, camera.detected)?.text;
  const status = loading ? 'Đang mở camera và tải AI…' : running ? (camera.live.stage === 'waiting' ? 'Chờ hình ảnh mới từ camera' : camera.detected ? statusLabels[camera.feedback?.status ?? 'pending'] : 'Chưa tìm thấy người') : 'Camera đang tắt';
  return <div className="app-shell">
    <header className="header"><a className="brand" href="#"><span className="brand-icon">✳</span> Yoga<span>AI</span></a><span className="header-label">KHÔNG GIAN LUYỆN TẬP</span><span className="privacy"><span className="dot"/> Xử lý trên thiết bị</span></header>
    <main>
      <div className="intro"><div><p className="eyebrow">CHUYỂN ĐỘNG CÓ Ý THỨC</p><h1>Vững tư thế. <span>An tâm luyện tập.</span></h1><p>Quan sát cơ thể và điều chỉnh từng chút một với phản hồi AI trực tiếp.</p></div><div className="session-tag">3 tư thế <span>·</span> MediaPipe Pose</div></div>
      <section className="pose-picker" aria-label="Chọn tư thế">{yogaPoses.map(item => <button key={item.id} className={`pose-card ${poseId === item.id ? 'selected' : ''}`} onClick={() => setPoseId(item.id)} aria-pressed={poseId === item.id}><div className="pose-art"><PoseIllustration pose={item.id}/></div><div><span className="pose-number">{item.number} / {item.sanskrit}</span><h2>{item.name}</h2><p>{item.vietnamese}</p></div><span className="selection">{poseId === item.id ? '✓' : '↗'}</span></button>)}</section>
      <div className="practice-grid"><section className="camera-panel" aria-label="Camera luyện tập"><div className="panel-top"><h2>Góc luyện tập của bạn</h2><span className={`status-pill ${running ? 'active' : ''}`}><span className="dot"/>{loading ? 'Đang khởi động' : running ? 'Trực tiếp' : 'Chưa kết nối'}</span></div>
        <div ref={fullscreen.targetRef} className={`camera-stage ${running || loading ? 'has-camera' : ''} ${camera.facing === 'environment' ? 'rear-camera' : ''} ${running ? `tracking-${camera.live.stage}` : ''}`}><video ref={camera.videoRef} muted playsInline autoPlay aria-label="Hình ảnh webcam"/><canvas ref={camera.canvasRef} hidden={!showSkeleton} aria-label="Bộ xương và các khớp cần điều chỉnh"/>
          {!running && <div className="camera-placeholder"><div className="camera-symbol">◎</div><h3>{loading ? 'Đang chuẩn bị không gian…' : 'Sẵn sàng khi bạn sẵn sàng'}</h3><p>{loading ? 'Cho phép camera trong trình duyệt. Lần khởi tạo AI có thể mất vài giây.' : 'Bật camera để nhận diện cơ thể và nhận hướng dẫn điều chỉnh tư thế.'}</p>{!loading && <button className="primary" onClick={camera.start}>Bật camera <span>↗</span></button>}</div>}
          <div className="camera-corner top-left"/><div className="camera-corner bottom-right"/>{running && <span className="overlay-label">{camera.detected ? '33 điểm mốc · ' + camera.delegate : 'Đưa toàn bộ cơ thể vào khung hình'}</span>}
          {running && <div className={`tracking-overlay live-${camera.live.stage}`}><span className="tracking-orb" aria-hidden="true"/>{trackingLabels[camera.live.stage]}{camera.live.stage === 'holding' && <strong>{camera.live.holdSeconds.toFixed(1)}s</strong>}{camera.live.stage === 'complete' && <strong>✓ {HOLD_TARGET_SECONDS}s</strong>}</div>}
          <div className="fullscreen-controls">
            <button className="fullscreen-button" onClick={() => setShowSkeleton(value => !value)} aria-pressed={showSkeleton}>{showSkeleton ? 'Tắt khung xương' : 'Bật khung xương'}</button>
            {camera.mobile && <button className="fullscreen-button" onClick={camera.switchCamera} disabled={loading} aria-label={camera.facing === 'user' ? 'Chuyển sang camera sau' : 'Chuyển sang camera trước'}>↻ {camera.facing === 'user' ? 'Camera sau' : 'Camera trước'}</button>}
            {fullscreen.active && (running || loading) && <button onClick={camera.stop} className="fullscreen-button">Tắt camera</button>}
            <button onClick={fullscreen.toggle} className="fullscreen-button" aria-pressed={fullscreen.active} disabled={fullscreen.busy || !fullscreen.supported} title={fullscreen.supported ? 'Nhấn Esc để thoát toàn màn hình' : 'Toàn màn hình không được hỗ trợ trong cửa sổ này; hãy mở bằng Chrome hoặc Edge.'}><span aria-hidden="true">{fullscreen.active ? '↙' : '⛶'}</span>{fullscreen.active ? 'Thoát toàn màn hình' : 'Toàn màn hình'}</button>
          </div>
          {fullscreen.active && <span className="fullscreen-hint">Esc để thoát</span>}
        </div>
        {fullscreen.error && <div className="error" role="alert">{fullscreen.error}</div>}
        {!fullscreen.supported && <p className="fullscreen-unavailable">Toàn màn hình chưa được hỗ trợ trong cửa sổ này. Bạn có thể mở trang bằng Chrome hoặc Edge.</p>}
        {(running || loading) && <LiveProgress live={camera.live} loading={loading}/>}
        <div className="camera-toolbar"><span className="recognition" role="status">{status}</span><button className={running || loading ? 'secondary' : 'primary'} onClick={running || loading ? camera.stop : camera.start}>{running || loading ? 'Tắt camera' : 'Bật camera'}</button></div>
        <div className="voice-controls"><div><strong>Nhắc bằng giọng nói</strong><p>{audio.enabled ? 'Nhắc từng phần cần chỉnh và xác nhận khi đạt tham chiếu.' : 'Bật để nghe hướng dẫn tiếng Việt khi luyện tập.'}</p></div><button className="secondary" onClick={audio.toggle} aria-pressed={audio.enabled} disabled={!audio.supported}>{audio.enabled ? 'Tắt giọng nói' : 'Bật giọng nói'}</button>
          {!audio.supported && <p className="voice-note">Trình duyệt này chưa hỗ trợ giọng nói.</p>}
          <p className="voice-note">Giọng tiếng Việt thu sẵn. Không cần cài giọng đọc trên điện thoại.</p>
          {audio.error && <p className="voice-error" role="alert">{audio.error}</p>}
          {audio.lastMessage && <p className="voice-message">Lời nhắc gần nhất: {audio.lastMessage}</p>}
        </div>
        {camera.error && <div className="error" role="alert">{camera.error}</div>}
        <div className="camera-tips"><span>↔ Giữ toàn thân trong khung hình</span><span>☀ Ánh sáng đủ, camera ngang hông</span><span>◉ {camera.facing === 'user' ? 'Camera trước hiển thị như gương' : 'Camera sau không lật hình'}</span></div>
      </section>
      <aside className="feedback-panel"><div className="panel-top"><h2>Phản hồi tư thế</h2><span className="small-label">THỜI GIAN THỰC</span></div><div className="pose-summary"><p className="eyebrow">ĐANG LUYỆN TẬP</p><h2>{pose.name}</h2><p>{pose.description}</p></div>
        {poseId !== 'mountain' && <label className="side-select">{poseId === 'warrior' ? 'Chân trước' : 'Chân trụ'}<select value={poseId === 'warrior' ? frontSide : standingSide} onChange={e => poseId === 'warrior' ? setFrontSide(e.target.value) : setStandingSide(e.target.value)}><option value="left">Chân trái</option><option value="right">Chân phải</option></select><small>Trái/phải theo cơ thể của bạn.</small></label>}
        <div className="evaluation-heading"><h3>Tiêu chí & góc khớp</h3><span>{criteria.length ? `${passed}/${criteria.length} đạt` : 'Chờ dữ liệu'}</span></div>
        {!criteria.length ? <div className="empty-feedback"><span>⌁</span><p>Góc khớp và kết quả sẽ xuất hiện khi camera nhận diện được cơ thể.</p></div> : <ul className="criteria">{criteria.map(item => <li key={item.id} className={item.status}><span className="criterion-dot">{item.status === 'pass' ? '✓' : item.status === 'fail' ? '!' : '·'}</span><div><span className="criterion-name">{item.label}</span><small>{statusLabels[item.status]} · {item.range.join('–')}{item.unit}</small></div><strong>{item.value === null ? '—' : `${item.value.toFixed(item.unit === '°' ? 0 : 2)}${item.unit}`}</strong></li>)}</ul>}
        <div className="guidance"><h3>↗ Hướng dẫn điều chỉnh</h3>{!criteria.length ? <p>{pose.guide}</p> : camera.feedback.status === 'pass' ? <p>{spokenGuidance}</p> : camera.feedback.status === 'unknown' ? <p>{spokenGuidance}</p> : camera.feedback.status === 'pending' ? <p>Giữ tư thế một chút để hệ thống xác nhận phản hồi.</p> : <ul>{[...new Set(criteria.filter(c => c.status === 'fail').map(c => c.advice))].map(advice => <li key={advice}>{advice}</li>)}</ul>}</div>
      </aside></div>
      <div className="notice"><span>ⓘ</span><p>Đánh giá theo tư thế bạn chọn và các ngưỡng tham chiếu ban đầu; không tự phân loại tư thế. Góc quay và điểm bị che khuất có thể ảnh hưởng kết quả. Hãy tập trong phạm vi thoải mái và dừng nếu thấy đau.</p></div>
    </main><footer><span>Yoga AI <span className="footer-dot">·</span> Từng chuyển động, một chút cân bằng.</span><span>Không ghi hình · Không tải hình ảnh lên máy chủ</span></footer>
  </div>;
}
