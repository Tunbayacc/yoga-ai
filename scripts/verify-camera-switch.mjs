import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(`${process.argv[2]}/package.json`);
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const context=await browser.newContext({viewport:{width:390,height:844},userAgent:'Mozilla/5.0 (Linux; Android 15) Chrome/130 Mobile'});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.qaRequests=[];window.qaStreams=[];
  navigator.mediaDevices.getUserMedia=async constraints=>{
   window.qaRequests.push(constraints);
   const c=document.createElement('canvas');c.width=640;c.height=480;
   const ctx=c.getContext('2d');ctx.fillStyle='black';
   const timer=setInterval(()=>ctx.fillRect(0,0,640,480),33);
   const stream=c.captureStream(30);stream.getTracks()[0].addEventListener('ended',()=>clearInterval(timer));
   window.qaStreams.push(stream);return stream;
  };
 });
 await page.goto('http://127.0.0.1:5174/');
 await page.getByRole('button',{name:'Chuyển sang camera sau',exact:true}).click();
 assert.equal(await page.locator('.rear-camera').count(),1);
 await page.getByRole('button',{name:'Bật camera',exact:true}).first().click();
 await page.getByText('Trực tiếp',{exact:true}).waitFor({timeout:60000});
 assert.equal(await page.evaluate(()=>window.qaRequests[0].video.facingMode.exact),'environment');
 assert.equal(await page.locator('video').evaluate(v=>getComputedStyle(v).transform),'none');
 await page.getByRole('button',{name:'Chuyển sang camera trước',exact:true}).click();
 await page.getByText('Trực tiếp',{exact:true}).waitFor({timeout:60000});
 assert.equal(await page.evaluate(()=>window.qaStreams[0].getTracks()[0].readyState),'ended');
 assert.equal(await page.evaluate(()=>window.qaRequests[1].video.facingMode.exact),'user');
 assert.equal(await page.locator('.rear-camera').count(),0);
 await page.getByRole('button',{name:'Tắt camera',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.qaStreams[1].getTracks()[0].readyState),'ended');
 const desktop=await browser.newPage({viewport:{width:390,height:844}});
 await desktop.goto('http://127.0.0.1:5174/');
 assert.equal(await desktop.getByRole('button',{name:/Chuyển sang camera/}).count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS: mobile rear/front constraints, stream stopped on switch/stop, rear unmirrored, desktop has no switch; synthetic streams only.');
} finally {await browser.close();}
