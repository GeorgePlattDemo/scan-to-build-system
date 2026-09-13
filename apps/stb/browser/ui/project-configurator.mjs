import {
  ALCOVE_CLASS_ID,
  ALCOVE_REFERENCE_EXAMPLE,
} from '/shared/alcove-rule.mjs';
import { applyMappedConfiguration } from '/domain/configurator.mjs';
import { currentCandidate, currentProjection, projectIndex } from '/data/selectors.mjs';
import { renderProjectProjection } from '/ui/project-renderer.mjs';

const FIELDS = Object.freeze([
  ['openingWidth', 'Opening clear width', 'in', 'Measured clear width between the two support locations.'],
  ['leftSupport', 'Left support thickness', 'in', 'Deducted from the opening. No hidden allowance is added.'],
  ['rightSupport', 'Right support thickness', 'in', 'Deducted from the opening. No hidden allowance is added.'],
  ['blankDepth', 'Shelf blank depth', 'in', 'Candidate blank depth. This does not establish installed clearance.'],
  ['blankThickness', 'Shelf blank thickness', 'in', 'Candidate blank thickness. Structural adequacy is not evaluated here.'],
  ['shelfCount', 'Shelf count', 'ea', 'Number of separate candidate blank occurrences.'],
]);

function node(tag, { className, text, attrs } = {}, children = []) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      if (value !== undefined && value !== null) {
        element.setAttribute(name, String(value));
        if (name === 'value' && 'value' in element) element.value = value;
      }
    }
  }
  for (const child of children) if (child) element.append(child);
  return element;
}

function installStyle() {
  if (document.getElementById('stb-project-configurator-style')) return;
  const style = document.createElement('style');
  style.id = 'stb-project-configurator-style';
  style.textContent = `
    .project-configurator{margin:12px 0 18px;border:2px solid #cbb28d;border-radius:14px;padding:16px;background:#fffdf9}
    .project-configurator h2{margin:0 0 5px;font-size:20px}
    .project-configurator .config-lead{margin:0 0 14px;color:#5f584f;line-height:1.5}
    .config-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}
    .config-field{display:grid;gap:4px;border:1px solid #e3ded7;border-radius:10px;padding:10px;background:#fff}
    .config-field label{font-size:12px;font-weight:650}
    .config-field input{font:inherit;padding:8px;border:1px solid #cfc8bf;border-radius:7px;background:inherit;color:inherit}
    .config-field small{font-size:11px;color:#6b645c;line-height:1.35}
    .config-unit{font-size:11px;color:#7a7168}
    .config-actions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
    .config-actions button{padding:9px 12px}
    .config-engine{margin-top:14px;border-top:1px solid #ded7ce;padding-top:14px}
    .config-engine-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px}
    .config-engine-card{border:1px solid #e3ded7;border-radius:10px;padding:10px;background:#fff}
    .config-engine-card h3{font-size:12px;margin:0 0 5px;letter-spacing:.04em}
    .config-engine-card p{margin:3px 0;font-size:12px;line-height:1.4}
    .config-parts{margin:7px 0 0;padding-left:20px}
    .config-parts li{margin:4px 0;font-size:12px}
    .project-renderer{margin-top:12px;border:1px solid #e3ded7;border-radius:10px;padding:12px;background:#fff}
    .project-renderer h3{font-size:12px;margin:0 0 8px;letter-spacing:.05em}
    .project-orthographic-svg{width:100%;height:auto;display:block;max-height:360px}
    .config-unresolved{margin:8px 0 0;padding-left:20px}
    .config-unresolved li{font-size:12px;margin:3px 0}
    @media(prefers-color-scheme:dark){
      .project-configurator{background:#211d17;border-color:#715a3c}
      .config-field,.config-engine-card,.project-renderer{background:#181613;border-color:#3c352c}
      .project-configurator .config-lead,.config-field small,.config-unit{color:#c8c0b5}
      .config-field input{border-color:#4b4339}
    }
  `;
  document.head.append(style);
}

function currentRaw(candidate, key) {
  return candidate?.payload?.configuration?.inputs?.[key]?.raw ?? '';
}

function fieldNode(candidate, [key, label, unit, help]) {
  const id = `config-${key}`;
  return node('div', { className: 'config-field' }, [
    node('label', { text: label, attrs: { for: id } }),
    node('input', {
      attrs: {
        id,
        type: 'text',
        inputmode: key === 'shelfCount' ? 'numeric' : 'decimal',
        autocomplete: 'off',
        value: currentRaw(candidate, key),
        'data-config-field': key,
      },
    }),
    node('span', { className: 'config-unit', text: unit }),
    node('small', { text: help }),
  ]);
}

function engineSummary(projection) {
  const payload = projection?.payload ?? null;
  if (!payload || payload.classId !== ALCOVE_CLASS_ID) {
    return node('section', { className: 'config-engine', attrs: { 'data-config-engine': 'empty' } }, [
      node('h3', { text: 'ENGINE RESULT' }),
      node('p', { className: 'hint', text: 'Apply the bounded inputs to create the first derived revision.' }),
    ]);
  }
  const span = payload.derived?.span?.canonical ?? '—';
  const parts = payload.parts ?? [];
  const unresolved = payload.unresolvedConditions ?? [];
  return node('section', { className: 'config-engine', attrs: { 'data-config-engine': payload.valid ? 'valid' : 'unresolved' } }, [
    node('div', { className: 'config-engine-grid' }, [
      node('article', { className: 'config-engine-card' }, [
        node('h3', { text: 'DERIVATION' }),
        node('p', { text: 'span = opening width − left support − right support' }),
        node('p', { text: payload.valid ? `Derived span: ${span} in` : `Stopped: ${payload.unresolvedReason ?? 'incomplete input'}` }),
        node('p', { className: 'hint', text: `Rule: ${payload.ruleVersion ?? 'unidentified'}` }),
      ]),
      node('article', { className: 'config-engine-card' }, [
        node('h3', { text: 'PARTS' }),
        parts.length > 0
          ? node('ul', { className: 'config-parts' }, parts.map((part) =>
              node('li', { text: `${part.label}: ${part.length.canonical} × ${part.depth.canonical} × ${part.thickness.canonical} in · ${part.quantity} ${part.quantityUnit}` }),
            ))
          : node('p', { className: 'hint', text: 'No current shelf blank occurrences.' }),
      ]),
      node('article', { className: 'config-engine-card' }, [
        node('h3', { text: 'MATERIAL / OPERATIONS' }),
        node('p', { text: payload.materialDemand ? `${payload.materialDemand.quantity} ${payload.materialDemand.quantityUnit} sheet-form blanks; material identity still unresolved.` : 'Material demand not available until geometry is complete.' }),
        node('p', { text: payload.operationRequirements?.sequence?.length ? `Reference sequence: ${payload.operationRequirements.sequence.join(' → ')}` : 'No reference operation sequence yet.' }),
        node('p', { className: 'hint', text: 'Reference operations are not an application-issued process plan or machine instruction.' }),
      ]),
    ]),
    unresolved.length > 0
      ? node('div', {}, [
          node('h3', { text: 'STILL UNRESOLVED' }),
          node('ul', { className: 'config-unresolved' }, unresolved.map((item) => node('li', { text: item }))),
        ])
      : null,
    renderProjectProjection(projection),
  ]);
}

function buildPanel(candidate, projection, status = '') {
  return node('section', {
    className: 'project-configurator',
    attrs: {
      'data-project-configurator': ALCOVE_CLASS_ID,
      'data-config-revision': candidate?.id ?? '',
    },
  }, [
    node('p', { className: 'narrative-kicker', text: 'Bounded project configurator · running candidate engine' }),
    node('h2', { text: 'ALCOVE SHELF BLANKS' }),
    node('p', {
      className: 'config-lead',
      text: 'These six inputs drive one deterministic candidate calculation. Nothing is silently defaulted. Applying a change creates a new candidate revision; it does not place an order or authorize fabrication.',
    }),
    node('div', { className: 'config-grid' }, FIELDS.map((field) => fieldNode(candidate, field))),
    node('div', { className: 'config-actions' }, [
      node('button', { text: 'APPLY TO CANDIDATE', attrs: { type: 'button', 'data-config-action': 'apply' } }),
      node('button', { text: 'USE PUBLISHED EXAMPLE', attrs: { type: 'button', 'data-config-action': 'reference' } }),
    ]),
    node('p', {
      className: 'hint',
      text: 'Published example is an explicit reference choice: 46.25 − 0.75 − 0.75 = 44.75 in; 3 blanks at 44.75 × 11.00 × 0.75 in. Structural span is not evaluated.',
    }),
    status ? node('p', { className: 'save-line', attrs: { 'data-config-status': 'true' }, text: status }) : null,
    engineSummary(projection),
  ]);
}

function readConfiguration(panel) {
  const configuration = {};
  for (const [key] of FIELDS) {
    configuration[key] = panel.querySelector(`[data-config-field="${key}"]`)?.value ?? '';
  }
  return configuration;
}

let inFlight = false;
let statusMessage = '';
let renderToken = 0;

async function renderIntoScreen(root) {
  const token = ++renderToken;
  const screen = root.querySelector(`[data-screen="questions"][data-class-id="${ALCOVE_CLASS_ID}"]`);
  if (!screen) return;
  if (screen.querySelector('[data-project-configurator]')) return;
  const localRecordId = screen.getAttribute('data-local-record-id');
  if (!localRecordId) return;
  const candidate = await currentCandidate(localRecordId);
  const projection = await currentProjection(localRecordId);
  if (token !== renderToken || !root.contains(screen)) return;
  const staleStatus = screen.querySelector('.handoff-status');
  if (staleStatus) {
    staleStatus.textContent = 'Registered class configurator is running as candidate application code. Store sheet-material and production paths remain unresolved.';
  }
  const panel = buildPanel(candidate, projection, statusMessage);
  const firstPane = screen.querySelector('.source-pane');
  (firstPane ?? screen.querySelector('.screen-heading'))?.before(panel);
}

async function apply(root, panel, basis) {
  if (inFlight) return;
  const screen = panel.closest('[data-screen="questions"]');
  const localRecordId = screen?.getAttribute('data-local-record-id');
  if (!localRecordId) return;
  const project = await projectIndex(localRecordId);
  if (!project) return;
  inFlight = true;
  statusMessage = 'Applying candidate revision…';
  const configuration = basis === 'published-reference-example'
    ? ALCOVE_REFERENCE_EXAMPLE
    : readConfiguration(panel);
  try {
    await applyMappedConfiguration({
      localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      basis,
      configuration,
    });
    statusMessage = basis === 'published-reference-example'
      ? 'Published example applied as an explicit reference choice.'
      : 'Candidate revision applied.';
  } catch (error) {
    statusMessage = `Could not apply candidate: ${error.message}`;
  } finally {
    inFlight = false;
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

export function startProjectConfigurator(root) {
  if (!root || root.dataset.projectConfigurator === 'true') return;
  root.dataset.projectConfigurator = 'true';
  installStyle();
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-config-action]');
    if (!button || !root.contains(button)) return;
    const panel = button.closest('[data-project-configurator]');
    if (!panel) return;
    const action = button.getAttribute('data-config-action');
    if (action === 'reference') {
      apply(root, panel, 'published-reference-example');
    } else if (action === 'apply') {
      apply(root, panel, 'manual-entry');
    }
  });
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      renderIntoScreen(root);
    });
  };
  const observer = new MutationObserver(schedule);
  observer.observe(root, { childList: true, subtree: true });
  schedule();
}
