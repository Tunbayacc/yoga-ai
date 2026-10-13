import { useCallback, useEffect, useRef, useState } from 'react';
import { VoiceReminderPlanner, vietnameseVoice, voiceFeedback, reminderStillRelevant } from '../services/voiceFeedback.js';

export function useVoiceFeedback({ phase, feedback, detected, sessionKey }) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const [enabled, setEnabled] = useState(false);
  const [voice, setVoice] = useState(null);
  const [error, setError] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  const planner = useRef(new VoiceReminderPlanner());
  const utterance = useRef(null);
  const activeReminder = useRef(null);
  const feedbackKey = useRef(null);
  const stopSpeech = useCallback(() => {
    if (utterance.current) {
      utterance.current.onend = null; utterance.current.onerror = null;
      utterance.current = null;
      activeReminder.current = null;
      window.speechSynthesis.cancel();
    }
  }, []);
  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const loadVoices = () => setVoice(vietnameseVoice(synth.getVoices()));
    loadVoices(); synth.addEventListener('voiceschanged', loadVoices);
    return () => { synth.removeEventListener('voiceschanged', loadVoices); stopSpeech(); };
  }, [supported, stopSpeech]);
  const speak = useCallback((text, reminder = null) => {
    if (!supported || !voice) return false;
    const synth = window.speechSynthesis;
    if (synth.speaking || synth.pending || utterance.current) return false;
    const current = new SpeechSynthesisUtterance(text);
    current.lang = 'vi-VN'; current.voice = voice; current.rate = 0.95; current.volume = 1;
    current.onend = () => { if (utterance.current === current) { utterance.current = null; activeReminder.current = null; } };
    current.onerror = event => {
      if (utterance.current !== current) return;
      utterance.current = null;
      activeReminder.current = null;
      if (!['canceled', 'interrupted'].includes(event.error)) {
        setError('Không phát được lời nhắc. Kiểm tra âm lượng và giọng tiếng Việt của trình duyệt, rồi bật lại.');
        setEnabled(false);
      }
    };
    utterance.current = current;
    activeReminder.current = reminder;
    try { synth.speak(current); setLastMessage(text); return true; }
    catch { utterance.current = null; activeReminder.current = null; setEnabled(false); setError('Trình duyệt không phát được giọng nói. Hãy thử lại trên Chrome hoặc Edge.'); return false; }
  }, [supported, voice]);
  const toggle = useCallback(() => {
    stopSpeech(); planner.current.reset(); setLastMessage(''); setError('');
    if (enabled) { setEnabled(false); return; }
    if (!supported) { setError('Trình duyệt này chưa hỗ trợ nhắc bằng giọng nói.'); return; }
    if (!voice) { setError('Chưa có giọng tiếng Việt. Hãy chọn trình duyệt có giọng tiếng Việt hoặc cài giọng tiếng Việt trong thiết bị, rồi thử lại.'); return; }
    feedbackKey.current = voiceFeedback(feedback, detected)?.key ?? 'pending';
    setEnabled(true);
    // Phát trực tiếp sau cú nhấn để đáp ứng chính sách tương tác của trình duyệt.
    speak('Đã bật nhắc bằng giọng nói. Tôi sẽ nhắc bạn khi cần điều chỉnh tư thế.');
  }, [enabled, supported, voice, feedback, detected, speak, stopSpeech]);
  useEffect(() => {
    stopSpeech(); planner.current.reset(); feedbackKey.current = null; setLastMessage('');
  }, [sessionKey, phase, stopSpeech]);
  useEffect(() => {
    if (!enabled || phase !== 'running' || !voice || document.hidden) return;
    // Đọc hết hướng dẫn còn phù hợp dù một khớp khác thay đổi; hủy ngay khi lỗi đã hết.
    const nextKey = voiceFeedback(feedback, detected)?.key ?? 'pending';
    if (feedbackKey.current !== nextKey) {
      if (!reminderStillRelevant(activeReminder.current, feedback, detected)) stopSpeech();
      feedbackKey.current = nextKey;
    }
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) return;
    const message = planner.current.next(feedback, detected, performance.now());
    if (message) speak(message, planner.current.lastReminder);
  }, [enabled, phase, feedback, detected, voice, speak, stopSpeech]);
  useEffect(() => {
    const suspend = () => { stopSpeech(); planner.current.reset(); setLastMessage(''); };
    window.addEventListener('pagehide', suspend);
    document.addEventListener('visibilitychange', suspend);
    return () => { window.removeEventListener('pagehide', suspend); document.removeEventListener('visibilitychange', suspend); stopSpeech(); };
  }, [stopSpeech]);
  return { enabled, supported, voice, error, lastMessage, toggle };
}
