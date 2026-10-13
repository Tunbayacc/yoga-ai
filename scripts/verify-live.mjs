// Kiểm thử tích hợp bằng landmarks tổng hợp trong browser route riêng, không sửa AI ứng dụng.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(`${process.argv[2]}/package.json`);
const { chromium } = require('playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.qaPoseMode = 'missing';
    navigator.mediaDevices.getUserMedia = async () => {
      const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480;
      const context = canvas.getContext('2d');
      window.qaDrawInterval = setInterval(() => { context.fillStyle = '#23382d'; context.fillRect(0,0,640,480); },80);
      window.qaStream = canvas.captureStream(15); return window.qaStream;
    };
  });
  await page.route('**/src/services/poseDetector.js*', route => route.fulfill({ contentType: 'text/javascript', body: `
    export class PoseDetector {
      async initialize() { this.delegate='QA'; }
      close() {}
      detect() {
        if(window.qaPoseMode==='missing') return {landmarks:[]};
        const p=Array.from({length:33},()=>({x:.5,y:.1,z:0,visibility:.99,presence:.99}));
        for(const [id,x,y] of [[11,.4,.2],[12,.6,.2],[23,.4,.5],[24,.6,.5],[25,.4,.7],[26,.6,.7],[27,.4,.95],[28,.6,.95]]) Object.assign(p[id],{x,y});
        if(window.qaPoseMode==='fail') p[25].x=.1;
        if(window.qaPoseMode==='limited') p[27].visibility=.1;
        return {landmarks:[p]};
      }
    }
    export function drawSkeleton() {}
  ` }));
  await page.goto('http://127.0.0.1:5173/');
  assert.equal(await page.locator('.live-progress').count(),0);
  await page.getByRole('button',{name:/Bật camera/}).first().click();
  await page.locator('.live-progress.live-searching').waitFor();
  const hold=page.getByRole('progressbar',{name:'Tiến trình giữ tư thế'});
  const score=page.getByRole('progressbar',{name:'Điểm tiêu chí tư thế'});
  assert.equal(await score.getAttribute('aria-valuenow'),null);
  assert.equal(await hold.getAttribute('aria-valuenow'),'0');
  await page.evaluate(()=>{window.qaPoseMode='pass';});
  await page.locator('.live-progress.live-holding').waitFor();
  await page.waitForFunction(()=>Number(document.querySelector('[aria-label="Tiến trình giữ tư thế"]').getAttribute('aria-valuenow'))>1);
  assert.equal(await score.getAttribute('aria-valuenow'),'100');
  await page.locator('.live-progress.live-complete').waitFor({timeout:15000});
  assert.equal(await hold.getAttribute('aria-valuenow'),'5');
  await page.evaluate(()=>{window.qaPoseMode='fail';});
  await page.locator('.live-progress.live-adjusting').waitFor();
  assert.equal(await hold.getAttribute('aria-valuenow'),'0');
  await page.waitForFunction(()=>Number(document.querySelector('[aria-label="Điểm tiêu chí tư thế"]').getAttribute('aria-valuenow'))<100);
  await page.evaluate(()=>{window.qaPoseMode='limited';});
  await page.locator('.live-progress.live-limited').waitFor();
  assert.equal(await score.getAttribute('aria-valuenow'),null);
  await page.evaluate(()=>{window.qaPoseMode='pass';});
  await page.locator('.live-progress.live-holding').waitFor();
  await page.getByRole('button',{name:/Tree Pose/}).click();
  assert.equal(await hold.getAttribute('aria-valuenow'),'0');
  await page.getByRole('button',{name:/Mountain Pose/}).click();
  await page.locator('.live-progress.live-holding').waitFor();
  await page.evaluate(()=>document.querySelector('video').pause());
  await page.locator('.live-progress.live-waiting').waitFor();
  assert.equal(await hold.getAttribute('aria-valuenow'),'0');
  assert.equal(await score.getAttribute('aria-valuenow'),null);
  await page.evaluate(()=>document.querySelector('video').play());
  await page.locator('.live-progress.live-holding').waitFor();
  // Ảnh QA được đánh dấu rõ vì kết quả tổng hợp, không phải nhận diện người thật.
  await page.evaluate(()=>{const banner=document.createElement('div');banner.textContent='KIỂM THỬ GIAO DIỆN · Điểm mốc tổng hợp, không phải webcam thật';banner.style='position:fixed;bottom:0;left:0;right:0;z-index:999;background:#fff0d6;color:#60430d;padding:10px;text-align:center;font:12px sans-serif';document.body.append(banner);});
  await page.screenshot({path:'docs/screenshots/live-desktop-qa.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:'docs/screenshots/live-mobile-qa.png',fullPage:true});
  await page.getByRole('button',{name:'Tắt camera'}).click();
  assert.equal(await page.locator('.live-progress').count(),0);
  assert.equal(await page.evaluate(()=>window.qaStream.getTracks().every(t=>t.readyState==='ended')),true);
  await page.evaluate(()=>clearInterval(window.qaDrawInterval));
  assert.deepEqual(errors,[]);
  console.log('Đạt: tìm người/ẩn điểm, chấm 100, giữ đến 5s, reset khi sai/mất khớp/đổi tư thế, dừng camera, mobile, không pageerror. Đầu vào tổng hợp chỉ trong QA.');
} finally { await browser.close(); }
