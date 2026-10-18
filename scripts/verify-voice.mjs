// Browser QA for bundled recordings; does not verify physical speakers or phone autoplay.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { voiceClips } from '../src/data/voiceClips.js';
const require = createRequire(`${process.argv[2]}/package.json`);
const { chromium } = require('playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
 const page = await browser.newPage({viewport:{width:390,height:844}});
 const errors=[]; page.on('pageerror', e=>errors.push(e.message));
 await page.addInitScript(()=>{
  const NativeAudio=window.Audio;
  window.qaPlayers=[];
  window.Audio=function(...args){ const a=new NativeAudio(...args);window.qaPlayers.push(a);return a; };
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:undefined});
 });
 await page.goto(process.argv[3] || 'http://127.0.0.1:5173/');
 const decoded=await page.evaluate(async ids=>{
  const ctx=new AudioContext();
  try { for(const id of ids){const r=await fetch(`/audio/vi/${id}.mp3`); if(!r.ok)throw Error(id); const a=await ctx.decodeAudioData(await r.arrayBuffer());if(a.duration<=0)throw Error(id); }return ids.length; }
  finally {await ctx.close();}
 },Object.keys(voiceClips));
 assert.equal(decoded,48);
 await page.getByRole('button',{name:'Bật giọng nói',exact:true}).click();
 await page.waitForFunction(()=>window.qaPlayers[0] && !window.qaPlayers[0].paused && window.qaPlayers[0].currentTime>0);
 assert.match(await page.locator('.voice-message').innerText(),/Đã bật hướng dẫn/);
 await page.getByRole('button',{name:'Tắt giọng nói',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.qaPlayers[0].paused),true);
 await page.getByRole('button',{name:'Bật giọng nói',exact:true}).click();
 await page.getByRole('button',{name:/Warrior/}).click();
 assert.equal(await page.evaluate(()=>window.qaPlayers[0].paused),true);
 await page.route('**/audio/vi/voice-enabled.mp3',r=>r.abort());
 await page.getByRole('button',{name:'Tắt giọng nói',exact:true}).click();
 await page.getByRole('button',{name:'Bật giọng nói',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'Không phát được bản thu'}).waitFor();
 assert.deepEqual(errors,[]);
 console.log('PASS: 48 MP3 decode; no system TTS; play/stop, pose change, network failure; mobile viewport.');
} finally {await browser.close();}
