import { useCallback, useEffect, useRef, useState } from 'react';

export function useFullscreen() {
  const targetRef = useRef(null);
  const pending = useRef(false);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const supported = typeof document !== 'undefined' && document.fullscreenEnabled !== false &&
    typeof Element.prototype.requestFullscreen === 'function';
  useEffect(() => {
    const target = targetRef.current;
    const sync = () => setActive(document.fullscreenElement === targetRef.current);
    const onEscape = event => {
      if (event.key === 'Escape' && document.fullscreenElement === targetRef.current) document.exitFullscreen().catch(() => {});
    };
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('keydown', onEscape);
      if (target && document.fullscreenElement === target) document.exitFullscreen().catch(() => {});
    };
  }, []);
  const toggle = useCallback(async () => {
    if (pending.current) return;
    setError('');
    if (!supported || !targetRef.current) {
      setError('Trình duyệt này không hỗ trợ toàn màn hình cho khung camera. Hãy mở trang trong Chrome hoặc Edge.'); return;
    }
    pending.current = true; setBusy(true);
    try {
      if (document.fullscreenElement === targetRef.current) await document.exitFullscreen();
      else await targetRef.current.requestFullscreen();
      setActive(document.fullscreenElement === targetRef.current);
    } catch {
      setError('Không thể mở toàn màn hình trong cửa sổ này. Hãy mở trang trong Chrome hoặc Edge rồi thử lại.');
    } finally { pending.current = false; setBusy(false); }
  }, [supported]);
  return { targetRef, active, busy, supported, error, toggle };
}
