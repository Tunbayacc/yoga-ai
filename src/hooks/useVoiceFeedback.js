import { useCallback, useEffect, useRef, useState } from 'react';
import { VoiceReminderPlanner, voiceFeedback, reminderStillRelevant } from '../services/voiceFeedback.js';
import { recordedReminder } from '../services/recordedVoice.js';

export function useVoiceFeedback({ phase, feedback, detected, sessionKey }) {
  const supported = typeof window !== 'undefined' && 'Audio' in window;
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  const planner = useRef(new VoiceReminderPlanner());
  const player = useRef(null);
  const active = useRef(null);
  const feedbackKey = useRef(null);
  const stopSpeech = useCallback(() => {
    if (player.current) {
      player.current.pause();
      player.current.onended = null;
      player.current.onerror = null;
      player.current.removeAttribute('src');
      player.current.load();
    }
    active.current = null;
  }, []);
  const speak = useCallback((clip, reminder = null) => {
    if (!supported || !clip || active.current) return;
    // Reuse the element unlocked by the user's tap on mobile browsers.
    const audio = player.current ?? (player.current = new Audio());
    const token = { reminder };
    active.current = token;
    audio.src = clip.src;
    audio.onended = () => { if (active.current === token) active.current = null; };
    const failed = () => {
      if (active.current !== token) return;
      stopSpeech();
      setEnabled(false);
      setError('Không phát được bản thu. Kiểm tra mạng và âm lượng, rồi bấm Bật giọng nói để thử lại.');
    };
    audio.onerror = failed;
    try {
      const playback = audio.play();
      playback?.catch(failed);
      setLastMessage(clip.text);
    } catch { failed(); }
  }, [supported, stopSpeech]);
  const toggle = useCallback(() => {
    stopSpeech(); planner.current.reset(); setLastMessage(''); setError('');
    if (enabled) { setEnabled(false); return; }
    if (!supported) { setError('Trình duyệt này chưa hỗ trợ phát âm thanh.'); return; }
    feedbackKey.current = voiceFeedback(feedback, detected)?.key ?? 'pending';
    setEnabled(true);
    speak(recordedReminder({ key: 'voice-enabled' }));
  }, [enabled, supported, feedback, detected, speak, stopSpeech]);
  useEffect(() => {
    stopSpeech(); planner.current.reset(); feedbackKey.current = null; setLastMessage('');
  }, [sessionKey, phase, stopSpeech]);
  useEffect(() => {
    if (!enabled || phase !== 'running' || document.hidden) return;
    const nextKey = voiceFeedback(feedback, detected)?.key ?? 'pending';
    if (feedbackKey.current !== nextKey) {
      if (!reminderStillRelevant(active.current?.reminder, feedback, detected)) stopSpeech();
      feedbackKey.current = nextKey;
    }
    if (active.current) return;
    const message = planner.current.next(feedback, detected, performance.now());
    if (message) speak(recordedReminder(planner.current.lastReminder, feedback), planner.current.lastReminder);
  }, [enabled, phase, feedback, detected, speak, stopSpeech]);
  useEffect(() => {
    const suspend = () => {
      if (!document.hidden) return;
      stopSpeech(); planner.current.reset(); setLastMessage('');
    };
    const hide = () => { stopSpeech(); planner.current.reset(); setLastMessage(''); };
    window.addEventListener('pagehide', hide);
    document.addEventListener('visibilitychange', suspend);
    return () => {
      window.removeEventListener('pagehide', hide);
      document.removeEventListener('visibilitychange', suspend);
      stopSpeech();
    };
  }, [stopSpeech]);
  return { enabled, supported, error, lastMessage, toggle };
}
