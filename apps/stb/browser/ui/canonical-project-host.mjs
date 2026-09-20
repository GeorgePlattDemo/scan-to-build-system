import {
  CANONICAL_PROJECT_STAGES,
  canonicalProjectHref,
  resolveProjectStage,
} from '/shared/project-registry.mjs';
import { recordReviewChildSnapshot } from '/domain/review-child.mjs';

const ACTIVE = new WeakMap();

const STAGE_LABELS = Object.freeze({
  'scan-evidence': 'SCAN / EVIDENCE',
  configure: 'CONFIGURE',
  'store-answer': 'STORE ANSWER',
  'accept-pay': 'ACCEPT / PAY',
  'store-yard': 'STORE / YARD',
  'handoff-record': 'HANDOFF / RECORD',
});

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  for (const [name, value] of Object.entries(options.attrs ?? {})) {
    if (value !== undefined && value !== null) node.setAttribute(name, value);
  }
  for (const child of children) if (child) node.append(child);
  return node;
}

function fnv1a(value) {
  let h = 0x811c9dc5;
  const s = String(value);
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function clean(value) {
  try { return JSON.parse(JSON.stringify(value ?? null)); }
  catch { return null; }
}

function definitionIdentity(projectId, payload) {
  if (projectId === 'start-own') {
    return String(payload?.id || payload?.definitionId || ('SYO-' + fnv1a(JSON.stringify(payload ?? null))));
  }
  if (projectId === 'outdoor') {
    return String(
      payload?.id
      || payload?.definitionId
      || payload?.versionId
      || payload?.normalizedPart?.versionId
      || ('OUTDOOR-' + fnv1a(JSON.stringify(payload?.normalizedPart ?? payload ?? null))),
    );
  }
  if (projectId === 'window-seat') {
    const revision = payload?.revision?.number ?? payload?.storeRequest?.revision ?? 'candidate';
    return 'WINDOW-SEAT-R' + String(revision) + '-' + fnv1a(JSON.stringify(payload?.definition ?? null));
  }
  if (projectId === 'alcove') {
    return 'ALCOVE-' + fnv1a(JSON.stringify(payload ?? null));
  }
  return projectId.toUpperCase() + '-' + fnv1a(JSON.stringify(payload ?? null));
}

function stageBoundary(stage, projectId) {
  if (stage === 'scan-evidence') {
    return {
      heading: 'Scan / Evidence',
      body: 'Source facts remain attached to their origin. Context does not become a cut dimension merely because it is visible.',
    };
  }
  if (stage === 'configure') {
    return {
      heading: 'Configure',
      body: 'The project child owns its mature definition behavior. The System host does not redraw, reinterpret, or reprice it.',
    };
  }
  if (stage === 'store-answer') {
    return {
      heading: 'Store Answer',
      body: projectId === 'alcove'
        ? 'The Alcove project owns its native reference economics. The host does not recalculate them. A Store answer is not customer acceptance.'
        : 'The recorded answer belongs only to the identified definition that produced it. Store support is not commercial acceptance.',
    };
  }
  if (stage === 'accept-pay') {
    return {
      heading: 'Accept / Pay',
      body: 'Commercial acceptance and settlement are separate events. This reference application does not invent payment or seller-of-record authority.',
    };
  }
  if (stage === 'store-yard') {
    return {
      heading: 'Store / Yard',
      body: 'Payment is not allocation. Allocation is not production release. Machine readiness is not Cycle Start. No browser event creates local machine authority.',
    };
  }
  return {
    heading: 'Handoff / Record',
    body: 'READY is not custody. Missing physical, commercial, staging, pickup, or custody events remain missing. The owner record preserves what was actually established.',
  };
}

function actorStageForWindowSeat(stage) {
  return ({
    'scan-evidence': 'scan',
    configure: 'configure',
    'store-answer': 'store-answer',
    'accept-pay': 'accept-pay',
    'store-yard': 'store-yard',
    'handoff-record': 'handoff-record',
  })[stage] || 'scan';
}

function canonicalStageForWindowSeatTechnical(stage) {
  return ({
    scan: 'scan-evidence',
    configure: 'configure',
    store: 'store-answer',
    review: 'store-answer',
    request: 'accept-pay',
    yard: 'store-yard',
    terms: 'store-yard',
    recap: 'handoff-record',
    record: 'handoff-record',
    'store-answer': 'store-answer',
    'accept-pay': 'accept-pay',
    'store-yard': 'store-yard',
    'handoff-record': 'handoff-record',
  })[stage] || null;
}

function alcovePageForStage(stage) {
  return ({
    'scan-evidence': 'alcove-capture',
    configure: 'alcove-config',
    'store-answer': 'store',
    'accept-pay': 'request',
    'store-yard': 'yard',
    'handoff-record': 'record',
  })[stage] || 'alcove-capture';
}


function createComparisonStoreHandoff(source, payload) {
  const contract = window.STBStoreHandoffContract || null;
  if (!contract || !payload) return null;
  let physicalDemand = null;
  const projectId = source === 'start-own' ? 'start-own' : 'outdoor-build';
  const projectClass = source === 'start-own' ? 'USER_DEFINED_BOARD' : 'BOUNDED_SOURCE_BACKED';
  const sourceAuthority = source === 'start-own'
    ? { kind: 'USER-DEFINED', artifact: 'stb-start-own-0.11.html' }
    : { kind: 'BOUNDED SOURCE-BACKED', artifact: 'stb-outdoor-build.html', detail: payload.sourceAuthority || null };
  if (source === 'start-own') {
    try {
      physicalDemand = JSON.parse(window.localStorage.getItem('stb-proof-ladder-job1') || 'null')?.semanticOutput || null;
    } catch (_) {}
  } else {
    physicalDemand = payload.normalizedPart || null;
  }
  if (!physicalDemand && payload.definition) {
    const def = payload.definition;
    const part0 = payload.request && Array.isArray(payload.request.parts) ? payload.request.parts[0] : null;
    physicalDemand = {
      stockClass: def.stockClass || (def.stock && def.stock.nominal) || '',
      finishedLength: Number(def.finishedLength != null ? def.finishedLength : (part0 && part0.len)),
      quantity: Number(def.qty != null ? def.qty : (def.quantity != null ? def.quantity : (part0 && part0.qty) || 1)),
      endCondition: def.endCondition || 'square',
      straightCut: def.endCondition !== 'angled',
      holeRequirement: def.holeRequirement || 'NONE',
    };
  }
  if (!physicalDemand) return null;
  const definitionId = payload.id || (source === 'start-own' ? 'SYO-IDENTIFIED' : 'OB-SAW-IDENTIFIED');
  try {
    return contract.createComparisonHandoff({
      projectId,
      projectClass,
      definitionId,
      versionId: definitionId,
      physicalDemand,
      sourceAuthority,
      unresolvedConditions: source === 'start-own'
        ? (Array.isArray(payload.storeReference?.unresolvedConditions) ? payload.storeReference.unresolvedConditions : [])
        : ['STORE-PRICING-BRIDGE-GAP'],
    });
  } catch (_) {
    return null;
  }
}

function snapshotRows(snapshot) {
  if (!snapshot) {
    return [
      ['Identified child snapshot', 'NOT YET RECORDED'],
      ['Commercial authority', 'NOT ESTABLISHED'],
      ['Physical authority', 'NOT AUTHORIZED / NOT RECORDED'],
    ];
  }
  return [
    ['Definition / revision', snapshot.definitionId || 'UNIDENTIFIED'],
    ['Snapshot source', snapshot.sourceEvent || 'adapter-capture'],
    ['Commercial authority', 'NOT ESTABLISHED'],
    ['Production release', 'NOT ESTABLISHED'],
    ['Cycle Start', 'NOT AUTHORIZED'],
    ['Physical fabrication', 'NOT RECORDED'],
  ];
}


function currentDefinitionId(ctx) {
  const win = ctx.frame?.contentWindow;
  if (!win) return null;
  try {
    if (ctx.definition.projectId === 'start-own' && typeof win.currentDefinitionId === 'function') {
      return String(win.currentDefinitionId());
    }
    if (ctx.definition.projectId === 'outdoor') {
      return win.O?.sent?.id ? String(win.O.sent.id) : null;
    }
    if (ctx.definition.projectId === 'window-seat' && win.STBWindowSeatJourney) {
      return definitionIdentity('window-seat', win.STBWindowSeatJourney.snapshot());
    }
    if (ctx.definition.projectId === 'alcove') {
      const snapshot = alcoveSnapshot(ctx);
      return snapshot ? definitionIdentity('alcove', snapshot) : null;
    }
  } catch (_) {}
  return null;
}

function snapshotApplicability(ctx) {
  if (!ctx.snapshot) return { current: false, label: 'NO IDENTIFIED CURRENT ANSWER' };
  const currentId = currentDefinitionId(ctx);
  if (!currentId) return { current: false, label: 'STALE / HISTORICAL ONLY' };
  return currentId === ctx.snapshot.definitionId
    ? { current: true, label: 'CURRENT FOR IDENTIFIED DEFINITION' }
    : { current: false, label: 'STALE / HISTORICAL ONLY' };
}

function renderSummary(ctx) {
  const summary = ctx.host.querySelector('[data-canonical-summary]');
  if (!summary) return;
  const boundary = stageBoundary(ctx.stage, ctx.definition.projectId);
  const applicability = snapshotApplicability(ctx);
  summary.replaceChildren(
    el('p', { className: 'canonical-stage-kicker', text: STAGE_LABELS[ctx.stage] }),
    el('h2', { text: boundary.heading }),
    el('p', { className: 'canonical-stage-copy', text: boundary.body }),
    (ctx.stage === 'store-answer' || ctx.stage === 'accept-pay' || ctx.stage === 'store-yard' || ctx.stage === 'handoff-record')
      ? el('p', {
          className: applicability.current ? 'canonical-applicability current' : 'canonical-applicability stale',
          attrs: { 'data-store-applicability': applicability.current ? 'current' : 'stale' },
          text: 'STORE ANSWER APPLICABILITY · ' + applicability.label,
        })
      : null,
    el('div', { className: 'canonical-authority-grid' },
      snapshotRows(ctx.snapshot).map(([name, value]) =>
        el('div', { className: 'canonical-authority-row' }, [
          el('b', { text: name }),
          el('span', { text: value }),
        ]),
      ),
    ),
    ctx.stage === 'handoff-record'
      ? el('div', { className: 'canonical-record-actions' }, [
          el('button', {
            attrs: { type: 'button', 'data-action': 'export-record' },
            text: 'SAVE / EXPORT OWNER RECORD',
          }),
        ])
      : null,
    ctx.snapshot
      ? el('details', { className: 'canonical-snapshot-detail' }, [
          el('summary', { text: 'Inspect recorded child snapshot' }),
          el('pre', { text: JSON.stringify(ctx.snapshot.payload, null, 2) }),
        ])
      : null,
  );
}

function renderNav(ctx) {
  for (const button of ctx.host.querySelectorAll('[data-canonical-stage]')) {
    const stage = button.getAttribute('data-canonical-stage');
    const current = stage === ctx.stage;
    button.classList.toggle('current', current);
    if (current) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
}

function frameShouldShow(ctx) {
  if (ctx.definition.projectId === 'start-own' || ctx.definition.projectId === 'outdoor') {
    return ctx.stage === 'scan-evidence' || ctx.stage === 'configure';
  }
  return true;
}

function applyChildStage(ctx) {
  const frame = ctx.frame;
  if (!frame?.contentWindow) return;
  frame.hidden = !frameShouldShow(ctx);
  if (ctx.definition.projectId === 'window-seat') {
    frame.contentWindow.STBWindowSeatJourney?.showGuided(actorStageForWindowSeat(ctx.stage));
    return;
  }
  if (ctx.definition.projectId === 'alcove') {
    const page = alcovePageForStage(ctx.stage);
    if (typeof frame.contentWindow.show === 'function') frame.contentWindow.show(page);
  }
}

function replaceUrl(ctx) {
  const href = canonicalProjectHref(ctx.project.localRecordId, ctx.definition.projectId, ctx.stage);
  if (href) window.history.pushState({ path: href }, '', href);
}

async function persist(ctx, payload, sourceEvent) {
  const cleaned = clean(payload);
  if (!cleaned) return null;
  const fingerprint = fnv1a(JSON.stringify(cleaned));
  if (fingerprint === ctx.lastFingerprint) return ctx.snapshot;
  const definitionId = definitionIdentity(ctx.definition.projectId, cleaned);
  const saved = await recordReviewChildSnapshot({
    localRecordId: ctx.project.localRecordId,
    catalogProjectId: ctx.definition.projectId,
    definitionId,
    sourceEvent,
    payload: cleaned,
  });
  ctx.lastFingerprint = fingerprint;
  ctx.snapshot = saved;
  renderSummary(ctx);
  return saved;
}

function alcoveSnapshot(ctx) {
  const doc = ctx.frame.contentDocument;
  if (!doc) return null;
  const read = (id) => {
    const node = doc.getElementById(id);
    if (!node) return null;
    return 'value' in node && node.value !== '' ? node.value : (node.textContent || '').trim();
  };
  return {
    projectId: 'alcove',
    sourceBlob: ctx.definition.sourceAuthority.blob,
    controlling: {
      height: read('c-h') || read('p-h'),
      width: read('c-w') || read('p-w'),
      depth: read('c-d') || read('p-d'),
      shelfCount: read('c-n') || read('p-shelves'),
    },
    material: {
      sku: read('o-sku'),
      material: read('p-mat'),
      basis: read('p-basis'),
    },
    economics: {
      displayedTotal: read('review-price') || read('p-price'),
      owner: 'project-native',
    },
    authority: {
      commercial: false,
      payment: false,
      productionRelease: false,
      cycleStart: false,
      physicalFabrication: false,
    },
  };
}

function bindAlcove(ctx) {
  const doc = ctx.frame.contentDocument;
  if (!doc || doc.documentElement.dataset.systemAdapterBound === 'true') return;
  doc.documentElement.dataset.systemAdapterBound = 'true';
  doc.addEventListener('click', (event) => {
    if (!event.target.closest('#confirm-alcove-inline')) return;
    setTimeout(async () => {
      try {
        await persist(ctx, alcoveSnapshot(ctx), 'alcove-native-confirmation');
        setStage(ctx, 'store-answer', { updateHistory: true });
      } catch (error) {
        ctx.status.textContent = 'Owner-record capture failed: ' + error.message;
      }
    }, 0);
  }, true);
}

function bindFrame(ctx) {
  if (ctx.definition.projectId === 'alcove') bindAlcove(ctx);
  applyChildStage(ctx);
}

function setStage(ctx, stage, { updateHistory = false } = {}) {
  if (!resolveProjectStage(ctx.definition.projectId, stage)) return false;
  ctx.stage = stage;
  ctx.host.dataset.canonicalStage = stage;
  renderNav(ctx);
  renderSummary(ctx);
  applyChildStage(ctx);
  if (updateHistory) replaceUrl(ctx);
  return true;
}

function buildNav(definition, stage) {
  return el('nav', { className: 'canonical-project-nav', attrs: { 'aria-label': 'Project stages' } },
    CANONICAL_PROJECT_STAGES.map((item) =>
      el('button', {
        className: item === stage ? 'current' : '',
        attrs: {
          type: 'button',
          'data-action': 'canonical-stage',
          'data-canonical-stage': item,
          'data-canonical-project-id': definition.projectId,
          ...(item === stage ? { 'aria-current': 'page' } : {}),
        },
        text: STAGE_LABELS[item],
      }),
    ),
  );
}

export function canonicalProjectMain({ project, definition, stage, latestSnapshot }) {
  const validStage = resolveProjectStage(definition.projectId, stage) ? stage : 'scan-evidence';
  const host = el('main', {
    className: 'screen canonical-project-host',
    attrs: {
      'data-canonical-project-host': definition.projectId,
      'data-canonical-stage': validStage,
      'data-local-record-id': project.localRecordId,
    },
  }, [
    el('div', { className: 'canonical-project-heading' }, [
      el('div', {}, [
        el('p', { className: 'canonical-stage-kicker', text: 'HOME / PROJECT LIBRARY → PROJECT' }),
        el('h1', { attrs: { id: 'screen-heading', tabindex: '-1' }, text: definition.displayName }),
        el('p', { text: 'Project identity stays fixed while the requested stage changes.' }),
      ]),
      el('button', {
        attrs: { type: 'button', 'data-action': 'back-to-begin' },
        text: 'PROJECT LIBRARY',
      }),
    ]),
    buildNav(definition, validStage),
    el('p', {
      className: 'canonical-host-status',
      attrs: { 'data-canonical-host-status': 'true' },
      text: definition.hostMode === 'review-child'
        ? 'Preserved project child · System host owns identity and owner-record custody.'
        : 'System-native project.',
    }),
    el('section', { className: 'canonical-stage-summary', attrs: { 'data-canonical-summary': 'true' } }),
    el('iframe', {
      className: 'canonical-child-frame',
      attrs: {
        src: definition.entryArtifact,
        title: definition.displayName,
        'data-canonical-child-frame': definition.projectId,
        loading: 'eager',
      },
    }),
  ]);
  host.__stbInitialSnapshot = latestSnapshot?.payload ?? latestSnapshot ?? null;
  return host;
}

export function deactivateCanonicalProjectHost(root) {
  const ctx = ACTIVE.get(root);
  if (!ctx) return;
  if (ctx.messageHandler) window.removeEventListener('message', ctx.messageHandler);
  ACTIVE.delete(root);
}

export function activateCanonicalProjectHost(root, { project, definition, stage, latestSnapshot }) {
  deactivateCanonicalProjectHost(root);
  const host = root.querySelector('[data-canonical-project-host="' + definition.projectId + '"]');
  const frame = host?.querySelector('[data-canonical-child-frame]');
  const status = host?.querySelector('[data-canonical-host-status]');
  if (!host || !frame || !status) return null;
  const ctx = {
    root,
    host,
    frame,
    status,
    project,
    definition,
    stage: resolveProjectStage(definition.projectId, stage) ? stage : 'scan-evidence',
    snapshot: latestSnapshot?.payload ?? latestSnapshot ?? host.__stbInitialSnapshot ?? null,
    lastFingerprint: latestSnapshot?.payload?.payload
      ? fnv1a(JSON.stringify(latestSnapshot.payload.payload))
      : null,
    messageHandler: null,
  };
  ctx.messageHandler = async (event) => {
    if (event.origin !== window.location.origin || event.source !== frame.contentWindow) return;
    const data = event.data || {};
    try {
      if (data.type === 'STB_PROOF_RETURN_LIBRARY') {
        window.history.pushState({ path: '/begin' }, '', '/begin');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return;
      }
      if (data.type === 'STB_PROOF_OPEN_JOB1') {
        status.textContent = 'Start Your Own remains a separate project identity. Return to the Project Library to open or create it.';
        return;
      }
      if (data.type === 'STB_START_OWN_CONFIRMED') {
        const storeHandoff = createComparisonStoreHandoff('start-own', data.payload);
        await persist(ctx, { ...clean(data.payload), storeHandoff }, data.type);
        setStage(ctx, 'store-answer', { updateHistory: true });
        return;
      }
      if (data.type === 'STB_OUTDOOR_CONFIRMED') {
        const storeHandoff = createComparisonStoreHandoff('outdoor', data.payload);
        await persist(ctx, { ...clean(data.payload), storeHandoff }, data.type);
        setStage(ctx, 'store-answer', { updateHistory: true });
        return;
      }
      if (data.type === 'stb-window-seat-guided-stage') {
        const next = canonicalStageForWindowSeatTechnical(data.stage);
        if (data.snapshot) await persist(ctx, data.snapshot, data.type + ':' + String(data.stage));
        if (next) setStage(ctx, next, { updateHistory: next !== ctx.stage });
      }
    } catch (error) {
      status.textContent = 'Owner-record capture failed: ' + error.message;
    }
  };
  window.addEventListener('message', ctx.messageHandler);
  frame.addEventListener('load', () => bindFrame(ctx), { once: true });
  ACTIVE.set(root, ctx);
  renderNav(ctx);
  renderSummary(ctx);
  frame.hidden = !frameShouldShow(ctx);
  return ctx;
}

export function switchCanonicalProjectStage(root, stage) {
  const ctx = ACTIVE.get(root);
  if (!ctx) return false;
  const changed = stage !== ctx.stage;
  const ok = setStage(ctx, stage, { updateHistory: changed });
  if (ok && ctx.definition.projectId === 'alcove' && stage === 'store-answer') {
    persist(ctx, alcoveSnapshot(ctx), 'alcove-store-answer-view').catch((error) => {
      ctx.status.textContent = 'Owner-record capture failed: ' + error.message;
    });
  }
  return ok;
}
