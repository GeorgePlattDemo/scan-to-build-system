(function(root){
  'use strict';

  // STB terms flow: one commercial terms flow for every project tile (System AGENTS.md, trail rule 6).
  // Alcove's version chain is the reference wording and order. Every tile uses this file; none keeps its own.
  //
  //   1 SENT        your definition, by its payload digest
  //   2 ARRIVED     the Store's arrival receipt
  //   3 ANSWERED    the Store's answer: the offer (SUPPORTABLE) or the refusal and its reasons
  //   4 YOUR CALL   accepted or declined, hashed
  //   5 PAID        simulated; no money moves
  //   6 SENT TO STORE · IN THE YARD QUEUE
  //   7 MATERIAL ALLOCATED   8 PRODUCTION RELEASED   9 CUT   10 STAGED   11 READY NOTICE
  //   12 PICKED UP · CUSTODY  the handoff, which issues the full receipt
  //
  // Rules: only a fresh SUPPORTABLE Store answer can be accepted. A refused, unresolved or unavailable
  // answer ends the flow at step 3 with the Store's reasons. A declined answer ends it at step 4.
  // Events after step 3 are hash-linked (each carries the previous hash). A new Store answer for a
  // changed version starts a new chain; the old one is kept in history, never edited.
  // Commerce and the yard are SIMULATED. Nothing here moves money, starts a machine, or claims a cut.

  const VERSION = 'STB-TERMS-FLOW-0.1';
  const EVENTS = Object.freeze([
    Object.freeze({ id:'sent',      label:'Your definition · sent',             who:'you' }),
    Object.freeze({ id:'arrived',   label:'Arrived at Store Zero · receipt',    who:'store' }),
    Object.freeze({ id:'answered',  label:'Store answered · offer',             who:'store' }),
    Object.freeze({ id:'decision',  label:'Your call',                          who:'you' }),
    Object.freeze({ id:'paid',      label:'Paid (simulated)',                   who:'commercial' }),
    Object.freeze({ id:'queued',    label:'Sent to the Store · in the yard queue', who:'yard' }),
    Object.freeze({ id:'allocated', label:'Material allocated',                 who:'store' }),
    Object.freeze({ id:'released',  label:'Production released',                who:'release' }),
    Object.freeze({ id:'cut',       label:'Cut · mill · drill · label',         who:'local cell' }),
    Object.freeze({ id:'staged',    label:'Packaging / staging',                who:'yard' }),
    Object.freeze({ id:'ready',     label:'READY notice',                       who:'fulfillment' }),
    Object.freeze({ id:'custody',   label:'Picked up · custody (handoff)',      who:'you' })
  ]);
  const YARD_EVENTS = Object.freeze(['allocated','released','cut','staged','ready']);
  // The flows on this page, by project, so a reviewer (or the trail scoreboard) can read any tile's chain.
  const INSTANCES = new Map();

  function canonical(value){
    if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
    if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
    return JSON.stringify(value === undefined ? null : value);
  }
  async function sha256(value){
    const bytes = new TextEncoder().encode(canonical(value));
    const digest = await root.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('');
  }
  const now = () => new Date().toISOString();
  const shortId = prefix => prefix + '-' + root.crypto.randomUUID().slice(0,8).toUpperCase();
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const money = n => Number.isFinite(Number(n)) ? '$' + Number(n).toFixed(2) : '—';

  // One flow per project page. `answer` is what the page took from the shared Store client:
  //   { version, status, total, reasons:[{code,text}], body }  where body is the client's Store response.
  function create({ projectId, title }){
    if (!projectId) throw new Error('TERMS_FLOW_PROJECT_REQUIRED');
    let chain = null;
    const history = [];
    const listeners = new Set();
    const notify = () => listeners.forEach(fn => { try { fn(state()); } catch (e) { /* a listener never breaks the flow */ } });

    function event(id){ return chain?.events.find(e => e.id === id) || null; }
    function last(){ return chain?.events[chain.events.length - 1] || null; }

    function setAnswer(answer){
      if (!answer) { if (chain) history.push(chain); chain = null; notify(); return state(); }
      const body = answer.body || {};
      const receipt = body.evaluationReceipt || body.rawEvaluation?.evaluationReceipt || null;
      if (chain && chain.version === answer.version && chain.requestId === body.requestId) return state();
      if (chain) history.push(chain);
      chain = {
        projectId, title: title || projectId,
        version: String(answer.version),
        requestId: body.requestId || null,
        storePin: body.storePin || null,
        status: answer.status,
        total: answer.total,
        reasons: Array.isArray(answer.reasons) ? answer.reasons.slice() : [],
        orderId: null, paymentId: null,
        events: [
          { id:'sent', at: answer.sentAt || body.sentAt || null, hash: body.payloadDigest || null, detail: 'demand ' + String(body.demandSignature || '—').slice(0,16) + '…' },
          { id:'arrived', at: receipt?.evaluatedAt || null, hash: receipt?.receiptHash || null, detail: 'request ' + String(body.requestId || '—').slice(0,8) + ' · Store ' + String(body.storePin || '—').slice(0,7) },
          { id:'answered', at: receipt?.evaluatedAt || null, hash: body.calculationIdentity?.resultHash || receipt?.calculationIdentity?.resultHash || null,
            detail: answer.status === 'SUPPORTABLE' ? 'SUPPORTABLE · ' + money(answer.total) + ' budgetary, not a quote' : answer.status + ' · ' + (answer.reasons || []).map(r => r.code).join(', ') }
        ]
      };
      notify();
      return state();
    }

    async function append(id, detail){
      const prev = last();
      const at = now();
      const hash = await sha256({ flow: VERSION, projectId, version: chain.version, event: id, prevHash: prev?.hash || null, detail, at });
      chain.events.push({ id, at, hash, prevHash: prev?.hash || null, detail });
    }

    function canAccept(){ return !!chain && chain.status === 'SUPPORTABLE' && !event('decision') && !!event('arrived')?.hash; }

    async function accept(){
      if (!canAccept()) return state();
      await append('decision', 'ACCEPTED');
      chain.paymentId = shortId('SIM-PAY');
      await append('paid', money(chain.total) + ' · ' + chain.paymentId + ' · simulated');
      chain.orderId = shortId('ORDER');
      await append('queued', chain.orderId + ' · position 1');
      notify();
      return state();
    }
    async function decline(){
      if (!chain || event('decision') || !event('arrived')?.hash) return state();
      await append('decision', 'DECLINED');
      notify();
      return state();
    }
    async function runYard(){
      if (!event('queued') || event('ready')) return state();
      for (const id of YARD_EVENTS) if (!event(id)) await append(id, 'simulated');
      notify();
      return state();
    }
    async function pickup(){
      if (!event('ready') || event('custody')) return state();
      await append('custody', 'handed to the customer · simulated');
      notify();
      return state();
    }

    function stage(){
      if (!chain) return 'NO_ANSWER';
      if (chain.status !== 'SUPPORTABLE') return 'REFUSED_BY_STORE';
      const d = event('decision');
      if (!d) return 'ANSWERED';
      if (d.detail === 'DECLINED') return 'DECLINED';
      if (event('custody')) return 'HANDED_OFF';
      if (event('ready')) return 'READY';
      return 'QUEUED';
    }

    function receipt(){
      if (!event('custody')) return null;
      return {
        flow: VERSION, projectId, title: chain.title, version: chain.version,
        orderId: chain.orderId, paymentId: chain.paymentId, total: chain.total, storePin: chain.storePin, requestId: chain.requestId,
        events: chain.events.map(e => ({ id: e.id, at: e.at, hash: e.hash, prevHash: e.prevHash || null, detail: e.detail })),
        simulated: true
      };
    }

    function state(){
      const s = stage();
      return {
        flow: VERSION, projectId, stage: s,
        version: chain?.version || null, status: chain?.status || null, total: chain?.total ?? null,
        reasons: chain?.reasons || [],
        canAccept: canAccept(),
        callOpen: s !== 'NO_ANSWER' && s !== 'REFUSED_BY_STORE',
        yardOpen: ['QUEUED','READY','HANDED_OFF'].includes(s),
        recordOpen: ['READY','HANDED_OFF'].includes(s),
        orderId: chain?.orderId || null,
        events: (chain?.events || []).map(e => ({ ...e })),
        receipt: receipt(),
        history: history.length
      };
    }

    // The chain, every tile the same: twelve rows, done (✓) or open (○), each with its hash.
    function renderChain(){
      const done = new Map((chain?.events || []).map(e => [e.id, e]));
      const s = stage();
      const rows = EVENTS.map(def => {
        const e = done.get(def.id);
        let label = def.label;
        if (def.id === 'decision' && e) label = 'Your call · ' + e.detail.toLowerCase();
        if (def.id === 'answered' && e && s === 'REFUSED_BY_STORE') label = 'Store answered · ' + chain.status.toLowerCase();
        const open = !e;
        return '<div class="stb-terms-row' + (open ? ' open' : '') + '" data-terms-event="' + def.id + '" data-terms-state="' + (open ? 'open' : 'done') + '">'
          + '<span class="stb-terms-dot">' + (open ? '○' : '✓') + '</span>'
          + '<span class="stb-terms-label">' + esc(label) + '<small>' + esc(def.who) + (e?.detail ? ' · ' + esc(e.detail) : '') + '</small></span>'
          + '<code class="stb-terms-hash">' + (e?.hash ? esc(String(e.hash).slice(0,16)) + '…' : (open ? '—' : 'no hash')) + '</code></div>';
      }).join('');
      const reasons = s === 'REFUSED_BY_STORE' && chain.reasons.length
        ? '<ul class="stb-terms-reasons">' + chain.reasons.map(r => '<li><b>' + esc(r.code) + '</b>' + (r.text ? ' · ' + esc(r.text) : '') + '</li>').join('') + '</ul>'
        : '';
      return '<div class="stb-terms" data-terms-stage="' + s + '"><p class="stb-terms-hd">TERMS · ' + esc(chain?.title || projectId) + (chain ? ' · ' + esc(chain.version) : '') + '</p>' + rows + reasons
        + '<p class="stb-terms-note">Offer ≠ acceptance ≠ payment ≠ allocation ≠ release ≠ cut ≠ ready ≠ custody. Commerce and the yard are simulated: no money moves and no machine runs.</p></div>';
    }

    // The buttons for one step: 'call' (step 4), 'yard' (step 5) or 'record' (step 6).
    function renderControls(step){
      const s = stage();
      if (step === 'call') {
        if (s === 'NO_ANSWER') return '<p class="stb-terms-wait">Waiting on a current Store answer for this version.</p>';
        if (s === 'REFUSED_BY_STORE') return '<p class="stb-terms-refused" data-terms-refused>The Store did not accept this version (' + esc(chain.status) + '). The refusal is the result. Change the definition to ask again.</p>';
        if (s === 'DECLINED') return '<p class="stb-terms-declined">You declined this answer. Change the definition to ask again.</p>';
        if (s !== 'ANSWERED') return '<p class="stb-terms-done">Accepted and sent to the Store · ' + esc(chain.orderId) + '.</p>';
        return '<div class="stb-terms-actions"><button type="button" class="stb-terms-go" data-terms-action="accept">ACCEPT &amp; SEND TO STORE · ' + esc(money(chain.total)) + ' →</button>'
          + '<button type="button" class="stb-terms-ghost" data-terms-action="decline">DECLINE</button></div>';
      }
      if (step === 'yard') {
        if (!['QUEUED','READY','HANDED_OFF'].includes(s)) return '<p class="stb-terms-wait">Nothing is in the yard yet. This opens after you accept and send to the Store.</p>';
        if (s === 'QUEUED') return '<div class="stb-terms-actions"><button type="button" class="stb-terms-go" data-terms-action="yard">RUN THE YARD (SIMULATED): ALLOCATE → RELEASE → CUT → STAGE → READY →</button></div>';
        return '<p class="stb-terms-done">Cut, staged and ready for pickup · ' + esc(chain.orderId) + '.</p>';
      }
      if (step === 'record') {
        if (s === 'READY') return '<div class="stb-terms-actions"><button type="button" class="stb-terms-go" data-terms-action="pickup">RECORD PICKUP · ISSUE THE FULL RECEIPT →</button></div>';
        if (s === 'HANDED_OFF') return renderReceipt();
        return '<p class="stb-terms-wait">Nothing to pick up yet. This opens once the parts are ready.</p>';
      }
      return '';
    }

    function renderReceipt(){
      const r = receipt();
      if (!r) return '';
      return '<div class="stb-terms-receipt" data-terms-receipt><p class="stb-terms-hd">FULL RECEIPT · HANDOFF</p>'
        + '<div class="stb-terms-kv"><span>Order</span><b>' + esc(r.orderId) + '</b></div>'
        + '<div class="stb-terms-kv"><span>Version</span><b>' + esc(r.version) + '</b></div>'
        + '<div class="stb-terms-kv"><span>Total (budgetary, simulated payment)</span><b>' + esc(money(r.total)) + ' · ' + esc(r.paymentId) + '</b></div>'
        + '<div class="stb-terms-kv"><span>Store</span><b>' + esc(String(r.storePin).slice(0,12)) + ' · request ' + esc(String(r.requestId).slice(0,8)) + '</b></div>'
        + r.events.map(e => '<div class="stb-terms-kv"><span>' + esc(EVENTS.find(d => d.id === e.id)?.label || e.id) + '</span><code>' + esc(e.hash || '—') + '</code></div>').join('')
        + '<p class="stb-terms-note">Every event carries the hash of the one before it. SIMULATED: no money moved and no machine ran.</p></div>';
    }

    // Handle this flow's buttons inside `host`. `after(action, state)` lets the page move to the next step.
    function bind(host, after){
      if (!host || host.dataset.termsBound === projectId) return;
      host.dataset.termsBound = projectId;
      host.addEventListener('click', async event => {
        const button = event.target.closest?.('[data-terms-action]');
        if (!button || !host.contains(button)) return;
        event.preventDefault();
        button.disabled = true;
        const action = button.dataset.termsAction;
        const run = { accept, decline, yard: runYard, pickup }[action];
        if (!run) return;
        const next = await run();
        if (typeof after === 'function') after(action, next);
      });
    }

    const flow = Object.freeze({ setAnswer, accept, decline, runYard, pickup, state, renderChain, renderControls, renderReceipt, bind, onChange: fn => { listeners.add(fn); return () => listeners.delete(fn); } });
    INSTANCES.set(projectId, flow);
    return flow;
  }

  const STYLE = '.stb-terms{margin:12px 0;padding:12px 14px;border:1px solid var(--line,var(--border,#ddd));border-radius:10px;background:var(--card,var(--surface,#fff))}'
    + '.stb-terms-hd{margin:0 0 8px;font-size:10.5px;font-weight:700;letter-spacing:.08em;color:var(--brand,var(--accent,#8a5a2b))}'
    + '.stb-terms-row{display:grid;grid-template-columns:18px minmax(0,1fr) auto;gap:8px;align-items:baseline;padding:5px 0;border-bottom:1px dashed var(--line,var(--border,#ddd));font-size:13px}'
    + '.stb-terms-row.open{opacity:.55}.stb-terms-dot{color:var(--ok,#2f6b3a);font-weight:700}.stb-terms-label small{display:block;color:var(--ink2,var(--text2,#666));font-size:11.5px}'
    + '.stb-terms-hash{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--ink2,var(--text2,#666));word-break:break-all}'
    + '.stb-terms-reasons{margin:8px 0 0;padding-left:18px;color:var(--bad,#9b2c1f);font-size:13px}'
    + '.stb-terms-note{margin:8px 0 0;font-size:12px;color:var(--ink2,var(--text2,#666))}'
    + '.stb-terms-actions{display:flex;flex-wrap:wrap;gap:10px;margin:10px 0}'
    + '.stb-terms-go{background:var(--brand,#8a5a2b);color:var(--brand-ink,#fff);border:0;border-radius:10px;padding:12px 18px;font-weight:700;cursor:pointer}'
    + '.stb-terms-ghost{background:transparent;color:inherit;border:1px solid var(--line,var(--border,#ccc));border-radius:10px;padding:12px 18px;font-weight:600;cursor:pointer}'
    + '.stb-terms-go:disabled,.stb-terms-ghost:disabled{opacity:.45;cursor:not-allowed}'
    + '.stb-terms-refused{color:var(--bad,#9b2c1f);font-weight:600}.stb-terms-wait,.stb-terms-declined,.stb-terms-done{color:var(--ink2,var(--text2,#666))}'
    + '.stb-terms-receipt{margin:12px 0;padding:12px 14px;border:2px solid var(--brand,#8a5a2b);border-radius:10px}'
    + '.stb-terms-kv{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);gap:10px;padding:3px 0;font-size:12.5px}.stb-terms-kv code{font:11px ui-monospace,Menlo,monospace;word-break:break-all}';
  function installStyle(doc){
    const d = doc || root.document;
    if (!d || d.getElementById('stb-terms-style')) return;
    const style = d.createElement('style');
    style.id = 'stb-terms-style';
    style.textContent = STYLE;
    d.head.append(style);
  }

  // Checks one chain: every event after the Store answer carries the previous event's hash.
  function verify(state){
    const events = state?.events || [];
    for (let i = 3; i < events.length; i++) if (events[i].prevHash !== events[i-1].hash || !events[i].hash) return false;
    return true;
  }
  root.STBTermsFlow = Object.freeze({ version: VERSION, events: EVENTS, create, installStyle, sha256, canonical, verify, instance: id => INSTANCES.get(id) || null });
})(typeof window !== 'undefined' ? window : globalThis);
