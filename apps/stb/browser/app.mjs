import { FIXED_ORIGIN } from '/shared/contracts.mjs';
import { sha256Hex } from '/shared/canonical.mjs';
import { commitPreparedChange, getDraft } from '/data/repository.mjs';
import { attemptInspection, blobCustody } from '/data/selectors.mjs';
import { startShell } from '/ui/shell.mjs';
import { startNarrativeLayer } from '/ui/narrative.mjs';
import { startOpenDoorLayer } from '/ui/open-door.mjs';
import { startFutureChainLayer } from '/ui/future-chain.mjs';
import { startClosingPairPlaceholder } from '/ui/closing-pair.mjs';
import { startProjectConfigurator } from '/ui/project-configurator.mjs';
import { startAlcoveBackControls } from '/ui/alcove-back-controls.mjs';
import { startControlledEntryLayer } from '/ui/controlled-entry-layer.mjs';

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
    @media(prefers-color-scheme:dark){.stb-backstop{border-color:#332f26}.stb-backstop button{background:#16150f;color:#f2efe8;border-color:#332f26}}
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
      .closing-nav button.primary{background:var(--tint);border-color:var(--border-accent);color:var(--accent);font-weight:600}
      .closing-nav .fine{margin-left:auto;font-size:9.5px;color:var(--text-3);text-align:right}
      [hidden]{display:none!important}
    `;
    shadow.append(style);

    const nextNav = document.createElement('div');
    nextNav.className = 'closing-nav';
    nextNav.innerHTML = '<button type="button" class="primary" data-closing-action="next">NEXT — WHAT HAPPENED</button><button type="button" data-closing-action="back">Back</button><span class="fine">Definition remains unchanged.</span>';
    sheets[0].append(nextNav);

    const happenedNav = document.createElement('div');
    happenedNav.className = 'closing-nav';
    happenedNav.innerHTML = '<button type="button" data-closing-action="previous">Back</button><span class="fine">End-of-project reference page.</span>';
    sheets[1].append(happenedNav);

    shadow.addEventListener('click', (event) => {
      const action = event.target.closest('[data-closing-action]')?.getAttribute('data-closing-action');
      if (!action) return;
      if (action === 'next') {
        showClosingPage(host, 'happened');
        return;
      }
      if (action === 'previous') {
        showClosingPage(host, 'next');
        return;
      }
      if (action === 'back') {
        const currentExchange = screen.querySelector('[data-order-exchange="alcove"]');
        if (currentExchange) {
          screen.__stbClosingPairLaunched = false;
          host.hidden = true;
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

  if (host.dataset.closingPage !== 'happened') showClosingPage(host, 'next');

  if (exchange) {
    const title = exchange.querySelector('h2')?.textContent?.trim();
    const foot = exchange.querySelector('.oe-foot');
    if (title === 'Terms → settlement → queue' && foot && !foot.querySelector('[data-closing-launch="true"]')) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'go';
      button.textContent = 'NEXT — WHAT HAPPENS NEXT';
      button.setAttribute('data-closing-launch', 'true');
      foot.prepend(button);
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
    const launch = event.target.closest('[data-closing-launch="true"]');
    if (!launch || !root.contains(launch)) return;
    const screen = launch.closest('[data-screen="result"]');
    const host = screen?.querySelector('[data-closing-pair-placeholder="true"]');
    if (!screen || !host) return;
    screen.__stbClosingPairLaunched = true;
    host.hidden = false;
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
