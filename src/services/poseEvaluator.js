import { calculateAngle, tiltFromVertical, tiltFromHorizontal, validPoint } from './angleCalculator.js';
import { LANDMARKS as L, LANDMARK_LABELS, QUALITY, yogaPoses } from '../data/yogaPoses.js';
import { jointCoaching } from './poseCoaching.js';
import { coachingClip } from './recordedVoice.js';

const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const opposite = side => side === 'left' ? 'right' : 'left';
const sideLabel = side => side === 'left' ? 'trái' : 'phải';
export function evaluatePose(landmarks, poseId, options = {}) {
  const pose = yogaPoses.find(p => p.id === poseId);
  if (!pose) throw new Error('Tư thế không được hỗ trợ.');
  const quality = { ...QUALITY, ...options.quality };
  const thresholds = { ...pose.thresholds, ...options.thresholds };
  const width = options.width ?? 1, height = options.height ?? 1;
  const points = landmarks?.map(p => p && ({ ...p, x: p.x * width, y: p.y * height }));
  const usable = id => {
    const p = landmarks?.[id];
    return validPoint(p) && p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1 &&
      Number.isFinite(p.visibility) && p.visibility >= quality.visibility &&
      (p.presence === undefined || (Number.isFinite(p.presence) && p.presence >= quality.presence));
  };
  const core = [11, 12, 23, 24];
  let viewReason = null;
  if (core.every(usable)) {
    const shoulder = midpoint(points[11], points[12]), hip = midpoint(points[23], points[24]);
    const torsoLength = Math.hypot(shoulder.x - hip.x, shoulder.y - hip.y);
    const span = Math.abs(points[11].x - points[12].x);
    const depth = Math.abs((landmarks[11].z ?? 0) - (landmarks[12].z ?? 0)) * width;
    if (torsoLength < 1e-6 || span / torsoLength < quality.frontalRatio || depth / Math.max(span, 1e-6) > quality.shoulderDepthRatio) {
      viewReason = 'Không đủ dữ liệu: hãy hướng ngực về camera để giảm sai lệch góc quay.';
    }
  }
  const criteria = [];
  function check(id, label, ids, measure, range, advice, unit = '°') {
    const value = !viewReason && ids.every(usable) ? measure() : null;
    const available = Number.isFinite(value);
    const direction = !available ? null : value < range[0] ? 'below' : value > range[1] ? 'above' : 'within';
    criteria.push({ id, label, value: available ? value : null, range, unit, joints: ids,
      direction,
      status: available ? (value >= range[0] && value <= range[1] ? 'pass' : 'fail') : 'unknown',
      advice: available ? (typeof advice === 'function' ? advice(direction) : advice) : (viewReason ?? 'Không đủ dữ liệu: đưa các khớp vào khung hình và tăng ánh sáng.') });
  }
  const angle = (id, label, ids, range, advice) => check(id, label, ids, () => calculateAngle(...ids.map(i => points[i])), range, advice);
  const torso = () => check('torso', 'Độ nghiêng thân', core, () => tiltFromVertical(midpoint(points[11], points[12]), midpoint(points[23], points[24])), thresholds.torso, 'Giữ thân người thẳng, tránh nghiêng sang bên.');
  const level = (id, label, ids, range, advice) => check(id, label, ids, () => tiltFromHorizontal(...ids.map(i => points[i])), range, advice);
  if (poseId === 'mountain') {
    for (const side of ['left', 'right']) {
      const hip = L[`${side}Hip`], knee = L[`${side}Knee`], ankle = L[`${side}Ankle`], shoulder = L[`${side}Shoulder`];
      angle(`${side}Knee`, `Gối ${sideLabel(side)}`, [hip, knee, ankle], thresholds.knee, `Duỗi nhẹ chân ${sideLabel(side)}, không khóa cứng đầu gối.`);
      angle(`${side}Hip`, `Hông ${sideLabel(side)}`, [shoulder, hip, knee], thresholds.hip, 'Đưa vai, hông và đầu gối về cùng một trục.');
      check(`${side}Leg`, `Trục chân ${sideLabel(side)}`, [hip, ankle], () => tiltFromVertical(points[hip], points[ankle]), thresholds.legTilt, 'Điều chỉnh cổ chân dưới hông, phân bố lực đều.');
    }
    level('shoulders', 'Độ lệch vai', [11, 12], thresholds.shoulderLevel, 'Thả lỏng và cân bằng hai vai.');
    level('hips', 'Độ lệch hông', [23, 24], thresholds.hipLevel, 'Giữ hai bên hông cân bằng.');
    torso();
  } else if (poseId === 'warrior') {
    const front = options.frontSide === 'right' ? 'right' : 'left', back = opposite(front);
    angle('frontKnee', `Gối trước (${sideLabel(front)})`, [L[`${front}Hip`], L[`${front}Knee`], L[`${front}Ankle`]], thresholds.frontKnee, 'Điều chỉnh gối chân trước gần góc vuông trong phạm vi thoải mái.');
    angle('backKnee', `Gối sau (${sideLabel(back)})`, [L[`${back}Hip`], L[`${back}Knee`], L[`${back}Ankle`]], thresholds.backKnee, 'Duỗi nhẹ chân sau, giữ bàn chân vững.');
    for (const side of ['left', 'right']) {
      const ids = [L[`${side}Shoulder`], L[`${side}Elbow`], L[`${side}Wrist`]];
      angle(`${side}Elbow`, `Khuỷu ${sideLabel(side)}`, ids, thresholds.elbow, `Duỗi cánh tay ${sideLabel(side)} nhẹ nhàng.`);
      level(`${side}Arm`, `Tay ${sideLabel(side)} so với ngang`, [ids[0], ids[2]], thresholds.armLevel, 'Đưa hai cánh tay ngang tầm vai.');
      check(`${side}Outward`, `Hướng tay ${sideLabel(side)}`, [...new Set([...ids, 11, 12, 23, 24])], () => {
        const center = midpoint(points[11], points[12]);
        return (points[ids[0]].x - center.x) * (points[ids[2]].x - points[ids[0]].x) > 0 ? 1 : 0;
      }, [1, 1], 'Mở hai cánh tay ra hai phía của thân người.', '');
    }
    torso();
  } else {
    const standing = options.standingSide === 'right' ? 'right' : 'left', bent = opposite(standing);
    const sh = L[`${standing}Hip`], sk = L[`${standing}Knee`], sa = L[`${standing}Ankle`];
    const bh = L[`${bent}Hip`], bk = L[`${bent}Knee`], ba = L[`${bent}Ankle`];
    angle('standingKnee', `Gối trụ (${sideLabel(standing)})`, [sh, sk, sa], thresholds.standingKnee, 'Giữ chân trụ thẳng nhẹ nhàng.');
    angle('bentKnee', `Gối gập (${sideLabel(bent)})`, [bh, bk, ba], thresholds.bentKnee, 'Gập và mở chân còn lại sang bên trong phạm vi thoải mái.');
    const legLength = () => Math.hypot(points[sh].x - points[sa].x, points[sh].y - points[sa].y);
    check('footPosition', 'Bàn chân gần chân trụ', [sh, sa, ba], () => {
      const a = points[sh], b = points[sa], p = points[ba], length = legLength();
      if (length < 1e-6) return null;
      const t = Math.max(0, Math.min(1, ((p.x-a.x)*(b.x-a.x)+(p.y-a.y)*(b.y-a.y))/(length*length)));
      return Math.hypot(p.x-a.x-t*(b.x-a.x), p.y-a.y-t*(b.y-a.y))/length;
    }, thresholds.footDistance, 'Đặt bàn chân gần mặt trong bắp chân hoặc đùi chân trụ.', '');
    check('footHeight', 'Độ nâng bàn chân / chân trụ', [sh, sa, ba], () => legLength() > 1e-6 ? (points[sa].y-points[ba].y)/legLength() : null, thresholds.footHeight, 'Nâng bàn chân lên bắp chân hoặc đùi, tránh tì lên đầu gối.', '');
    check('kneeOpening', 'Độ mở gối / chiều rộng hông', [sh, bh, bk], () => {
      const span = Math.abs(points[sh].x-points[bh].x);
      return span > 1e-6 ? Math.abs(points[bk].x-points[bh].x)/span : null;
    }, thresholds.kneeOpening, 'Mở gối chân gập sang bên, tránh xoay thân.', '');
    level('hips', 'Độ lệch hông', [23, 24], thresholds.hipLevel, 'Giữ hông cân bằng trên chân trụ.');
    torso();
  }
  // Cùng nội dung hướng dẫn cho phần chữ và giọng nói, chỉ dùng các điểm đã đủ tin cậy.
  for (const criterion of criteria) {
    if (criterion.status !== 'fail') continue;
    let side = criterion.id.startsWith('left') ? 'left' : criterion.id.startsWith('right') ? 'right' : null;
    let role;
    if (poseId === 'warrior') {
      const front = options.frontSide === 'right' ? 'right' : 'left';
      if (criterion.id === 'frontKnee') side = front;
      if (criterion.id === 'backKnee') side = opposite(front);
    } else if (poseId === 'tree') {
      const standing = options.standingSide === 'right' ? 'right' : 'left';
      role = standing;
      side = criterion.id === 'standingKnee' ? standing : opposite(standing);
    }
    const raisedSide = criterion.id === 'shoulders' && points[11].y < points[12].y ? 'left' : 'right';
    const armPosition = side && criterion.id.endsWith('Arm') && points[L[`${side}Wrist`]].y < points[L[`${side}Shoulder`]].y ? 'above' : 'below';
    criterion.advice = jointCoaching(poseId, criterion.id, { side, role, direction: criterion.direction, raisedSide, armPosition });
    criterion.detailedCoaching = true;
    criterion.audioId = coachingClip(poseId, criterion.id, { side, direction: criterion.direction, raisedSide, armPosition });
  }
  const unknown = criteria.some(c => c.status === 'unknown');
  return { poseId, criteria, status: unknown ? 'unknown' : criteria.every(c => c.status === 'pass') ? 'pass' : 'fail',
    missingParts: [...new Set(criteria.flatMap(c => c.joints).filter(id => !usable(id)))].map(id => LANDMARK_LABELS[id]).filter(Boolean),
    message: viewReason ?? (unknown ? 'Không đủ dữ liệu' : 'Đang đánh giá tư thế đã chọn') };
}
