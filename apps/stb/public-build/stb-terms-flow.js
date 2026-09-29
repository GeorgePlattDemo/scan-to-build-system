(function(root){
  'use strict';

  // STB terms flow: one post-Store terms flow for every project tile (System AGENTS.md, trail rule 6).
  // This file owns the event meanings, order and gates. Every tile uses it; no tile is the master copy.
  //
  //   1 SENT        your definition, by its payload digest
  //   2 ARRIVED     the Store's arrival receipt
  //   3 ANSWERED    the Store's budgetary answer or refusal — not a quote or commercial offer
  //   4 OFFERED     System's simulated commercial offer based on that exact Store answer
  //   5 YOUR CALL   accepted or declined, hashed
  //   6 PAID        simulated; no money moves
  //   7 SENT TO STORE · IN THE YARD QUEUE
  //   8 MATERIAL ALLOCATED   9 PRODUCTION RELEASED   10 CUT   11 STAGED   12 READY NOTICE
  //   13 PICKED UP · CUSTODY  the handoff, which issues the terms / handoff receipt
  //
  // Rules: only a fresh SUPPORTABLE Store answer can produce a simulated offer. A refused, unresolved or
  // unavailable answer ends at step 3 with the Store's reasons. A declined simulated offer ends at step 5.
  // Events after the Store answer are hash-linked (each carries the previous hash). A new Store answer for a
  // changed version starts a new chain; the old one is kept in history, never edited.
  // Commerce and the yard are SIMULATED. Nothing here moves money, starts a machine, or claims a physical cut.

  const VERSION = 'STB-TERMS-FLOW-0.2';
  const EVENTS = Object.freeze([
    Object.freeze({ id:'sent',      label:'Your definition · sent',                  who:'you' }),
    Object.freeze({ id:'arrived',   label:'Arrived at Store Zero · receipt',         who:'store' }),
    Object.freeze({ id:'answered',  label:'Store answered · budgetary answer',       who:'store' }),
    Object.freeze({ id:'offered',   label:'Simulated offer · created',               who:'system demo' }),
    Object.freeze({ id:'decision',  label:'Your call',                               who:'you' }),
    Object.freeze({ id:'paid',      label:'Paid (simulated)',                        who:'commercial simulation' }),
    Object.freeze({ id:'queued',    label:'Sent to the Store · in the yard queue',   who:'yard' }),
    Object.freeze({ id:'allocated', label:'Material allocated',                      who:'store' }),
    Object.freeze({ id:'released',  label:'Production released',                     who:'release' }),
    Object.freeze({ id:'cut',       label:'Cut · mill · drill · label',              who:'local cell' }),
    Object.freeze({ id:'staged',    label:'Packaging / staging',                     who:'yard' }),
    Object.freeze({ id:'ready',     label:'READY notice',                            who:'fulfillment' }),
    Object.freeze({ id:'custody',   label:'Picked up · custody (handoff)',           who:'you' })
  ]);
  const YARD_EVENTS = Object.freeze(['allocated','released','cut','staged','ready']);
  const CONFIG_ROOTS = Object.freeze({
    alcove:'#alcove-config',
    'window-seat':'#s-configure'
  });
  const START_OWN_CONTROLS = 'button[data-length],#stb-config-length';
  const DOWNSTREAM_STAGES = new Set(['request','review','yard','terms','recap','record']);
  const INSTANCES = new Map();
  const WATCHED_DOCS = new WeakSet();
  const WATCHED_DOC_LIST = new Set();

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

  function closeDownstreamNav(projectId){
    for (const doc of WATCHED_DOC_LIST) {
      try {
        doc.querySelectorAll(`.recovery-nav button[data-job-project="${projectId}"]`).forEach(button => {
          if (!DOWNSTREAM_STAGES.has(button.dataset.journeyStage)) return;
          button.disabled = true;
          button.setAttribute('aria-disabled','true');
        });
      } catch (_) { /* a stale document reference never reopens authority */ }
    }
  }

  function watchDefinitionDocument(doc){
    if (!doc || WATCHED_DOCS.has(doc)) return;
    WATCHED_DOCS.add(doc);
    WATCHED_DOC_LIST.add(doc);

    const fromDefinitionControl = event => {
      const target = event.target;
      if (!target?.closest) return;

      for (const [projectId, selector] of Object.entries(CONFIG_ROOTS)) {
        const flow = INSTANCES.get(projectId);
        if (!flow || !target.closest(selector) || target.closest('.stb-terms')) continue;
        if (event.type === 'click' && !target.closest('button,[data-material],[data-depth],[data-n],[data-k]')) continue;
        flow.invalidate();
        return;
      }

      const startOwn = INSTANCES.get('start-own');
      if (startOwn && target.closest(START_OWN_CONTROLS)) startOwn.invalidate();
    };
    doc.addEventListener('input', fromDefinitionControl, true);
    doc.addEventListener('change', fromDefinitionControl, true);
    doc.addEventListener('click', fromDefinitionControl, true);

    const attachFrames = () => {
      for (const frame of doc.querySelectorAll('iframe')) {
        try { if (frame.contentDocument) watchDefinitionDocument(frame.contentDocument); } catch (_) { /* cross-origin frames are not project controls */ }
        if (frame.dataset.stbTermsWatchBound === 'true') continue;
        frame.dataset.stbTermsWatchBound = 'true';
        frame.addEventListener('load', () => {
          try { if (frame.contentDocument) watchDefinitionDocument(frame.contentDocument); } catch (_) { /* same boundary */ }
        });
      }
    };
    attachFrames();
    const MutationObserverCtor = doc.defaultView?.MutationObserver || root.MutationObserver;
    if (doc.documentElement && MutationObserverCtor) {
      new MutationObserverCtor(attachFrames).observe(doc.documentElement, { childList:true, subtree:true });
    }
  }

  function create({ projectId, title }){
    if (!projectId) throw new Error('TERMS_FLOW_PROJECT_REQUIRED');
    let chain = null;
    let invalidatedIdentity = null;
    const history = [];
    const listeners = new Set();
    const notify = () => listeners.forEach(fn => { try { fn(state()); } catch (_) { /* a listener never breaks the flow */ } });

    function event(id){ return chain?.events.find(e => e.id === id) || null; }
    function last(){ return chain?.events[chain.events.length - 1] || null; }

    function invalidate(){
      if (chain) {
        invalidatedIdentity = String(chain.version) + '|' + String(chain.requestId || '');
        history.push(chain);
      }
      chain = null;
      closeDownstreamNav(projectId);
      notify();
      return state();
    }

    function setAnswer(answer){
      if (!answer) return invalidate();
      const body = answer.body || {};
      const receipt = body.evaluationReceipt || body.rawEvaluation?.evaluationReceipt || null;
      const incomingVersion = String(answer.version);
      const incomingRequestId = body.requestId || null;
      const incomingIdentity = incomingVersion + '|' + String(incomingRequestId || '');
      if (!chain && invalidatedIdentity === incomingIdentity) return state();
      if (chain && chain.version === incomingVersion && chain.requestId === incomingRequestId) return state();
      if (chain) history.push(chain);
      invalidatedIdentity = null;
      chain = {
        projectId, title: title || projectId,
        version: incomingVersion,
        requestId: incomingRequestId,
        storePin: body.storePin || null,
        status: answer.status,
        total: answer.total,
        reasons: Array.isArray(answer.reasons) ? answer.reasons.slice() : [],
        orderId: null, paymentId: null,
        events: [
          { id:'sent', at: answer.sentAt || body.sentAt || null, hash: body.payloadDigest || null, detail: 'demand ' + String(body.demandSignature || '—').slice(0,16) + '…' },
          { id:'arrived', at: receipt?.evaluatedAt || null, hash: receipt?.receiptHash || null, detail: 'request ' + String(body.requestId || '—').slice(0,8) + ' · Store ' + String(body.storePin || '—').slice(0,7) },
          { id:'answered', at: receipt?.evaluatedAt || null, hash: body.calculationIdentity?.resultHash || receipt?.calculationIdentity?.resultHash || null,
            detail: answer.status === 'SUPPORTABLE' ? 'SUPPORTABLE · ' + money(answer.total) + ' budgetary, not a quote or offer' : answer.status + ' · ' + (answer.reasons || []).map(r => r.code).join(', ') }
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
    async function ensureOffer(){
      if (!canAccept()) return false;
      if (!event('offered')) await append('offered', 'SIMULATED_OFFER · ' + money(chain.total) + ' · based on this Store budgetary answer');
      return true;
    }

    async function accept(){
      if (!await ensureOffer()) return state();
      await append('decision', 'ACCEPTED');
      chain.paymentId = shortId('SIM-PAY');
      await append('paid', money(chain.total) + ' · ' + chain.paymentId + ' · simulated');
      chain.orderId = shortId('ORDER');
      await append('queued', chain.orderId + ' · position 1');
      notify();
      return state();
    }
    async function decline(){
      if (!await ensureOffer()) return state();
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

    if (root.addEventListener) {
      root.addEventListener('message', message => {
        if (message.data?.type === 'STB_PROJECT_DEFINITION_CHANGED' && message.data?.projectId === projectId) invalidate();
      });
    }

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
        + '<p class="stb-terms-note">Store answer ≠ simulated offer ≠ acceptance ≠ payment ≠ allocation ≠ release ≠ cut ≠ ready ≠ custody. Commerce and the yard are simulated: no money moves and no machine runs.</p></div>';
    }

    function renderControls(step){
      const s = stage();
      if (step === 'call') {
        if (s === 'NO_ANSWER') return '<p class="stb-terms-wait">Waiting on a current Store answer for this version.</p>';
        if (s === 'REFUSED_BY_STORE') return '<p class="stb-terms-refused" data-terms-refused>The Store did not support this version (' + esc(chain.status) + '). The refusal is the result. Change the definition to ask again.</p>';
        if (s === 'DECLINED') return '<p class="stb-terms-declined">You declined the simulated offer for this answer. Change the definition to ask again.</p>';
        if (s !== 'ANSWERED') return '<p class="stb-terms-done">Simulated offer accepted and sent to the Store · ' + esc(chain.orderId) + '.</p>';
        return '<div class="stb-terms-actions"><button type="button" class="stb-terms-go" data-terms-action="accept">ACCEPT SIMULATED OFFER &amp; SEND TO STORE · ' + esc(money(chain.total)) + ' →</button>'
          + '<button type="button" class="stb-terms-ghost" data-terms-action="decline">DECLINE SIMULATED OFFER</button></div>';
      }
      if (step === 'yard') {
        if (!['QUEUED','READY','HANDED_OFF'].includes(s)) return '<p class="stb-terms-wait">Nothing is in the yard yet. This opens after you accept the simulated offer and send this version to the Store.</p>';
        if (s === 'QUEUED') return '<div class="stb-terms-actions"><button type="button" class="stb-terms-go" data-terms-action="yard">RUN THE YARD (SIMULATED): ALLOCATE → RELEASE → CUT → STAGE → READY →</button></div>';
        return '<p class="stb-terms-done">Simulated yard run reached READY · ' + esc(chain.orderId) + '.</p>';
      }
      if (step === 'record') {
        if (s === 'READY') return '<div class="stb-terms-actions"><button type="button" class="stb-terms-go" data-terms-action="pickup">RECORD PICKUP · ISSUE TERMS / HANDOFF RECEIPT →</button></div>';
        if (s === 'HANDED_OFF') return renderReceipt();
        return '<p class="stb-terms-wait">Nothing to pick up yet. This opens once the simulated yard run is READY.</p>';
      }
      return '';
    }

    function renderReceipt(){
      const r = receipt();
      if (!r) return '';
      return '<div class="stb-terms-receipt" data-terms-receipt><p class="stb-terms-hd">TERMS / HANDOFF RECEIPT</p>'
        + '<div class="stb-terms-kv"><span>Order</span><b>' + esc(r.orderId) + '</b></div>'
        + '<div class="stb-terms-kv"><span>Version</span><b>' + esc(r.version) + '</b></div>'
        + '<div class="stb-terms-kv"><span>Total (Store budgetary Q; simulated payment)</span><b>' + esc(money(r.total)) + ' · ' + esc(r.paymentId) + '</b></div>'
        + '<div class="stb-terms-kv"><span>Store</span><b>' + esc(String(r.storePin).slice(0,12)) + ' · request ' + esc(String(r.requestId).slice(0,8)) + '</b></div>'
        + r.events.map(e => '<div class="stb-terms-kv"><span>' + esc(EVENTS.find(d => d.id === e.id)?.label || e.id) + '</span><code>' + esc(e.hash || '—') + '</code></div>').join('')
        + '<p class="stb-terms-note">This receipt records the simulated post-Store event chain and custody handoff; the project definition, Store calculation and cut plan remain in their own project records. Every event after the Store answer carries the hash of the one before it. SIMULATED: no money moved and no machine ran.</p></div>';
    }

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

    const flow = Object.freeze({ setAnswer, invalidate, accept, decline, runYard, pickup, state, renderChain, renderControls, renderReceipt, bind, onChange: fn => { listeners.add(fn); return () => listeners.delete(fn); } });
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
    if (!d) return;
    watchDefinitionDocument(d);
    if (d.getElementById('stb-terms-style')) return;
    const style = d.createElement('style');
    style.id = 'stb-terms-style';
    style.textContent = STYLE;
    d.head.append(style);
  }

  function verify(state){
    const events = state?.events || [];
    for (let i = 3; i < events.length; i++) if (events[i].prevHash !== events[i-1].hash || !events[i].hash) return false;
    return true;
  }
  root.STBTermsFlow = Object.freeze({ version: VERSION, events: EVENTS, create, installStyle, sha256, canonical, verify, instance: id => INSTANCES.get(id) || null });
})(typeof window !== 'undefined' ? window : globalThis);