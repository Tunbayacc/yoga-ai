import { HOLD_TARGET_SECONDS } from '../services/practiceTracker.js';

export const trackingLabels = {
  waiting: 'Chờ hình ảnh mới', searching: 'Đang tìm cơ thể', confirming: 'Đang xác nhận',
  limited: 'Cần thấy rõ các khớp', adjusting: 'Đang theo dõi · Cần chỉnh', holding: 'Đang giữ tư thế', complete: 'Đã đạt mục tiêu giữ',
};
export default function LiveProgress({ live, loading }) {
  const stage = loading ? 'loading' : live.stage;
  const label = loading ? 'Đang khởi động nhận diện' : trackingLabels[stage];
  return <div className={`live-progress live-${stage}`}>
    <div className="live-heading"><span className="tracking-orb" aria-hidden="true"/><strong role="status">{label}</strong><span className="live-tag">LIVE</span></div>
    <div className="live-metrics"><div className="live-score"><span className="metric-label">Tiêu chí đạt</span><div><strong>{live.score === null || loading ? '—' : live.score}<span>{live.score === null || loading ? '' : '/100'}</span></strong><small>{live.score === null || loading ? 'Chờ đủ dữ liệu để chấm' : `${live.passed}/${live.total} tiêu chí`}</small></div>
      <div className="live-bar" role="progressbar" aria-label="Điểm tiêu chí tư thế" aria-valuemin={0} aria-valuemax={100} aria-valuenow={live.score ?? undefined} aria-valuetext={live.score === null ? 'Không đủ dữ liệu' : `${live.score} trên 100`}><span style={{ width: `${live.score ?? 0}%` }}/></div></div>
      <div className="live-hold"><span className="metric-label">Giữ liên tục</span><div><strong>{live.holdSeconds.toFixed(1)}<span> / {HOLD_TARGET_SECONDS}s</span></strong><small>{stage === 'complete' ? '✓ Hoàn thành' : stage === 'holding' ? 'Thở đều, giữ thoải mái' : 'Bắt đầu khi mọi tiêu chí đạt'}</small></div>
      <div className="live-bar" role="progressbar" aria-label="Tiến trình giữ tư thế" aria-valuemin={0} aria-valuemax={HOLD_TARGET_SECONDS} aria-valuenow={live.holdSeconds} aria-valuetext={`${live.holdSeconds.toFixed(1)} trên ${HOLD_TARGET_SECONDS} giây`}><span style={{ width: `${live.progress}%` }}/></div></div>
    </div>
    <div className="tracking-quality"><span>Khớp cần kiểm tra nhìn rõ</span><div className="quality-dots" aria-hidden="true">{Array.from({ length: live.required || 12 }, (_, i) => <i key={i} className={i < live.visible ? 'visible' : ''}/>)}</div><strong>{live.required && !loading ? `${live.visible}/${live.required}` : '—'}</strong></div>
    <p className="live-explanation">Điểm = tỷ lệ tiêu chí đạt, không phải độ chính xác AI. Mốc {HOLD_TARGET_SECONDS}s là mục tiêu giao diện; chỉ giữ khi thoải mái. Cần chỉnh hoặc mất dữ liệu sẽ bắt đầu lại.</p>
  </div>;
}
