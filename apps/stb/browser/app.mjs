import { FIXED_ORIGIN } from '/shared/contracts.mjs';
import { sha256Hex } from '/shared/canonical.mjs';
import { commitPreparedChange, getDraft } from '/data/repository.mjs';
import { attemptInspection, blobCustody, currentCandidate, projectIndex } from '/data/selectors.mjs';
import { applyMappedConfiguration } from '/domain/configurator.mjs';
import { startShell } from '/ui/shell.mjs';
import { startNarrativeLayer } from '/ui/narrative.mjs';
import { startOpenDoorLayer } from '/ui/open-door.mjs';
import { startFutureChainLayer } from '/ui/future-chain.mjs';
import { startProjectConfigurator } from '/ui/project-configurator.mjs';

const PICNIC_CLASS_ID = 'classic-picnic-table-fixture';
const ALCOVE_CLASS_ID = 'alcove-shelf-blanks';
const FRONT_DOOR_AUTO_CLASS = 'stb-front-door-auto-class';
const FRONT_DOOR_PICNIC_SEED = 'stb-front-door-picnic-seed';

function setStatus(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
}

function probeIndexedDb() {
  return new Promise((resolve) => {
    if (typeof indexedDB !== 'object' || indexedDB === null) {
      resolve('unavailable');
      return;
    }
    const request = indexedDB.open('stb-capability-probe');
    request.onerror = () => resolve('unavailable');
    request.onsuccess = () => {
      request.result.close();
      indexedDB.deleteDatabase('stb-capability-probe');
      resolve('available');
    };
  });
}

export async function savePreparedChange(input) {
  setStatus('save-status', 'Saving…');
  try {
    const result = await commitPreparedChange(input);
    if (result.status === 'committed' || result.status === 'idempotent') {
      setStatus('save-status', 'Saved on this device');
      return result;
    }
    setStatus('save-status', 'Save failed');
    return result;
  } catch (error) {
    setStatus('save-status', 'Save failed');
    throw error;
  }
}

export async function inspectSource(sha256) {
  const custody = await blobCustody(sha256);
  if (custody.status === 'retained') {
    setStatus('source-status', 'Original retained');
  } else {
    setStatus('source-status', 'Original source unavailable');
  }
  return custody;
}

export async function inspectAttempt(localRecordId, attemptId) {
  const inspection = await attemptInspection(localRecordId, attemptId);
  if (inspection.status === 'interrupted') {
    setStatus('attempt-status', 'Interrupted historical attempt');
  } else if (inspection.status === 'historical') {
    setStatus('attempt-status', 'Historical attempt');
  } else {
    setStatus('attempt-status', 'Attempt unavailable');
  }
  return inspection;
}

export async function inspectUnapplied(localRecordId, draftId) {
  const draft = await getDraft(localRecordId, draftId);
  setStatus('unapplied-status', draft ? 'Unapplied changes' : 'none');
  return draft;
}

function installFrontDoorStyle() {
  if (document.getElementById('stb-front-door-visual-style')) return;
  const style = document.createElement('style');
  style.id = 'stb-front-door-visual-style';
  style.textContent = `
    .stb-front-door{margin:14px 0 20px}
    .stb-front-door h2{margin:0 0 6px;font-size:20px}
    .stb-front-door-lead{margin:0 0 13px;color:#57534e;line-height:1.5}
    .stb-project-doors{display:grid;grid-template-columns:repeat(4,minmax(125px,1fr));gap:10px}
    .stb-project-door{display:block;text-align:left;padding:0;border:1px solid #e3ded7;border-radius:11px;overflow:hidden;background:#fff;cursor:pointer;color:inherit}
    .stb-project-door:hover,.stb-project-door:focus-visible{border-color:#b89567;box-shadow:0 0 0 2px #f6efe4;outline:none}
    .stb-project-door svg{display:block;width:100%;height:auto;background:#faf9f7}
    .stb-project-door-copy{display:block;padding:8px 9px 10px}
    .stb-project-door-copy b{display:block;font-size:12px;line-height:1.25}
    .stb-project-door-copy span{display:block;margin-top:2px;font-size:10.5px;line-height:1.3;color:#8a8580}
    .stb-project-door[data-front-door='start-own']{border-color:#d9c3a2}
    .stb-front-door-status{margin:10px 0 0;padding:9px 11px;border-radius:8px;background:#f4f2ef;color:#57534e;font-size:12px}
    .screen-begin[data-front-door-mode='picnic']>.screen-heading,
    .screen-begin[data-front-door-mode='picnic']>.actor-help,
    .screen-begin[data-front-door-mode='picnic']>.current-project,
    .screen-begin[data-front-door-mode='picnic']>.start-card,
    .screen-begin[data-front-door-mode='picnic']>.saved-projects{display:none}
    .stb-picnic-chooser{margin:2px 0 20px}
    .stb-picnic-crumb{margin:0 0 8px;font-size:12px;color:#8a8580}
    .stb-picnic-crumb button{padding:0;border:0;background:transparent;color:#7a4f22;text-decoration:underline;cursor:pointer}
    .stb-picnic-chooser h1{margin:0 0 4px;font-size:24px}
    .stb-picnic-chooser>.sub{margin:0 0 16px;color:#57534e}
    .stb-picnic-copy{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0 0 14px}
    .stb-picnic-copy article{border:1px solid #e3ded7;border-radius:9px;padding:10px;background:#fff}
    .stb-picnic-copy h2{font-size:13px;margin:0 0 4px}
    .stb-picnic-copy p{font-size:12px;line-height:1.45;margin:0;color:#57534e}
    .stb-picnic-reason{margin:0 0 14px;padding:11px 12px;border-radius:9px;background:#f4f2ef;color:#57534e;font-size:12.5px;line-height:1.5}
    .stb-picnic-reason b{color:#1c1917}
    .stb-picnic-paths{display:grid;grid-template-columns:repeat(4,minmax(125px,1fr));gap:9px;margin-top:12px}
    .stb-picnic-path{padding:0;border:1px solid #e3ded7;border-radius:9px;overflow:hidden;background:#fff;color:inherit;text-align:left;cursor:pointer}
    .stb-picnic-path:hover,.stb-picnic-path:focus-visible{border-color:#b89567;box-shadow:0 0 0 2px #f6efe4;outline:none}
    .stb-picnic-path svg{display:block;width:100%;height:auto;background:#eef2e6}
    .stb-picnic-path-copy{display:block;padding:7px 8px 9px}
    .stb-picnic-path-copy b{display:block;font-size:11.5px;line-height:1.25}
    .stb-picnic-path-copy span{display:block;margin-top:2px;font-size:10px;line-height:1.3;color:#8a8580}
    .stb-picnic-glossary{margin-top:15px;border-top:1px solid #e3ded7;padding-top:10px}
    .stb-picnic-glossary summary{cursor:pointer;font-weight:650;font-size:12.5px}
    .stb-picnic-glossary dl{display:grid;grid-template-columns:120px 1fr;gap:5px 10px;margin:9px 0 0;font-size:12px}
    .stb-picnic-glossary dt{font-weight:650}.stb-picnic-glossary dd{margin:0;color:#57534e}
    .stb-picnic-choice-banner{margin:10px 0 14px;padding:11px 13px;border:1px solid #d9c3a2;border-radius:10px;background:#f6efe4}
    .stb-picnic-choice-banner b{display:block;font-size:13px}.stb-picnic-choice-banner span{display:block;margin-top:2px;font-size:11.5px;color:#57534e}
    @media(max-width:800px){.stb-project-doors,.stb-picnic-paths{grid-template-columns:repeat(2,minmax(120px,1fr))}.stb-picnic-copy{grid-template-columns:1fr}}
    @media(max-width:460px){.stb-project-doors,.stb-picnic-paths{grid-template-columns:1fr 1fr}}
    @media(prefers-color-scheme:dark){
      .stb-front-door-lead,.stb-picnic-chooser>.sub,.stb-picnic-copy p,.stb-picnic-reason,.stb-picnic-path-copy span,.stb-project-door-copy span,.stb-picnic-glossary dd,.stb-picnic-choice-banner span{color:#b4aea3}
      .stb-project-door,.stb-picnic-path,.stb-picnic-copy article{background:#1e1c16;border-color:#332f26}
      .stb-front-door-status,.stb-picnic-reason{background:#191711}
      .stb-picnic-choice-banner{background:#262015;border-color:#4d4130}
      .stb-picnic-reason b{color:#f2efe8}
    }
  `;
  document.head.append(style);
}

function projectSvg(kind) {
  if (kind === 'start-own') {
    return `<svg viewBox="0 0 100 72" aria-hidden="true"><defs><linearGradient id="stb-plank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d5430"/><stop offset=".5" stop-color="#5e3d1f"/><stop offset="1" stop-color="#432a14"/></linearGradient></defs><rect width="100" height="72" fill="#faf9f7"/><g transform="rotate(-25 50 34)"><rect x="12" y="27" width="20" height="13" rx="3" fill="#3b2412" stroke="#241408" stroke-width="1.1"/><path d="M32 27.5 L88 30 L88 37.5 L32 40 Z" fill="#dfe4e9" stroke="#8b959e"/><path d="M34 40 l3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4" fill="none" stroke="#7c868f" stroke-width="1.2"/></g><g transform="rotate(25 50 34)"><rect x="12" y="28" width="76" height="12" rx="2.5" fill="#efa919" stroke="#9c6c0a"/><rect x="40" y="31" width="20" height="6" rx="3" fill="#fbf7ec" stroke="#9c6c0a"/><circle cx="50" cy="34" r="2.2" fill="#8ed15a" stroke="#4e8a26"/></g><rect x="4" y="59" width="92" height="10" rx="2" fill="url(#stb-plank)"/></svg>`;
  }
  if (kind === 'alcove') {
    return `<svg viewBox="0 0 100 72" aria-hidden="true"><rect width="100" height="72" fill="#f3ece1"/><g transform="skewY(-7) translate(0 9)"><rect x="16" y="6" width="68" height="54" fill="#c89b62"/><rect x="20" y="10" width="60" height="46" fill="#e8d4b4"/><g fill="#c89b62"><rect x="20" y="22" width="60" height="3.5"/><rect x="20" y="36" width="60" height="3.5"/><rect x="20" y="50" width="60" height="3.5"/></g><rect x="16" y="6" width="68" height="54" fill="none" stroke="#9a7343" stroke-width="1.4"/></g></svg>`;
  }
  if (kind === 'window-seat') {
    return `<svg viewBox="0 0 100 72" aria-hidden="true"><rect width="100" height="72" fill="#efe6d8"/><rect x="4" y="4" width="92" height="64" fill="#dcbd8c"/><rect x="8" y="8" width="16" height="56" fill="#f0e2ca"/><rect x="76" y="8" width="16" height="56" fill="#f0e2ca"/><rect x="26" y="8" width="48" height="42" fill="#f5eee0"/><path d="M50 12 L70 24 L70 42 L50 48 L30 42 L30 24 Z" fill="#7ec0e8" stroke="#c89b62" stroke-width="3"/><rect x="28" y="50" width="44" height="8" rx="2.5" fill="#c0392b"/><rect x="26" y="58" width="48" height="6" fill="#e8d4b4"/></svg>`;
  }
  return `<svg viewBox="0 0 100 72" aria-hidden="true"><rect width="100" height="72" fill="#e7eddd"/><ellipse cx="50" cy="64" rx="44" ry="6" fill="#c3d3a8"/><path d="M27 27 L13 63 L20 63 L32 27 Z" fill="#a97c47" stroke="#7d5a30"/><path d="M33 27 L47 63 L40 63 L28 27 Z" fill="#b98b52" stroke="#7d5a30"/><path d="M67 27 L53 63 L60 63 L72 27 Z" fill="#a97c47" stroke="#7d5a30"/><path d="M73 27 L87 63 L80 63 L68 27 Z" fill="#b98b52" stroke="#7d5a30"/><rect x="23" y="44" width="54" height="4" fill="#9d7241"/><rect x="4" y="45" width="30" height="6" rx="1" fill="#c89b62" stroke="#8f6733"/><rect x="66" y="45" width="30" height="6" rx="1" fill="#c89b62" stroke="#8f6733"/><rect x="6" y="22" width="88" height="8" rx="1.5" fill="#dcae72" stroke="#8f6733"/></svg>`;
}

function picnicSvg(form, scope) {
  const framesOnly = scope === 'frame-kit';
  const col = '#C9A227';
  let body = '<rect width="96" height="60" fill="#eef2e6"/><ellipse cx="48" cy="50" rx="41" ry="4" fill="#cfdcbb"/>';
  if (form === 'attached-bench') {
    if (framesOnly) body += `<rect x="8" y="19" width="80" height="6" rx="1" fill="none" stroke="${col}" stroke-dasharray="4 3" opacity=".6"/><rect x="10" y="35" width="76" height="4" rx="1" fill="none" stroke="${col}" stroke-dasharray="4 3" opacity=".6"/>`;
    body += `<path d="M30 22 L20 50 L25 50 L34 22 Z" fill="${col}"/><path d="M34 22 L44 50 L39 50 L30 22 Z" fill="#B8931F"/><path d="M62 22 L52 50 L57 50 L66 22 Z" fill="${col}"/><path d="M66 22 L76 50 L71 50 L62 22 Z" fill="#B8931F"/><rect x="20" y="36" width="24" height="3" fill="${col}"/><rect x="52" y="36" width="24" height="3" fill="${col}"/>`;
    if (!framesOnly) body += '<rect x="10" y="35" width="76" height="4" rx="1" fill="#D9B43C"/><rect x="8" y="19" width="80" height="6" rx="1" fill="#E0BC55"/>';
  } else {
    if (framesOnly) body += `<rect x="26" y="19" width="44" height="6" rx="1" fill="none" stroke="${col}" stroke-dasharray="4 3" opacity=".6"/><rect x="4" y="36" width="18" height="4" rx="1" fill="none" stroke="${col}" stroke-dasharray="3 2" opacity=".6"/><rect x="74" y="36" width="18" height="4" rx="1" fill="none" stroke="${col}" stroke-dasharray="3 2" opacity=".6"/>`;
    else body += '<rect x="26" y="19" width="44" height="6" rx="1" fill="#E0BC55"/><rect x="4" y="36" width="18" height="4" rx="1" fill="#D9B43C"/><rect x="74" y="36" width="18" height="4" rx="1" fill="#D9B43C"/>';
    body += '<rect x="31" y="25" width="3.5" height="25" fill="#B8931F"/><rect x="61" y="25" width="3.5" height="25" fill="#B8931F"/><rect x="7" y="40" width="2.5" height="10" fill="#B8931F"/><rect x="17" y="40" width="2.5" height="10" fill="#B8931F"/><rect x="77" y="40" width="2.5" height="10" fill="#B8931F"/><rect x="87" y="40" width="2.5" height="10" fill="#B8931F"/>';
  }
  return `<svg viewBox="0 0 96 60" aria-hidden="true">${body}</svg>`;
}

function visualDoor({ kind, title, subtitle, action }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'stb-project-door';
  button.dataset.frontDoor = action;
  button.setAttribute('aria-label', `${title}. ${subtitle}`);
  button.innerHTML = `${projectSvg(kind)}<span class="stb-project-door-copy"><b>${title}</b><span>${subtitle}</span></span>`;
  return button;
}

function renderProjectDoors(screen) {
  if (screen.querySelector('[data-stb-project-doors]')) return;
  const section = document.createElement('section');
  section.className = 'stb-front-door';
  section.dataset.stbProjectDoors = 'true';
  section.innerHTML = '<h2>What are you making?</h2><p class="stb-front-door-lead">Start with a known project family when it fits. Otherwise bring the board, sketch, measurements, or file you already have.</p>';
  const doors = document.createElement('div');
  doors.className = 'stb-project-doors';
  doors.append(
    visualDoor({ kind: 'start-own', title: 'Start your own', subtitle: 'Board, sketch, or file', action: 'start-own' }),
    visualDoor({ kind: 'alcove', title: 'Critical fit', subtitle: 'Shelf insert', action: 'alcove' }),
    visualDoor({ kind: 'window-seat', title: 'Space utilization', subtitle: 'Window seat', action: 'window-seat' }),
    visualDoor({ kind: 'picnic', title: 'Outdoor build', subtitle: 'Picnic tables · to fit your space', action: 'picnic' }),
  );
  section.append(doors);
  const anchor = screen.querySelector('.screen-heading');
  if (anchor) anchor.after(section); else screen.prepend(section);
}

function picnicPathButton(form, scope, title, subtitle) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'stb-picnic-path';
  button.dataset.picnicForm = form;
  button.dataset.picnicScope = scope;
  button.setAttribute('aria-label', `${title}. ${subtitle}`);
  button.innerHTML = `${picnicSvg(form, scope)}<span class="stb-picnic-path-copy"><b>${title}</b><span>${subtitle}</span></span>`;
  return button;
}

function renderPicnicChooser(screen) {
  if (screen.querySelector('[data-stb-picnic-chooser]')) return;
  screen.dataset.frontDoorMode = 'picnic';
  const section = document.createElement('section');
  section.className = 'stb-picnic-chooser';
  section.dataset.stbPicnicChooser = 'true';
  section.innerHTML = `
    <p class="stb-picnic-crumb"><button type="button" data-front-door-back>Begin</button> › Picnic tables</p>
    <h1 id="screen-heading" tabindex="-1">Picnic tables</h1>
    <p class="sub">First choose the form. Then choose how much of the job you want the local system to provide.</p>
    <div class="stb-picnic-copy">
      <article><h2>Attached bench</h2><p>The familiar one-piece table. Seats belong to the same table frame.</p></article>
      <article><h2>Separate benches</h2><p>A table and two independent benches. This form is retained as a real choice; its bounded geometry still needs an admitted source.</p></article>
      <article><h2>Frames / hard parts</h2><p>The difficult frame geometry stays on the local side. Long straight boards stay visible as holder-supplied rather than disappearing from the definition.</p></article>
    </div>
    <div class="stb-picnic-reason"><b>Why frames only exists:</b> it is not just a discount. It lets a project remain coherent when the difficult geometry can be handled locally but long simple members are better sourced or cut by the holder. Store, machine, structural and commercial answers remain separate.</div>
    <p><b>Four doors, two decisions.</b> Form is one choice. Fulfillment scope is another.</p>
  `;
  const paths = document.createElement('div');
  paths.className = 'stb-picnic-paths';
  paths.append(
    picnicPathButton('attached-bench', 'complete-part-set', 'Attached bench', 'Complete cut-kit'),
    picnicPathButton('attached-bench', 'frame-kit', 'Attached · frames', 'You supply long boards'),
    picnicPathButton('separate-benches', 'complete-part-set', 'Separate benches', 'Complete cut-kit'),
    picnicPathButton('separate-benches', 'frame-kit', 'Separate · frames', 'You supply long boards'),
  );
  section.append(paths);
  const glossary = document.createElement('details');
  glossary.className = 'stb-picnic-glossary';
  glossary.innerHTML = '<summary>What the words mean</summary><dl><dt>A-frame</dt><dd>The splayed leg/frame assembly that carries the table.</dd><dt>Frames only</dt><dd>The frame/hard-part request. Long straight members remain holder-supplied.</dd><dt>Cut list</dt><dd>Part names, lengths and counts that keep the complete definition visible across the fulfillment split.</dd><dt>Budgetary estimate</dt><dd>A planning number, not a quote, reservation, order or production release.</dd><dt>Kerf</dt><dd>The width of material removed by a saw cut. No kerf assumption from the donor is promoted here.</dd></dl>';
  section.append(glossary);
  screen.prepend(section);
  queueMicrotask(() => section.querySelector('#screen-heading')?.focus());
}

function returnToBegin() {
  window.history.pushState({ path: '/begin' }, '', '/begin');
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function openPicnicChooser() {
  window.history.pushState({ path: '/begin?family=picnic' }, '', '/begin?family=picnic');
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function triggerMappedClass(root, classId) {
  sessionStorage.setItem(FRONT_DOOR_AUTO_CLASS, classId);
  advanceMappedClass(root);
}

function advanceMappedClass(root) {
  const classId = sessionStorage.getItem(FRONT_DOOR_AUTO_CLASS);
  if (!classId) return false;
  const target = [...root.querySelectorAll('[data-action="choose-mapped"]')]
    .find((button) => button.getAttribute('data-class-id') === classId);
  if (target) {
    sessionStorage.removeItem(FRONT_DOOR_AUTO_CLASS);
    target.click();
    return true;
  }
  const expand = root.querySelector('[data-action="expand-mapped"][aria-expanded="false"]');
  if (expand) {
    expand.click();
    return true;
  }
  return false;
}

let picnicSeedInFlight = false;

async function seedPicnicChoice(root) {
  const raw = sessionStorage.getItem(FRONT_DOOR_PICNIC_SEED);
  const screen = root.querySelector(`main[data-screen="questions"][data-class-id="${PICNIC_CLASS_ID}"]`);
  if (!raw || !screen || picnicSeedInFlight) return false;
  let seed;
  try {
    seed = JSON.parse(raw);
  } catch {
    sessionStorage.removeItem(FRONT_DOOR_PICNIC_SEED);
    return false;
  }
  const localRecordId = screen.getAttribute('data-local-record-id');
  if (!localRecordId) return false;
  const candidate = await currentCandidate(localRecordId);
  const existingForm = candidate?.payload?.configuration?.inputs?.tableForm?.raw ?? '';
  const existingScope = candidate?.payload?.configuration?.inputs?.requestedScope?.raw ?? '';
  if (existingForm || existingScope) {
    sessionStorage.removeItem(FRONT_DOOR_PICNIC_SEED);
    return false;
  }
  const project = await projectIndex(localRecordId);
  if (!project) return false;
  picnicSeedInFlight = true;
  try {
    await applyMappedConfiguration({
      localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      basis: 'front-door-picnic-choice',
      configuration: {
        tableForm: seed.form,
        requestedScope: seed.scope,
        productLength: '',
        materialPreference: '',
      },
    });
    sessionStorage.removeItem(FRONT_DOOR_PICNIC_SEED);
    window.dispatchEvent(new PopStateEvent('popstate'));
    return true;
  } finally {
    picnicSeedInFlight = false;
  }
}

function formatPicnicForm(raw) {
  return raw === 'separate-benches' ? 'Separate benches' : raw === 'attached-bench' ? 'Attached bench' : raw || 'Form unresolved';
}

function formatPicnicScope(raw) {
  return raw === 'frame-kit' ? 'Frames / hard parts only' : raw === 'complete-part-set' ? 'Complete cut-kit' : raw || 'Scope unresolved';
}

function renderPicnicChoiceBanner(root) {
  const panel = root.querySelector(`[data-project-configurator="${PICNIC_CLASS_ID}"]`);
  if (!panel || panel.querySelector('[data-picnic-choice-banner]')) return;
  const form = panel.querySelector('[data-config-field="tableForm"]')?.value ?? '';
  const scope = panel.querySelector('[data-config-field="requestedScope"]')?.value ?? '';
  if (!form && !scope) return;
  const banner = document.createElement('div');
  banner.className = 'stb-picnic-choice-banner';
  banner.dataset.picnicChoiceBanner = 'true';
  banner.innerHTML = `<b>${formatPicnicForm(form)} · ${formatPicnicScope(scope)}</b><span>These are holder choices. Store support, structural suitability, machine support and fabrication authority remain separate answers.</span>`;
  const lead = panel.querySelector('.config-lead');
  if (lead) lead.after(banner); else panel.prepend(banner);
}

function renderFrontDoor(root) {
  const begin = root.querySelector('main.screen-begin');
  if (begin) {
    const family = new URLSearchParams(window.location.search).get('family');
    if (family === 'picnic') {
      renderPicnicChooser(begin);
    } else {
      begin.removeAttribute('data-front-door-mode');
      renderProjectDoors(begin);
    }
  }
  advanceMappedClass(root);
  seedPicnicChoice(root).catch(() => {});
  renderPicnicChoiceBanner(root);
}

function startFrontDoorVisualLayer(root) {
  installFrontDoorStyle();
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      renderFrontDoor(root);
    });
  };
  const observer = new MutationObserver(schedule);
  observer.observe(root, { childList: true, subtree: true });
  window.addEventListener('popstate', schedule);
  root.addEventListener('click', (event) => {
    const back = event.target.closest('[data-front-door-back]');
    if (back) {
      returnToBegin();
      return;
    }
    const picnicPath = event.target.closest('[data-picnic-form][data-picnic-scope]');
    if (picnicPath) {
      sessionStorage.setItem(FRONT_DOOR_PICNIC_SEED, JSON.stringify({
        form: picnicPath.getAttribute('data-picnic-form'),
        scope: picnicPath.getAttribute('data-picnic-scope'),
      }));
      triggerMappedClass(root, PICNIC_CLASS_ID);
      return;
    }
    const door = event.target.closest('[data-front-door]');
    if (!door) {
      if (event.target.closest('[data-action="switch-cancel"]')) {
        sessionStorage.removeItem(FRONT_DOOR_PICNIC_SEED);
      }
      return;
    }
    const action = door.getAttribute('data-front-door');
    if (action !== 'picnic') sessionStorage.removeItem(FRONT_DOOR_PICNIC_SEED);
    if (action === 'start-own') {
      root.querySelector('[data-action="start-own"]')?.click();
      return;
    }
    if (action === 'alcove') {
      triggerMappedClass(root, ALCOVE_CLASS_ID);
      return;
    }
    if (action === 'picnic') {
      openPicnicChooser();
      return;
    }
    if (action === 'window-seat') {
      const host = door.closest('.stb-front-door');
      let status = host?.querySelector('.stb-front-door-status');
      if (!status && host) {
        status = document.createElement('p');
        status.className = 'stb-front-door-status';
        host.append(status);
      }
      if (status) status.textContent = 'Window-seat imagery is retained as a planned project-family door. No current mapped window-seat class is registered, so no candidate is created.';
    }
  });
  schedule();
}

const root = document.getElementById('app');
if (root) {
  startShell(root);
  startNarrativeLayer(root);
  startOpenDoorLayer(root);
  startFutureChainLayer(root);
  startProjectConfigurator(root);
  startFrontDoorVisualLayer(root);
}

setStatus('origin-status', window.location.origin === FIXED_ORIGIN ? FIXED_ORIGIN : window.location.origin);
setStatus(
  'storage-origin-status',
  window.location.origin === FIXED_ORIGIN
    ? `Product origin ${FIXED_ORIGIN}`
    : `This origin (${window.location.origin}) is not ${FIXED_ORIGIN}. Local records for the product origin are not visible here. They were not deleted.`,
);
setStatus('blob-status', typeof Blob === 'function' ? 'available' : 'unavailable');

probeIndexedDb().then((status) => setStatus('indexeddb-status', status));

sha256Hex(new TextEncoder().encode('stb-build0-capability'))
  .then((hex) => setStatus('sha256-status', hex))
  .catch(() => setStatus('sha256-status', 'unavailable'));
