// Regression ratchet for the highest-risk post-Store state bug:
// accept version A -> change the definition -> A becomes history only -> yard/record close -> version B
// must obtain a fresh Store answer before another acceptance. Runs against the real pinned Store.
import test from 'node:test';
import assert from 'node:assert/strict';

import { withBrowser, openTile } from './helpers.mjs';

const wait = (page, ms) => page.waitForTimeout(ms);
const frameOf = (page, part) => page.frames().find(f => f.url().includes(part));
async function terms(win, projectId) {
  return win.evaluate(id => window.STBTermsFlow.instance(id)?.state() ?? null, projectId);
}
async function navInert(frame, projectId) {
  return frame.$$eval(`.recovery-nav button[data-job-project="${projectId}"]`, els =>
    Object.fromEntries(els.filter(e => !e.hidden).map(e => [e.dataset.journeyStage, e.disabled || e.getAttribute('aria-disabled') === 'true'])));
}
async function until(fn, label, tries = 100) {
  for (let i = 0; i < tries; i++) { const v = await fn(); if (v) return v; await new Promise(r => setTimeout(r, 120)); }
  throw new Error('timed out: ' + label);
}

const TILES = {
  playhouse: {
    label:'Playhouse arched window', projectId:'playhouse', inner:false,
    async answer({ page, frame }) {
      await until(() => frame.evaluate(() => { const s=window.STBPlayhouseLive?.state(); return s && !s.asking && s.answer?.evaluation?.status==='SUPPORTABLE'; }), 'playhouse answer');
      return { win:page };
    },
    call:(frame)=>frame.evaluate(()=>window.show('playhouse-request')),
    callHost:'#playhouse-request .s001-terms-host',
    async change({ frame }) {
      await frame.evaluate(() => { const e=document.getElementById('s001-opening-width'); e.value='30'; e.dispatchEvent(new Event('input')); });
    },
    async fresh({ frame, page }) {
      await until(() => frame.evaluate(() => { const s=window.STBPlayhouseLive?.state(); return s && !s.asking && s.answer?.evaluation?.status==='SUPPORTABLE'; }), 'playhouse fresh answer');
      return { win:page };
    }
  },
  alcove: {
    label:'Critical fit', projectId:'alcove', inner:false,
    async answer({ page, frame }) {
      await frame.locator('.recovery-nav button[data-journey-stage="configure"]').click();
      await wait(page,700);
      await frame.locator('#confirm-alcove-inline').click();
      await until(async()=> (await terms(page,'alcove'))?.stage==='ANSWERED','alcove answer');
      return { win:page };
    },
    call:(frame)=>frame.locator('.recovery-nav button[data-journey-stage="request"]').click(),
    callHost:'#request .alcove-terms-host',
    async change({ page, frame }) {
      await frame.locator('.recovery-nav button[data-journey-stage="configure"]').click();
      await wait(page,500);
      await frame.locator('[data-material="poplar"]').first().click();
    },
    async fresh({ page, frame }) {
      await frame.locator('#confirm-alcove-inline').click();
      await until(async()=> (await terms(page,'alcove'))?.stage==='ANSWERED','alcove fresh answer');
      return { win:page };
    }
  },
  'start-own': {
    label:'Start your own', projectId:'start-own', inner:false,
    async answer({ page, frame }) {
      await frame.locator('.recovery-nav button[data-journey-stage="configure"]').click();
      await wait(page,1200);
      await frameOf(page,'three-frames.html').locator('#stb-confirm-store').click();
      await until(async()=> (await terms(page,'start-own'))?.stage==='ANSWERED','job 1 answer');
      return { win:page };
    },
    call:(frame)=>frame.locator('.recovery-nav button[data-journey-stage="request"]').click(),
    callHost:'#proof-accept .start-own-terms-host',
    async change({ page, frame }) {
      await frame.locator('.recovery-nav button[data-journey-stage="configure"]').click();
      await wait(page,600);
      await frameOf(page,'three-frames.html').locator('button[data-length="18"]').click();
    },
    async fresh({ page }) {
      // Start Your Own retains its human gate: editing B invalidates A immediately, but B does not
      // become an identified Store request until the user confirms that changed definition.
      await frameOf(page,'three-frames.html').locator('#stb-confirm-store').click();
      await until(async()=> (await terms(page,'start-own'))?.stage==='ANSWERED','job 1 fresh answer');
      return { win:page };
    }
  },
  outdoor: {
    label:'Outdoor build', projectId:'outdoor', inner:true,
    async answer({ page }) {
      const win=await until(async()=>{const f=frameOf(page,'stb-outdoor-picnic-0.3.html');return f&&await f.$('#plans .plan')?f:null},'outdoor frame');
      await win.locator('[data-to-bench="table-benches"]').click();
      await until(async()=> (await terms(win,'outdoor'))?.stage==='ANSWERED','outdoor answer');
      return { win };
    },
    // 0.3: card → the bench → the Store's answer → your call.
    call:async(frame,win)=>{await win.locator('#btn-store').click();await win.locator('#btn-call').click();},
    callHost:'#call-terms',
    async change({ page, frame, win }) {
      await frame.locator('.recovery-nav button[data-journey-stage="configure"]').click();
      await wait(page,350);
      await win.locator('#s-bench [data-size="1"]').click();
    },
    async fresh({ win }) {
      await until(async()=> (await terms(win,'outdoor'))?.stage==='ANSWERED','outdoor fresh answer');
      return { win };
    }
  },
  'window-seat': {
    label:'Space utilization', projectId:'window-seat', inner:true,
    async answer({ page }) {
      const win=await until(()=>frameOf(page,'stb-window-seat-0.9.html'),'window seat frame');
      await win.locator('#fork [data-route="trail"]').click();
      await win.locator('#s-intent [data-to="bench"]').click();
      await win.locator('#btn-ask').click();
      await until(async()=> (await terms(win,'window-seat'))?.stage==='ANSWERED','window seat answer');
      return { win };
    },
    call:(frame,win)=>win.locator('#btn-call').click(),
    callHost:'#call-terms',
    async change({ page, frame, win }) {
      await frame.locator('.recovery-nav button[data-journey-stage="configure"]').click();
      await wait(page,350);
      await win.locator('#depth-panel [data-depth="0.25"]').click();
    },
    async fresh({ win }) {
      await win.locator('#btn-ask').click();
      await until(async()=> (await terms(win,'window-seat'))?.stage==='ANSWERED','window seat fresh answer');
      return { win };
    }
  }
};

for (const [id,tile] of Object.entries(TILES)) {
  test(`stale acceptance ${id}: accepted version A cannot authorize changed version B`, {timeout:240000}, async()=>{
    await withBrowser(async({browser,origin,log})=>{
      const {page,frame,errors}=await openTile(browser,origin,tile.label);
      let {win}=await tile.answer({page,frame,log});
      const inner=tile.inner?win:frame;
      const before=await terms(win,tile.projectId);
      assert.equal(before.stage,'ANSWERED');
      const oldVersion=before.version;

      await tile.call(frame,win);
      await wait(page,350);
      await inner.locator(`${tile.callHost} [data-terms-action="accept"]`).click();
      const accepted=await until(async()=>{const s=await terms(win,tile.projectId);return s?.stage==='QUEUED'?s:null},id+' accepted');
      assert.ok(accepted.orderId,id+': accepted version has an order id');
      const oldOrder=accepted.orderId;

      await tile.change({page,frame,win,log});
      await wait(page,120);
      const changed=await terms(win,tile.projectId);
      assert.notEqual(changed?.stage,'QUEUED',id+': old accepted chain must stop being current as soon as the definition changes');
      assert.notEqual(changed?.stage,'READY',id+': old accepted chain must not remain ready after a definition change');
      assert.notEqual(changed?.stage,'HANDED_OFF',id+': old accepted chain must not remain handed off after a definition change');
      assert.notEqual(changed?.orderId,oldOrder,id+': old order id cannot authorize the changed definition');
      assert.equal(changed?.yardOpen??false,false,id+': yard closes for the changed definition');
      assert.equal(changed?.recordOpen??false,false,id+': pickup/record closes for the changed definition');
      const hostNav=await navInert(frame,tile.projectId);
      assert.equal(hostNav.yard,true,id+': step 5 inert after changing an accepted definition');
      assert.equal(hostNav.record,true,id+': step 6 inert after changing an accepted definition');

      ({win}=await tile.fresh({page,frame,win,log}));
      const fresh=await terms(win,tile.projectId);
      assert.equal(fresh.stage,'ANSWERED',id+': changed definition receives a fresh Store answer before another acceptance');
      assert.notEqual(fresh.version,oldVersion,id+': current terms chain belongs to the changed definition');
      assert.equal(fresh.events.length,3,id+': fresh Store answer has no simulated offer, acceptance, payment or yard state yet');
      assert.equal(fresh.yardOpen,false);
      assert.equal(fresh.recordOpen,false);
      assert.ok(fresh.history>=1,id+': accepted version A remains history rather than being rewritten');
      assert.deepEqual(errors,[]);
    });
  });
}