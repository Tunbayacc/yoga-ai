import { useCallback, useEffect, useRef, useState } from 'react';

export function useFullscreen() {
  const targetRef = useRef(null);
  const pending = useRef(false);
  const alive = useRef(true);
  const [nativeActive, setNativeActive] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const nativeSupported = typeof document !== 'undefined' && document.fullscreenEnabled !== false &&
    typeof Element.prototype.requestFullscreen === 'function';
  const active = nativeActive || expanded;
  useEffect(() => {
    alive.current = true;
    const target = targetRef.current;
    const sync = () => setNativeActive(document.fullscreenElement === targetRef.current);
    const onEscape = event => {
      if (event.key !== 'Escape') return;
      setExpanded(false);
      if (document.fullscreenElement === targetRef.current) document.exitFullscreen().catch(() => {});
    };
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('keydown', onEscape);
    return () => {
      alive.current = false;
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('keydown', onEscape);
      if (target && document.fullscreenElement === target) document.exitFullscreen().catch(() => {});
    };
  }, []);
  useEffect(() => {
    if (!active) return;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    targetRef.current?.querySelector('.fullscreen-exit')?.focus();
    return () => { document.body.style.overflow = overflow; previousFocus?.focus?.({ preventScroll: true }); };
  }, [active]);
  const toggle = useCallback(async () => {
    if (pending.current || !targetRef.current) return;
    setError('');
    if (expanded) { setExpanded(false); return; }
    pending.current = true; setBusy(true);
    const exiting = document.fullscreenElement === targetRef.current;
    try {
      if (exiting) await document.exitFullscreen();
      else if (nativeSupported) await targetRef.current.requestFullscreen();
      else setExpanded(true);
      if (alive.current) setNativeActive(document.fullscreenElement === targetRef.current);
    } catch {
      if (alive.current) {
        if (exiting) setError('Chưa thoát được toàn màn hình. Hãy thử lại.');
        else setExpanded(true);
      }
    } finally { pending.current = false; if (alive.current) setBusy(false); }
  }, [nativeSupported, expanded]);
  return { targetRef, active, expanded, busy, nativeSupported, error, toggle };
}
