// QA độc lập: stub SpeechSynthesis kiểm tra luồng lời nhắc, không xác nhận loa thật.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(`${process.argv[2]}/package.json`);
const { chromium } = require('playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript(() => {
    window.qaSpoken = []; window.qaCancel = 0;
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      speaking: false, pending: false,
      getVoices: () => [{ lang: 'vi-VN', name: 'QA Vietnamese', localService: true }],
      addEventListener() {}, removeEventListener() {},
      speak(u) { window.qaSpoken.push({ text: u.text, lang: u.lang }); this.speaking = true; window.qaUtterance = u; },
      cancel() { window.qaCancel++; this.speaking = false; window.qaUtterance = null; },
    } });
    window.qaFinish = () => { const u = window.qaUtterance; window.speechSynthesis.speaking = false; window.qaUtterance = null; u?.onend?.(); };
  });
  await page.goto('http://127.0.0.1:5173/');
  await page.getByRole('button', { name: 'Bật giọng nói' }).click();
  assert.match(await page.evaluate(() => window.qaSpoken.at(-1).text), /Đã bật nhắc/);
  assert.equal(await page.evaluate(() => window.qaSpoken.at(-1).lang), 'vi-VN');
  await page.getByRole('button', { name: 'Tắt giọng nói' }).click();
  assert.equal(await page.evaluate(() => window.speechSynthesis.speaking), false);
  // Mount harness cùng hook thật. Phản hồi tổng hợp chỉ trong trang QA này.
  await page.evaluate(async () => {
    window.qaNow = 0;
    Object.defineProperty(performance, 'now', { value: () => window.qaNow });
    const hookUrl = '/src/hooks/useVoiceFeedback.js';
    const hookSource = await (await fetch(hookUrl)).text();
    const mainSource = await (await fetch('/src/main.jsx')).text();
    const reactUrl = hookSource.match(/from\s+"([^"]*react\.js[^\"]*)"/)[1];
    const domUrl = mainSource.match(/from\s+"([^"]*react-dom_client\.js[^\"]*)"/)[1];
    const reactModule = await import(reactUrl);
    const React = reactModule.default ?? reactModule;
    const domModule = await import(domUrl);
    const { createRoot } = domModule.default ?? domModule;
    const { useVoiceFeedback } = await import(hookUrl);
    window.qaInput = { phase: 'running', detected: true, sessionKey: 'mountain', feedback: { status: 'fail', criteria: [{ id: 'knee', label: 'Gối trái', status: 'fail', advice: 'Duỗi nhẹ chân trái.' }] } };
    function Harness() {
      const [input, setInput] = React.useState(window.qaInput); window.qaSet = setInput;
      const audio = useVoiceFeedback(input); window.qaAudio = audio;
      return React.createElement('button', { onClick: audio.toggle }, audio.enabled ? 'QA off' : 'QA on');
    }
    const host = document.createElement('div'); document.body.append(host);
    window.qaRoot = createRoot(host); window.qaRoot.render(React.createElement(Harness));
  });
  await page.getByRole('button', { name: 'QA on', exact: true }).click();
  await page.evaluate(() => window.qaFinish());
  // Theo thời gian điều khiển, không chờ 20 giây thật.
  await page.evaluate(() => { window.qaSet({ ...window.qaInput, feedback: { ...window.qaInput.feedback } }); });
  await page.waitForTimeout(100);
  await page.evaluate(() => { window.qaNow = 1600; window.qaSet({ ...window.qaInput, feedback: { ...window.qaInput.feedback } }); });
  await page.waitForFunction(() => window.qaSpoken.at(-1).text.includes('Gối trái'));
  await page.evaluate(() => {
    window.qaNow = 2000;
    window.qaSet({ ...window.qaInput, detected: false, feedback: { status: 'unknown', message: 'Không đủ dữ liệu' } });
  });
  await page.waitForFunction(() => !window.speechSynthesis.speaking);
  await page.evaluate(() => {
    window.qaNow = 10000;
    window.qaSet({ ...window.qaInput, detected: false, feedback: { status: 'unknown', message: 'Không đủ dữ liệu' } });
  });
  await page.waitForFunction(() => window.qaSpoken.at(-1).text.includes('Chưa tìm thấy người'));
  await page.evaluate(() => {
    window.qaNow = 10200;
    window.qaSet({ ...window.qaInput, detected: false, feedback: { status: 'unknown', message: 'Không đủ dữ liệu' } });
  });
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => window.speechSynthesis.speaking), true, 'Không cắt lời nhắc thiếu dữ liệu ở mỗi frame');
  await page.evaluate(() => window.qaSet({ ...window.qaInput, phase: 'idle' }));
  await page.waitForFunction(() => !window.speechSynthesis.speaking);
  await page.evaluate(() => window.qaSet({ ...window.qaInput, sessionKey: 'tree' }));
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => window.qaAudio.lastMessage), '');
  await page.evaluate(() => window.qaRoot.unmount());
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  console.log('Đạt: bật/tắt vi-VN, đọc khớp cần chỉnh, hủy khi mất dữ liệu, đọc hết lời nhắc thiếu dữ liệu, dừng camera/đổi tư thế, mobile. Speech API giả lập; cần nghe thử trên thiết bị thật.');
} finally { await browser.close(); }
