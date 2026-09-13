import { getClassConfigurator } from '/shared/class-config.mjs';
import { ALCOVE_CLASS_ID } from '/shared/alcove-rule.mjs';
import { PICNIC_CLASS_ID } from '/shared/picnic-rule.mjs';
import { applyMappedConfiguration } from '/domain/configurator.mjs';
import { currentCandidate, currentProjection, projectIndex } from '/data/selectors.mjs';
import { renderProjectProjection } from '/ui/project-renderer.mjs';

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
    .config-parts{margin:7px 0 0;padding-left:20px;max-height:260px;overflow:auto}
    .config-parts li{margin:4px 0;font-size:12px}
    .project-renderer{margin-top:12px;border:1px solid #e3ded7;border-radius:10px;padding:12px;background:#fff}
    .project-renderer h3{font-size:12px;margin:0 0 8px;letter-spacing:.05em}
    .project-orthographic-svg{width:100%;height:auto;display:block;max-height:420px}
    .config-unresolved{margin:8px 0 0;padding-left:20px}
    .config-unresolved li{font-size:12px;margin:3px 0}
    .config-fixture{border-left:4px solid #a98255;padding-left:10px;margin:10px 0;color:#5f584f}
    @media(prefers-color-scheme:dark){
      .project-configurator{background:#211d17;border-color:#715a3c}
      .config-field,.config-engine-card,.project-renderer{background:#181613;border-color:#3c352c}
      .project-configurator .config-lead,.config-field small,.config-unit,.config-fixture{color:#c8c0b5}
      .config-field input{border-color:#4b4339}
    }
  `;
  document.head.append(style);
}

function currentRaw(candidate, key) {
  return candidate?.payload?.configuration?.inputs?.[key]?.raw ?? '';
}

function fieldNode(candidate, field) {
  const id = `config-${field.key}`;
  return node('div', { className: 'config-field' }, [
    node('label', { text: field.label, attrs: { for: id } }),
    node('input', {
      attrs: {
        id,
        type: 'text',
        inputmode: field.inputMode ?? 'text',
        autocomplete: 'off',
        value: currentRaw(candidate, field.key),
        'data-config-field': field.key,
      },
    }),
    node('span', { className: 'config-unit', text: field.unit ?? '' }),
    node('small', { text: field.help ?? '' }),
  ]);
}

function dimensionText(part) {
  if (part?.length?.canonical && part?.depth?.canonical && part?.thickness?.canonical) {
    return `${part.length.canonical} × ${part.depth.canonical} × ${part.thickness.canonical} in`;
  }
  if (part?.length?.canonical && part?.profile?.width?.canonical && part?.profile?.thickness?.canonical) {
    return `${part.length.canonical} in long · profile ${part.profile.width.canonical} × ${part.profile.thickness.canonical} in`;
  }
  return part?.length?.canonical ? `${part.length.canonical} in` : 'dimensions unresolved';
}

function alcoveSummary(payload) {
  const span = payload.derived?.span?.canonical ?? '—';
  const parts = payload.parts ?? [];
  return [
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
            node('li', { text: `${part.label}: ${dimensionText(part)} · ${part.quantity} ${part.quantityUnit}` }),
          ))
        : node('p', { className: 'hint', text: 'No current shelf blank occurrences.' }),
    ]),
    node('article', { className: 'config-engine-card' }, [
      node('h3', { text: 'MATERIAL / OPERATIONS' }),
      node('p', { text: payload.materialDemand ? `${payload.materialDemand.quantity} ${payload.materialDemand.quantityUnit} sheet-form blanks; material identity still unresolved.` : 'Material demand not available until geometry is complete.' }),
      node('p', { text: payload.operationRequirements?.sequence?.length ? `Reference sequence: ${payload.operationRequirements.sequence.join(' → ')}` : 'No reference operation sequence yet.' }),
      node('p', { className: 'hint', text: 'Reference operations are not an application-issued process plan or machine instruction.' }),
    ]),
  ];
}

function picnicSummary(payload) {
  const parts = payload.parts ?? [];
  const demand = payload.materialDemand;
  const derived = payload.derived ?? {};
  return [
    node('article', { className: 'config-engine-card' }, [
      node('h3', { text: 'DERIVATION' }),
      node('p', { text: payload.valid ? `Product length: ${payload.input?.productLength?.canonical ?? '—'} in` : `Stopped: ${payload.unresolvedReason ?? 'incomplete input'}` }),
      node('p', { text: derived.longitudinalMemberLength ? `Longitudinal member = L − 12 = ${derived.longitudinalMemberLength.canonical} in` : 'Longitudinal relation unavailable.' }),
      node('p', { text: derived.framePositions ? `End frames at ${derived.framePositions.a.canonical} in and ${derived.framePositions.b.canonical} in.` : 'Frame placement unavailable.' }),
      node('p', { text: derived.legLength ? `Fixture leg length remains ${derived.legLength.canonical} in.` : 'Fixture leg geometry unavailable.' }),
      node('p', { className: 'hint', text: `Fixture: ${payload.fixtureId ?? 'unidentified'} · Rule: ${payload.ruleVersion ?? 'unidentified'}` }),
    ]),
    node('article', { className: 'config-engine-card' }, [
      node('h3', { text: `PARTS · ${parts.length}` }),
      parts.length > 0
        ? node('ul', { className: 'config-parts' }, parts.map((part) =>
            node('li', { attrs: { 'data-config-part': part.occurrenceId ?? '' }, text: `${part.label}: ${dimensionText(part)} · ${part.operationNeeds?.join(', ') ?? 'operation unresolved'}` }),
          ))
        : node('p', { className: 'hint', text: 'No current fixture occurrences.' }),
    ]),
    node('article', { className: 'config-engine-card' }, [
      node('h3', { text: 'DEMAND / REQUIREMENTS' }),
      node('p', { text: demand ? `Synthetic dimensional demand: ${demand.totalInches} in total (${demand.totalFeet.toFixed(2)} ft) across ${parts.length} occurrences.` : 'Demand unavailable until the fixture input is valid.' }),
      node('p', { text: payload.operationRequirements?.required?.length ? `Application requirements: ${payload.operationRequirements.required.join(' · ')}` : 'Operation requirements unavailable.' }),
      node('p', { className: 'hint', text: 'No Store neutral sequence, engineering approval, hardware suitability, governed make path, or production release is claimed.' }),
    ]),
  ];
}

function engineSummary(projection) {
  const payload = projection?.payload ?? null;
  if (!payload) {
    return node('section', { className: 'config-engine', attrs: { 'data-config-engine': 'empty' } }, [
      node('h3', { text: 'ENGINE RESULT' }),
      node('p', { className: 'hint', text: 'Apply the bounded inputs to create the first derived revision.' }),
    ]);
  }
  const cards = payload.classId === ALCOVE_CLASS_ID
    ? alcoveSummary(payload)
    : payload.classId === PICNIC_CLASS_ID
      ? picnicSummary(payload)
      : [node('p', { className: 'hint', text: 'No registered summary for this class.' })];
  const unresolved = payload.unresolvedConditions ?? [];
  return node('section', { className: 'config-engine', attrs: { 'data-config-engine': payload.valid ? 'valid' : 'unresolved', 'data-config-class': payload.classId ?? '' } }, [
    node('div', { className: 'config-engine-grid' }, cards),
    unresolved.length > 0
      ? node('div', {}, [
          node('h3', { text: 'STILL UNRESOLVED' }),
          node('ul', { className: 'config-unresolved' }, unresolved.map((item) => node('li', { text: item }))),
        ])
      : null,
    renderProjectProjection(projection),
  ]);
}

function buildPanel(descriptor, candidate, projection, status = '') {
  return node('section', {
    className: 'project-configurator',
    attrs: {
      'data-project-configurator': descriptor.classId,
      'data-config-revision': candidate?.id ?? '',
    },
  }, [
    node('p', { className: 'narrative-kicker', text: descriptor.kicker }),
    node('h2', { text: descriptor.title }),
    node('p', { className: 'config-lead', text: descriptor.lead }),
    node('div', { className: 'config-grid' }, descriptor.fields.map((field) => fieldNode(candidate, field))),
    node('div', { className: 'config-actions' }, [
      node('button', { text: 'APPLY TO CANDIDATE', attrs: { type: 'button', 'data-config-action': 'apply' } }),
      ...descriptor.examples.map((example) =>
        node('button', {
          text: example.label,
          attrs: { type: 'button', 'data-config-action': 'example', 'data-config-example': example.id },
        }),
      ),
    ]),
    descriptor.exampleNote ? node('p', { className: 'config-fixture', text: descriptor.exampleNote }) : null,
    status ? node('p', { className: 'save-line', attrs: { 'data-config-status': 'true' }, text: status }) : null,
    engineSummary(projection),
  ]);
}

function readConfiguration(panel, descriptor) {
  const configuration = {};
  for (const field of descriptor.fields) {
    configuration[field.key] = panel.querySelector(`[data-config-field="${field.key}"]`)?.value ?? '';
  }
  return configuration;
}

let inFlight = false;
const statusByProject = new Map();
let renderToken = 0;

async function renderIntoScreen(root) {
  const token = ++renderToken;
  const screen = root.querySelector('[data-screen="questions"][data-class-id]');
  if (!screen) return;
  if (screen.querySelector('[data-project-configurator]')) return;
  const classId = screen.getAttribute('data-class-id');
  const descriptor = getClassConfigurator(classId);
  if (!descriptor) return;
  const localRecordId = screen.getAttribute('data-local-record-id');
  if (!localRecordId) return;
  const candidate = await currentCandidate(localRecordId);
  const projection = await currentProjection(localRecordId);
  if (token !== renderToken || !root.contains(screen)) return;
  const staleStatus = screen.querySelector('.handoff-status');
  if (staleStatus) {
    staleStatus.textContent = 'Registered class configurator is running as candidate application code. Store and production paths remain independent and unresolved unless an owning system actually answers them.';
  }
  const panel = buildPanel(descriptor, candidate, projection, statusByProject.get(localRecordId) ?? '');
  const firstPane = screen.querySelector('.source-pane');
  (firstPane ?? screen.querySelector('.screen-heading'))?.before(panel);
}

async function apply(root, panel, descriptor, basis, configuration) {
  if (inFlight) return;
  const screen = panel.closest('[data-screen="questions"]');
  const localRecordId = screen?.getAttribute('data-local-record-id');
  if (!localRecordId) return;
  const project = await projectIndex(localRecordId);
  if (!project) return;
  inFlight = true;
  statusByProject.set(localRecordId, 'Applying candidate revision…');
  try {
    await applyMappedConfiguration({
      localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      basis,
      configuration,
    });
    statusByProject.set(localRecordId, basis === 'manual-entry' ? 'Candidate revision applied.' : 'Declared reference/software fixture applied as an explicit choice.');
  } catch (error) {
    statusByProject.set(localRecordId, `Could not apply candidate: ${error.message}`);
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
    const classId = panel.getAttribute('data-project-configurator');
    const descriptor = getClassConfigurator(classId);
    if (!descriptor) return;
    const action = button.getAttribute('data-config-action');
    if (action === 'apply') {
      apply(root, panel, descriptor, 'manual-entry', readConfiguration(panel, descriptor));
      return;
    }
    if (action === 'example') {
      const exampleId = button.getAttribute('data-config-example');
      const example = descriptor.examples.find((entry) => entry.id === exampleId);
      if (!example) return;
      apply(root, panel, descriptor, example.basis, example.configuration);
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
