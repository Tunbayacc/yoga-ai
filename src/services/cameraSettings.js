export function isMobileCameraDevice(nav = navigator) {
  return nav.userAgentData?.mobile === true || /Android|iPhone|iPad|iPod/i.test(nav.userAgent ?? '') ||
    (/Macintosh/i.test(nav.userAgent ?? '') && nav.maxTouchPoints > 1);
}

export function cameraConstraints(facing, mobile) {
  return { audio: false, video: { width: { ideal: 1280 }, height: { ideal: 720 },
    facingMode: mobile ? { exact: facing } : 'user' } };
}
