import { voiceClips } from '../data/voiceClips.js';

export function coachingClip(pose, id, { side, direction, raisedSide, armPosition }) {
  if (id === 'torso') return 'torso';
  if (id === 'shoulders') return `shoulders-${raisedSide}`;
  if (id === 'hips') return `hips-${pose}`;
  if (pose === 'mountain') return `mountain-${side}-${id.replace(/^(left|right)/, '').toLowerCase()}`;
  if (pose === 'warrior') {
    if (id === 'frontKnee') return `warrior-${side}-front-knee-${direction}`;
    if (id.endsWith('Arm')) return `warrior-${side}-arm-${armPosition}`;
    return `warrior-${side}-${id.replace(/^(left|right)/, '')}`;
  }
  if (pose === 'tree') {
    if (id === 'standingKnee') return `tree-${side}-standing-knee`;
    if (id === 'footPosition') return `tree-${side}-foot-position`;
    return `tree-${side}-${id}-${direction}`;
  }
  return null;
}

export function recordedReminder(reminder, feedback) {
  if (!reminder) return null;
  const id = reminder.criterionId
    ? feedback?.criteria?.find(c => c.id === reminder.criterionId)?.audioId
    : reminder.key === 'pass' ? `pass-${feedback?.poseId}`
      : reminder.key === 'unknown:camera-angle' ? 'camera-angle'
        : reminder.key.startsWith('unknown:') ? 'missing-joints' : reminder.key;
  return voiceClips[id] ? { id, text: voiceClips[id], src: `/audio/vi/${id}.mp3` } : null;
}
