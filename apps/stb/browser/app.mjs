import { FIXED_ORIGIN, ROUTES, projectHref } from '/shared/contracts.mjs';
import { ALCOVE_CLASS_ID } from '/shared/alcove-rule.mjs';
import { sha256Hex } from '/shared/canonical.mjs';
import { commitPreparedChange, getDraft } from '/data/repository.mjs';
import { attemptInspection, blobCustody, projectIndex } from '/data/selectors.mjs';
import { navigate, startShell } from '/ui/shell.mjs';
import { startNarrativeLayer } from '/ui/narrative.mjs';
import { startOpenDoorLayer } from '/ui/open-door.mjs';
import { startFutureChainLayer } from '/ui/future-chain.mjs';
import { startClosingPairPlaceholder } from '/ui/closing-pair.mjs';
import { startProjectConfigurator } from '/ui/project-configurator.mjs';
import { startAlcoveBackControls } from '/ui/alcove-back-controls.mjs';
import { startControlledEntryLayer } from '/ui/controlled-entry-layer.mjs';

const ALCOVE_RUN_PROJECT_KEY = 'stb:alcove-run-project';
const ALCOVE_RUN_TARGET_KEY = 'stb:alcove-run-target';
const ALCOVE_RUN_STOCK_KEY = 'stb:alcove-run-stock';
const ALCOVE_RUN_STEPS = Object.freeze([
  ['landing', '01', 'Landing'],
  ['define', '02', 'Define'],
  ['store', '03', 'Store'],
  ['review', '04', 'Review'],
  ['request', '05', 'Request'],
  ['response', '06', 'Yard'],
  ['terms', '07', 'Terms'],
  ['next', '08', 'Next'],
  ['recap', '09', 'Recap'],
  ['record', '10', 'Record'],
]);

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

function addBackstopStyle() {
  if (document.getElementById('stb-backstop-style')) return;
  const style = document.createElement('style');
  style.id = 'stb-backstop-style';
  style.textContent = `
    .stb-backstop{display:flex;gap:8px;margin-top:14px;padding-top:10px;border-top:1px solid #e3ded7}
    .stb-backstop button{font:inherit;padding:7px 12px;border-radius:7px;border:1px solid #e3ded7;background:#faf9f7;color:#1c1917;cursor:pointer}
    .stb-run-nav{display:flex;align-items:center;gap:2px;overflow-x:auto;white-space:nowrap;margin:0 0 10px;padding:5px 7px;border:1px solid #e3ded7;border-radius:8px;background:#faf9f7;scrollbar-width:thin}
    .stb-run-nav .stb-run-label{font-size:8.5px;font-weight:700;letter-spacing:.09em;color:#8a8580;padding:4px 7px 4px 3px}
    .stb-run-nav a,.stb-run-nav button,.stb-run-nav span.stb-run-disabled{font:inherit;font-size:10px;line-height:1;padding:5px 7px;border:0;border-radius:5px;background:transparent;color:#8a8580;text-decoration:none;cursor:pointer}
    .stb-run-nav a:hover,.stb-run-nav button:hover{background:#f4f2ef;color:#57534e}
    .stb-run-nav .stb-run-current{background:#f6efe4;color:#7a4f22;font-weight:700}
    .stb-run-nav span.stb-run-disabled{opacity:.38;cursor:default}
    .stb-run-num{font-size:8px;margin-right:3px;color:inherit}
    .oe-foot button.stb-light-next{margin-left:auto;padding:4px 3px;border:0;background:transparent;color:#8a8580;font-size:10.5px;font-weight:500;box-shadow:none}
    .oe-foot button.stb-light-next:hover{background:transparent;color:#7a4f22}
    @media(prefers-color-scheme:dark){
      .stb-backstop{border-color:#332f26}.stb-backstop button{background:#16150f;color:#f2efe8;border-color:#332f26}
      .stb-run-nav{background:#16150f;border-color:#332f26}.stb-run-nav a:hover,.stb-run-nav button:hover{background:#201d18;color:#d7d0c5}.stb-run-nav .stb-run-current{background:#262015;color:#e0ad74}
    }
  `;
  document.head.append(style);
}

function hasBackControl(screen) {
  if (screen.querySelector('[data-action="back"], [data-action^="back-"]')) return true;
  return [...screen.querySelectorAll('button,a')].some((control) =>
    /^back(?:\b|\s|$)/i.test(control.textContent?.trim() ?? ''),
  );
}

function ensureBackControls(root) {
  for (const screen of root.querySelectorAll('main[data-screen], .screen[data-screen]')) {
    if (screen.getAttribute('data-screen') === 'landing') continue;
    if (hasBackControl(screen) || screen.querySelector('[data-stb-backstop="true"]')) continue;
    const holder = document.createElement('div');
    holder.className = 'stb-backstop';
    holder.setAttribute('data-stb-backstop', 'true');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Back';
    button.setAttribute('data-stb-history-back', 'true');
    holder.append(button);
    screen.append(holder);
  }
}

function showClosingPage(host, page) {
  const shadow = host?.shadowRoot;
  if (!shadow) return;
  const sheets = [...shadow.querySelectorAll('.sheet')];
  if (sheets.length < 2) return;
  sheets[0].hidden = page !== 'next';
  sheets[1].hidden = page !== 'happened';
  host.dataset.closingPage = page;
  host.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setRunQuery(step) {
  const url = new URL(window.location.href);
  if (url.pathname !== ROUTES.project || url.searchParams.get('view') !== 'result') return;
  url.searchParams.set('run', step);
  window.history.replaceState({ path: `${url.pathname}${url.search}` }, '', `${url.pathname}${url.search}`);
}

function currentResultStage(root) {
  const closing = root.querySelector('[data-closing-pair-placeholder="true"]');
  if (closing && !closing.hidden) {
    return closing.dataset.closingPage === 'happened' ? 'recap' : 'next';
  }
  const title = root.querySelector('[data-order-exchange="alcove"] h2')?.textContent?.trim() ?? '';
  if (title === 'The yard came back') return 'response';
  if (title === 'Terms → settlement → queue') return 'terms';
  return 'request';
}

function currentRunStep(root) {
  if (window.location.pathname === ROUTES.landing || window.location.pathname === '/index.html') return 'landing';
  if (window.location.pathname !== ROUTES.project) return null;
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view') ?? 'hub';
  if (view === 'hub' || view === 'questions') return 'define';
  if (view === 'store') return 'store';
  if (view === 'confirm') return 'review';
  if (view === 'record') return 'record';
  if (view === 'result') return currentResultStage(root);
  return null;
}

function runHref(localRecordId, step) {
  if (step === 'landing') return ROUTES.landing;
  if (!localRecordId) return null;
  if (step === 'define') return projectHref(localRecordId, 'questions');
  if (step === 'store') return projectHref(localRecordId, 'store');
  if (step === 'review') return projectHref(localRecordId, 'confirm');
  if (step === 'record') return projectHref(localRecordId, 'record');
  return projectHref(localRecordId, 'result');
}

function renderRunNav(root, localRecordId) {
  root.querySelector('[data-stb-run-nav="true"]')?.remove();
  const current = currentRunStep(root);
  const nav = document.createElement('nav');
  nav.className = 'stb-run-nav';
  nav.setAttribute('data-stb-run-nav', 'true');
  nav.setAttribute('aria-label', 'Alcove walkthrough');

  const label = document.createElement('span');
  label.className = 'stb-run-label';
  label.textContent = 'ALCOVE RUN';
  nav.append(label);

  for (const [step, number, text] of ALCOVE_RUN_STEPS) {
    const href = runHref(localRecordId, step);
    const control = href ? document.createElement('a') : document.createElement('span');
    if (href) {
      control.href = href;
      control.setAttribute('data-stb-run-step', step);
      control.setAttribute('data-stb-run-project', localRecordId ?? '');
    } else {
      control.className = 'stb-run-disabled';
    }
    if (step === current) {
      control.classList.add('stb-run-current');
      control.setAttribute('aria-current', 'page');
    }
    const num = document.createElement('span');
    num.className = 'stb-run-num';
    num.textContent = number;
    control.append(num, document.createTextNode(text));
    nav.append(control);
  }

  const shell = root.querySelector('.app-shell');
  const primary = shell?.querySelector('.primary-nav');
  if (primary) {
    primary.before(nav);
    return;
  }
  const landing = root.querySelector('main[data-screen="landing"]');
  if (landing) landing.prepend(nav);
}

function projectIdFromLocationOrSession() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') ?? sessionStorage.getItem(ALCOVE_RUN_PROJECT_KEY);
}

function storedStockChoice(localRecordId) {
  if (!localRecordId) return null;
  return sessionStorage.getItem(`${ALCOVE_RUN_STOCK_KEY}:${localRecordId}`);
}

function rememberStockChoice(localRecordId, value) {
  if (!localRecordId || !value) return;
  sessionStorage.setItem(`${ALCOVE_RUN_STOCK_KEY}:${localRecordId}`, value);
}

function clearRunTarget() {
  sessionStorage.removeItem(ALCOVE_RUN_TARGET_KEY);
}

function setRunTarget(step) {
  sessionStorage.setItem(ALCOVE_RUN_TARGET_KEY, step);
}

function pendingRunTarget() {
  return sessionStorage.getItem(ALCOVE_RUN_TARGET_KEY);
}

function driveRunTarget(root, localRecordId, target) {
  if (!target || !['request', 'response', 'terms', 'next', 'recap'].includes(target)) return false;
  if (window.location.pathname !== ROUTES.project) return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('view') !== 'result' || params.get('id') !== localRecordId) return false;

  const closing = root.querySelector('[data-closing-pair-placeholder="true"]');
  if (closing && !closing.hidden) {
    const page = closing.dataset.closingPage === 'happened' ? 'recap' : 'next';
    if (page === target) {
      clearRunTarget();
      setRunQuery(target);
      return true;
    }
    if (page === 'recap') {
      closing.shadowRoot?.querySelector('[data-closing-action="previous"]')?.click();
      return false;
    }
    if (target === 'recap') {
      closing.shadowRoot?.querySelector('[data-closing-action="next"]')?.click();
      return false;
    }
    if (target === 'next') {
      clearRunTarget();
      setRunQuery('next');
      return true;
    }
    closing.shadowRoot?.querySelector('[data-closing-action="back"]')?.click();
    return false;
  }

  const exchange = root.querySelector('[data-order-exchange="alcove"]');
  if (!exchange) return false;
  const stage = currentResultStage(root);
  if (stage === target) {
    clearRunTarget();
    setRunQuery(target);
    return true;
  }

  if (target === 'request') {
    const action = stage === 'terms' ? 'back-response' : 'back-request';
    exchange.querySelector(`[data-oe-action="${action}"]`)?.click();
    return false;
  }

  if (target === 'response') {
    if (stage === 'terms') exchange.querySelector('[data-oe-action="back-response"]')?.click();
    else exchange.querySelector('[data-oe-action="send"]')?.click();
    return false;
  }

  if (stage === 'request') {
    exchange.querySelector('[data-oe-action="send"]')?.click();
    return false;
  }

  if (stage === 'response') {
    const terms = exchange.querySelector('[data-oe-action="terms"]');
    if (terms && !terms.disabled) {
      terms.click();
      return false;
    }
    const remembered = storedStockChoice(localRecordId);
    if (remembered) {
      exchange.querySelector(`[data-oe-stock="${remembered}"]`)?.click();
      return false;
    }
    exchange.querySelector('[data-oe-stock]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }

  if (stage === 'terms') {
    if (target === 'terms') {
      clearRunTarget();
      setRunQuery('terms');
      return true;
    }
    const launch = exchange.querySelector('[data-closing-launch="true"]');
    if (launch) launch.click();
    return false;
  }

  return false;
}

function ensureLightNextCue(root) {
  const exchange = root.querySelector('[data-order-exchange="alcove"]');
  if (!exchange) return;
  const foot = exchange.querySelector('.oe-foot');
  if (!foot || foot.querySelector('[data-stb-light-next="true"]')) return;
  const stage = currentResultStage(root);
  if (!['request', 'response'].includes(stage)) return;
  const target = stage === 'request' ? 'response' : 'terms';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'stb-light-next';
  button.textContent = 'Next →';
  button.setAttribute('data-stb-light-next', 'true');
  button.setAttribute('data-stb-run-next-target', target);
  button.setAttribute('aria-label', stage === 'request' ? 'Next — yard response' : 'Next — terms');
  const fine = foot.querySelector('.oe-fine');
  if (fine) fine.before(button);
  else foot.append(button);
}

let runNavSeq = 0;
async function ensureAlcoveRunNavigation(root) {
  const seq = ++runNavSeq;
  const landing = window.location.pathname === ROUTES.landing || window.location.pathname === '/index.html';
  const localRecordId = projectIdFromLocationOrSession();

  if (!localRecordId) {
    if (landing) renderRunNav(root, null);
    else root.querySelector('[data-stb-run-nav="true"]')?.remove();
    return;
  }

  const project = await projectIndex(localRecordId);
  if (seq !== runNavSeq) return;
  if (!project || project.classId !== ALCOVE_CLASS_ID) {
    if (landing) renderRunNav(root, null);
    else root.querySelector('[data-stb-run-nav="true"]')?.remove();
    return;
  }

  sessionStorage.setItem(ALCOVE_RUN_PROJECT_KEY, localRecordId);
  renderRunNav(root, localRecordId);
  ensureLightNextCue(root);

  const target = pendingRunTarget();
  if (target) driveRunTarget(root, localRecordId, target);
}

function ensureClosingNavigation(root) {
  const screen = root.querySelector('[data-screen="result"]');
  if (!screen) return;
  const host = screen.querySelector('[data-closing-pair-placeholder="true"]');
  if (!host?.shadowRoot) return;

  const exchange = screen.querySelector('[data-order-exchange="alcove"]');
  const heading = screen.querySelector('.screen-heading');
  if (exchange) {
    if (exchange.nextElementSibling !== host) exchange.after(host);
    host.hidden = screen.__stbClosingPairLaunched !== true;
  } else {
    if (heading && heading.nextElementSibling !== host) heading.after(host);
    host.hidden = false;
  }

  const shadow = host.shadowRoot;
  const sheets = [...shadow.querySelectorAll('.sheet')];
  if (sheets.length < 2) return;

  if (host.dataset.closingNavWired !== 'true') {
    host.dataset.closingNavWired = 'true';
    const style = document.createElement('style');
    style.textContent = `
      .closing-nav{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin-top:16px;padding-top:12px;border-top:1px solid var(--border)}
      .closing-nav button{font:inherit;font-size:12px;padding:7px 14px;border-radius:7px;cursor:pointer;border:1px solid var(--border);background:var(--bg);color:var(--text)}
      .closing-nav button.quiet-next{margin-left:auto;padding:4px 3px;border:0;background:transparent;color:var(--text-3);font-size:10.5px;font-weight:500}
      .closing-nav button.quiet-next:hover{color:var(--accent)}
      .closing-nav .fine{font-size:9.5px;color:var(--text-3);text-align:right}
      [hidden]{display:none!important}
    `;
    shadow.append(style);

    const nextNav = document.createElement('div');
    nextNav.className = 'closing-nav';
    nextNav.innerHTML = '<button type="button" data-closing-action="back">Back</button><span class="fine">Definition remains unchanged.</span><button type="button" class="quiet-next" data-closing-action="next" aria-label="Next — what happened">Next →</button>';
    sheets[0].append(nextNav);

    const happenedNav = document.createElement('div');
    happenedNav.className = 'closing-nav';
    happenedNav.innerHTML = '<button type="button" data-closing-action="previous">Back</button><span class="fine">End-of-project reference page.</span><button type="button" class="quiet-next" data-closing-action="record" aria-label="Next — owner record">Next →</button>';
    sheets[1].append(happenedNav);

    shadow.addEventListener('click', (event) => {
      const action = event.target.closest('[data-closing-action]')?.getAttribute('data-closing-action');
      if (!action) return;
      if (action === 'next') {
        setRunQuery('recap');
        showClosingPage(host, 'happened');
        return;
      }
      if (action === 'previous') {
        setRunQuery('next');
        showClosingPage(host, 'next');
        return;
      }
      if (action === 'record') {
        const localRecordId = projectIdFromLocationOrSession();
        if (localRecordId) navigate(projectHref(localRecordId, 'record'));
        return;
      }
      if (action === 'back') {
        const currentExchange = screen.querySelector('[data-order-exchange="alcove"]');
        if (currentExchange) {
          screen.__stbClosingPairLaunched = false;
          host.hidden = true;
          setRunQuery('terms');
          currentExchange.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        const confirm = screen.querySelector('[data-action="open-confirm"]');
        if (confirm) confirm.click();
        else if (window.history.length > 1) window.history.back();
        else window.location.assign('/');
      }
    });
  }

  const requestedRun = new URLSearchParams(window.location.search).get('run');
  if (exchange && (requestedRun === 'next' || requestedRun === 'recap')) {
    screen.__stbClosingPairLaunched = true;
    host.hidden = false;
    showClosingPage(host, requestedRun === 'recap' ? 'happened' : 'next');
  } else if (!host.hidden && host.dataset.closingPage !== 'happened') {
    showClosingPage(host, 'next');
  }

  if (exchange) {
    const title = exchange.querySelector('h2')?.textContent?.trim();
    const foot = exchange.querySelector('.oe-foot');
    if (title === 'Terms → settlement → queue' && foot && !foot.querySelector('[data-closing-launch="true"]')) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'stb-light-next';
      button.textContent = 'Next →';
      button.setAttribute('aria-label', 'Next — what happens next');
      button.setAttribute('data-closing-launch', 'true');
      const fine = foot.querySelector('.oe-fine');
      if (fine) fine.before(button);
      else foot.append(button);
    }
  } else if (screen.dataset.closingPairAutoShown !== 'true') {
    screen.dataset.closingPairAutoShown = 'true';
    queueMicrotask(() => showClosingPage(host, 'next'));
  }
}

function startCompletionNavigation(root) {
  addBackstopStyle();

  root.addEventListener('click', (event) => {
    const backstop = event.target.closest('[data-stb-history-back="true"]');
    if (backstop && root.contains(backstop)) {
      if (window.history.length > 1) window.history.back();
      else window.location.assign('/');
      return;
    }

    const stock = event.target.closest('[data-oe-stock]');
    if (stock && root.contains(stock)) {
      rememberStockChoice(projectIdFromLocationOrSession(), stock.getAttribute('data-oe-stock'));
    }

    const lightNext = event.target.closest('[data-stb-run-next-target]');
    if (lightNext && root.contains(lightNext)) {
      event.preventDefault();
      const target = lightNext.getAttribute('data-stb-run-next-target');
      const localRecordId = projectIdFromLocationOrSession();
      if (target && localRecordId) {
        setRunTarget(target);
        driveRunTarget(root, localRecordId, target);
      }
      return;
    }

    const runStep = event.target.closest('[data-stb-run-step]');
    if (runStep && root.contains(runStep)) {
      event.preventDefault();
      const step = runStep.getAttribute('data-stb-run-step');
      const localRecordId = runStep.getAttribute('data-stb-run-project') || projectIdFromLocationOrSession();
      const href = runStep.getAttribute('href');
      if (['request', 'response', 'terms', 'next', 'recap'].includes(step) && localRecordId) {
        setRunTarget(step);
        const params = new URLSearchParams(window.location.search);
        if (window.location.pathname === ROUTES.project && params.get('view') === 'result' && params.get('id') === localRecordId) {
          driveRunTarget(root, localRecordId, step);
        } else {
          navigate(projectHref(localRecordId, 'result'));
        }
        return;
      }
      clearRunTarget();
      if (href) navigate(new URL(href, window.location.origin).pathname + new URL(href, window.location.origin).search);
      return;
    }

    const launch = event.target.closest('[data-closing-launch="true"]');
    if (!launch || !root.contains(launch)) return;
    const screen = launch.closest('[data-screen="result"]');
    const host = screen?.querySelector('[data-closing-pair-placeholder="true"]');
    if (!screen || !host) return;
    screen.__stbClosingPairLaunched = true;
    host.hidden = false;
    setRunQuery('next');
    showClosingPage(host, 'next');
  });

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      ensureBackControls(root);
      ensureClosingNavigation(root);
      void ensureAlcoveRunNavigation(root);
    });
  };
  const observer = new MutationObserver(schedule);
  observer.observe(root, { childList: true, subtree: true });
  schedule();
}

const root = document.getElementById('app');
if (root) {
  startShell(root);
  startNarrativeLayer(root);
  startOpenDoorLayer(root);
  startFutureChainLayer(root);
  startClosingPairPlaceholder(root);
  startProjectConfigurator(root);
  startAlcoveBackControls(root);
  startControlledEntryLayer(root);
  startCompletionNavigation(root);
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
