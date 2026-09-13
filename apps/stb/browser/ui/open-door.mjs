import { INTAKE_CARDS, PUBLISHED_BOARD_SKU, STORE_PIN } from '/shared/contracts.mjs';
import { deriveS001CenteredArchGeometry } from '/shared/class-config.mjs';

const ACTIONS = Object.freeze([
  { id: 'board', label: 'Pick a board', detail: 'Start with one bounded part and a finished length.', child: 'board' },
  { id: 'need', label: 'Tell us what you want', detail: 'A sentence is enough to start.', child: 'measurements' },
  { id: 'measurements', label: 'Enter measurements', detail: 'Type what you took. Keep the units you used.', child: 'measurements' },
  { id: 'sketch', label: 'Add photos or a sketch', detail: 'JPEG or PNG can be kept and displayed.', child: 'sketch' },
  { id: 'scan', label: 'Scan a space', detail: 'Keep an existing scan; native interpretation is still planned.', child: 'scan' },
  { id: 'drawing', label: 'Attach a drawing or PDF', detail: 'Keep and display the PDF; no OCR or scale extraction is claimed.', child: 'drawing' },
  { id: 'takeoff', label: 'Add a takeoff or cut list', detail: 'Keep raw text and enter bounded rows without retyping unrelated job data.', child: 'takeoff' },
  { id: 'cad', label: 'CAD / BIM / structured file', detail: 'Keep the source even when this build cannot interpret it.', child: 'cad' },
  { id: 'unsure', label: 'I’m not sure', detail: 'Start with the need. Unknown is a valid state.', child: 'measurements' },
]);

const STORE_CANDIDATE_BASIS = '4402abeb6b0299a5b6db2eec85ed04c3b0236bcc';
const PUBLISHED_JOB_TRIAL_PATH = '/api/published-job';
const PUBLISHED_JOB_TRIAL_IDS = new Set(['rect-stencil', 'arched-opening']);
const PUBLISHED_STARTS = Object.freeze([
  Object.freeze({
    id: 'square-stick',
    label: 'Square 2×4',
    detail: 'One 72 in SPF 2×4. Change only the finished length.',
    basis: `${PUBLISHED_BOARD_SKU} · BOARD_SQUARE_V1`,
    defaults: 'Starts at 45 in. Published app slice: 24–60 in.',
    state: 'connected',
    button: 'TRY THIS SHAPE',
  }),
  Object.freeze({
    id: 'rect-stencil',
    label: 'Rectangular sheet stencil',
    detail: '3/4 in ACX-sanded sheet reference. Change only the blank length and width.',
    basis: 'STB-ZERO-PLY-075-48X96-001 · SHEET_MODE2_STENCIL_V1',
    defaults: 'Starts at 24 × 18 in. Store checks minimum blank size and parent-sheet bounds. Four retained tabs and 0.5 in route depth stay fixed.',
    state: 'candidate',
    button: 'ASK STORE',
    fields: Object.freeze([
      Object.freeze({ key: 'lengthIn', label: 'Length (in)', value: 24 }),
      Object.freeze({ key: 'widthIn', label: 'Width (in)', value: 18 }),
    ]),
  }),
  Object.freeze({
    id: 'arched-opening',
    label: 'Centered arched cutout in 1/2 in plywood',
    detail: 'One full 48 × 96 in sheet. Its 96 in axis runs left-to-right. Work is deliberately limited to the centered 48 × 36 in field.',
    basis: 'S001_CENTERED_ARCHED_SHEET_V0 · S001-CENTER-WORK-FIELD-V0 · SHEET_MODE2_ARCHED_APERTURE_V0',
    defaults: 'Starts at 36 in wide, 24 in straight side height, and 12 in arch rise. No edge routing outside the centered field.',
    state: 'candidate',
    button: 'ASK STORE',
    fields: Object.freeze([
      Object.freeze({ key: 'openingWidthIn', label: 'Opening width (in)', value: 36 }),
      Object.freeze({ key: 'straightHeightIn', label: 'Straight height (in)', value: 24 }),
      Object.freeze({ key: 'riseIn', label: 'Arch rise (in)', value: 12 }),
    ]),
  }),
]);

let pendingPublishedStart = null;

function node(tag, { className, text, attrs } = {}, children = []) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      if (value !== undefined && value !== null) element.setAttribute(name, String(value));
    }
  }
  for (const child of children) if (child) element.append(child);
  return element;
}

function installStyle() {
  if (document.getElementById('stb-open-door-style')) return;
  const style = document.createElement('style');
  style.id = 'stb-open-door-style';
  style.textContent = `
    .published-starts,.open-door{margin:14px 0 18px;padding:14px 16px;border:1px solid #d8d1c7;border-radius:12px;background:#fff}
    .published-starts h2,.open-door h2{margin:0 0 4px;font-size:17px}
    .published-starts>p,.open-door>p{margin:0 0 12px;color:#625c55;font-size:13px}
    .published-grid,.open-door-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px}
    .published-card,.open-door-action{display:block;width:100%;text-align:left;border:1px solid #e3ded7;border-radius:10px;padding:10px 12px;background:#fbfaf8;color:inherit}
    .open-door-action,.published-card button{cursor:pointer}
    .open-door-action:hover,.published-card button:hover{border-color:#b89a73}
    .open-door-action b,.published-card h3{display:block;font-size:13px;margin:0 0 3px}
    .open-door-action span,.published-card p{display:block;font-size:11.5px;line-height:1.4;color:#625c55;margin:3px 0}
    .published-card code{display:block;font-size:10px;line-height:1.35;white-space:normal;overflow-wrap:anywhere;margin:7px 0;color:#57534e}
    .published-card button{margin-top:8px;border:1px solid #cfc7bc;border-radius:999px;padding:6px 10px;background:#fff;color:inherit;font-size:10px;font-weight:700;letter-spacing:.04em}
    .published-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(95px,1fr));gap:7px;margin:9px 0 4px}
    .published-fields label{display:block;font-size:10px;color:#625c55}
    .published-fields input{box-sizing:border-box;width:100%;margin-top:3px;padding:6px 7px;border:1px solid #cfc7bc;border-radius:7px;background:#fff;color:inherit;font:inherit}
    .published-derived{font-size:10.5px!important;font-style:italic}
    .published-state,.open-door-status{display:inline-block;margin-top:6px;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#7a7168}
    .published-state.connected{color:#416b46}.published-state.candidate,.open-door-status.planned{color:#8b6a3f}
    .published-boundary{margin:10px 0 0!important;padding:10px 12px;border-left:4px solid #a98255;background:#fbfaf8}
    .published-active{margin:0 0 12px;padding:10px 12px;border:1px solid #d8d1c7;border-radius:10px;background:#fbfaf8}
    .published-active strong{display:block;margin-bottom:3px}.published-active span{display:block;font-size:11.5px;line-height:1.4;color:#625c55}
    .open-door-multi{margin:12px 0 0!important;padding-top:10px;border-top:1px solid #ece7e0}.open-door-minimum{margin:7px 0 0!important;font-size:11.5px!important}
    .s001-preview{margin:10px 0 7px;padding:9px;border:1px solid #ddd5c9;border-radius:9px;background:#fff}
    .s001-sheet{position:relative;aspect-ratio:2/1;width:100%;border:2px solid currentColor;box-sizing:border-box;background:rgba(0,0,0,.025)}
    .s001-field{position:absolute;left:25%;top:12.5%;width:50%;height:75%;box-sizing:border-box;border:2px dashed currentColor}
    .s001-opening{position:absolute;box-sizing:border-box;border:2px solid currentColor;border-radius:50% 50% 0 0 / 34% 34% 0 0}
    .s001-legend{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;font-size:9.5px;color:#625c55}
    .s001-summary{font-size:10.5px!important;margin-top:6px!important}.s001-gate{font-weight:700}.s001-gate.outside{color:#8a2b24}.s001-gate.inside{color:#416b46}
    @media (prefers-color-scheme: dark){.published-starts,.open-door,.s001-preview{background:#181613;border-color:#3c352c}.published-starts>p,.open-door>p,.open-door-action span,.published-card p,.published-card code,.published-active span,.published-fields label,.s001-legend{color:#c8c0b5}.published-card,.open-door-action,.published-boundary,.published-active{background:#201d18;border-color:#3c352c}.published-card button,.published-fields input{background:#181613;border-color:#5b5146}}
  `;
  document.head.append(style);
}

function cardStatus(child) {
  return INTAKE_CARDS.find((card) => card.id === child)?.status ?? 'active';
}

function buildPublishedFields(job) {
  if (!job.fields) return null;
  return node('div', { className: 'published-fields', attrs: { 'data-published-fields': job.id } }, job.fields.map((field) =>
    node('label', { text: field.label }, [node('input', { attrs: { type: 'number', step: 'any', value: field.value, 'data-published-input': field.key, 'aria-label': field.label } })]),
  ));
}

function formatIn(value) {
  return Number(value).toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

function readPublishedInputs(card) {
  const inputs = {};
  for (const field of card.querySelectorAll('[data-published-input]')) {
    const value = Number(field.value);
    if (!Number.isFinite(value)) return null;
    inputs[field.getAttribute('data-published-input')] = value;
  }
  return inputs;
}

function renderArchedPreview(card) {
  const preview = card?.querySelector('[data-s001-preview]');
  if (!preview) return;
  const inputs = readPublishedInputs(card);
  if (!inputs) {
    preview.querySelector('[data-s001-summary]').textContent = 'Enter a number in all three fields.';
    return;
  }
  const geometry = deriveS001CenteredArchGeometry(inputs);
  const opening = preview.querySelector('.s001-opening');
  const horizontalPct = Math.max(0, Math.min(100, (inputs.openingWidthIn / 96) * 100));
  const verticalPct = Math.max(0, Math.min(100, (geometry.opening.totalHeightIn / 48) * 100));
  opening.style.width = `${horizontalPct}%`;
  opening.style.height = `${verticalPct}%`;
  opening.style.left = `${50 - horizontalPct / 2}%`;
  opening.style.top = `${50 - verticalPct / 2}%`;
  const gate = preview.querySelector('[data-s001-gate]');
  gate.className = `s001-gate ${geometry.withinWorkField ? 'inside' : 'outside'}`;
  gate.textContent = geometry.withinWorkField ? 'INSIDE CANONICAL FIELD' : 'OUTSIDE CANONICAL FIELD — STORE MUST REFUSE';
  preview.querySelector('[data-s001-summary]').textContent =
    `Sheet 96 × 48 · field 48 × 36 · opening ${formatIn(inputs.openingWidthIn)} × ${formatIn(geometry.opening.totalHeightIn)} overall. `
    + `Sheet margins: ${formatIn(geometry.opening.sheetOffsets.leftIn)} left/right, ${formatIn(geometry.opening.sheetOffsets.topIn)} top/bottom. `
    + `Within field: ${formatIn(geometry.opening.marginsWithinWorkField.leftIn)} left/right, ${formatIn(geometry.opening.marginsWithinWorkField.topIn)} top/bottom.`;
}

function buildArchedPreview() {
  return node('div', { className: 's001-preview', attrs: { 'data-s001-preview': 'true' } }, [
    node('div', { className: 's001-sheet', attrs: { 'aria-label': 'Full sheet with centered working field and centered opening preview' } }, [
      node('div', { className: 's001-field' }),
      node('div', { className: 's001-opening' }),
    ]),
    node('div', { className: 's001-legend' }, [
      node('span', { text: 'solid outer = 96 × 48 sheet' }),
      node('span', { text: 'dashed = centered 48 × 36 working field' }),
      node('span', { text: 'inner = requested opening' }),
    ]),
    node('p', { className: 's001-summary', attrs: { 'data-s001-summary': 'true' }, text: '' }),
    node('p', { className: 's001-summary', attrs: { 'data-s001-gate': 'true' }, text: '' }),
    node('p', { className: 'published-derived', text: 'Preview only. The app does not derive radius or machine motion. Store independently evaluates the same demand and owns SUPPORTABLE / REFUSED / UNRESOLVED.' }),
  ]);
}

function buildPublishedStarts() {
  const section = node('section', { className: 'published-starts', attrs: { 'data-published-starts': 'true' } }, [
    node('h2', { text: 'MAKE A SIMPLE SHAPE' }),
    node('p', { text: 'Pick a bounded job in plain language. Sheet jobs ask the exact isolated Store candidate when that checkout is deliberately mounted.' }),
    node('div', { className: 'published-grid' }, PUBLISHED_STARTS.map((job) => {
      const children = [node('h3', { text: job.label }), node('p', { text: job.detail }), node('p', { text: job.defaults })];
      const fields = buildPublishedFields(job);
      if (fields) children.push(fields);
      if (job.id === 'arched-opening') children.push(buildArchedPreview());
      children.push(
        node('code', { text: job.basis }),
        node('small', { className: `published-state ${job.state}`, text: job.state === 'connected' ? 'connected to current app pin' : 'isolated Store candidate trial' }),
        node('button', { text: job.button, attrs: { type: 'button', 'data-published-start': job.id } }),
      );
      return node('article', { className: 'published-card', attrs: { 'data-published-job': job.id, 'data-published-state': job.state } }, children);
    })),
    node('p', { className: 'published-boundary', attrs: { 'data-published-message': 'true' }, text: `Current app Store pin: ${STORE_PIN}. Candidate sheet trial: ${STORE_CANDIDATE_BASIS}. Naming or evaluating a job does not create an order or authorize fabrication.` }),
  ]);
  queueMicrotask(() => renderArchedPreview(section.querySelector('[data-published-job="arched-opening"]')));
  return section;
}

function buildOpenDoor() {
  return node('section', { className: 'open-door', attrs: { 'data-open-door': 'true' } }, [
    node('h2', { text: 'WAYS TO START' }),
    node('p', { text: 'You do not have to put it in our format first. Start with the information you already have.' }),
    node('div', { className: 'open-door-grid' }, ACTIONS.map((action) => {
      const status = cardStatus(action.child);
      return node('button', { className: 'open-door-action', attrs: { type: 'button', 'data-action': 'open-child', 'data-child': action.child, 'data-open-door-child': action.id, 'data-open-door-status': status } }, [
        node('b', { text: action.label }), node('span', { text: action.detail }), node('small', { className: status === 'planned' ? 'open-door-status planned' : 'open-door-status', text: status === 'planned' ? 'source can be kept; interpretation planned' : 'current intake path' }),
      ]);
    })),
    node('p', { className: 'open-door-multi', text: 'Bring more than one. A photo, tape measurements, and a drawing can stay together in one project record.' }),
    node('p', { className: 'open-door-minimum', text: 'Use the least that works. Do not send client lists, pricing, workforce data, or other information that is not needed to define this project.' }),
  ]);
}

function showCandidateBoundary(root, id) {
  const message = root.querySelector('[data-published-message="true"]');
  if (!message) return;
  if (id === 'rect-stencil') {
    message.textContent = `Rectangular sheet stencil is published on Store candidate ${STORE_CANDIDATE_BASIS}. Store—not the app—checks minimum blank size, parent-sheet bounds, tabs, and route depth. The accepted Board pin remains ${STORE_PIN}.`;
  } else if (id === 'arched-opening') {
    message.textContent = `Centered arched sheet uses Store candidate ${STORE_CANDIDATE_BASIS}. Store enforces the centered 48 × 36 work field, derives the circular-segment radius, and checks route depth and the tab plan. No edge-work exception exists.`;
  }
}

function publishedJobAnswerText(body) {
  if (!body?.ready) return `This Store trial is not mounted here (${body?.code ?? 'STORE_UNAVAILABLE'}). No Store answer was invented.`;
  const estimate = body.estimate;
  const materialText = estimate?.Q != null ? ` Material-only reference: $${Number(estimate.Q).toFixed(2)}; process cost remains ${estimate.processQ_status ?? 'unresolved'}.` : '';
  const issues = [...(body.reasons ?? []), ...(body.unresolved ?? [])];
  const issueText = issues.length ? ` Store basis: ${issues.join(', ')}.` : '';
  const envelopeText = body.envelope ? ` Envelope: ${body.envelope}.` : '';
  const fieldText = body.workField?.id ? ` Work field: ${body.workField.id} ${body.workField.horizontalSpan_in} × ${body.workField.verticalSpan_in} in; profile inside field: ${body.workField.profileInsideField}.` : '';
  const curveText = body.curve?.derivedRadius_in != null ? ` ${body.curve.chord_in} in chord + ${body.curve.rise_in} in rise → Store-derived ${formatIn(body.curve.derivedRadius_in)} in radius.` : '';
  const tabText = body.retention?.plannedTabCount != null ? ` Store tab plan: ${body.retention.plannedTabCount} retained tabs (${body.retention.tabPlanStatus ?? 'status not stated'}).` : '';
  return `${body.label}: Store ${body.status}.${envelopeText}${fieldText}${issueText}${curveText}${tabText}${materialText} This is a Store answer only — no order, machine program, Cycle Start, or physical fabrication is authorized.`;
}

async function runPublishedJobTrial(root, id, inputs) {
  const message = root.querySelector('[data-published-message="true"]');
  if (!message) return;
  message.textContent = 'Asking the exact published Store candidate…';
  try {
    const response = await fetch(PUBLISHED_JOB_TRIAL_PATH, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId: id, inputs }) });
    const body = await response.json().catch(() => null);
    message.textContent = publishedJobAnswerText(body);
  } catch {
    message.textContent = 'The published-job Store trial could not be reached. No Store answer was invented.';
  }
}

function decorateBoard(root) {
  const screen = root.querySelector('[data-screen="hub"][data-child="board"], [data-screen="questions"][data-child="board"]');
  if (!screen) return;
  const form = screen.querySelector('[data-board-form]');
  if (!form) return;
  if (!screen.querySelector('[data-published-active="square-stick"]')) {
    form.before(node('section', { className: 'published-active', attrs: { 'data-published-active': 'square-stick' } }, [node('strong', { text: 'Square 2×4' }), node('span', { text: `${PUBLISHED_BOARD_SKU} · BOARD_SQUARE_V1 · one square crosscut. Change the finished length; the Store keeps its own answer and limits.` })]));
  }
  if (pendingPublishedStart === 'square-stick') {
    pendingPublishedStart = null;
    const field = form.querySelector('[data-field="board-length"]');
    if (field && !field.value) { field.value = '45'; field.dispatchEvent(new Event('input', { bubbles: true })); field.focus(); }
  }
}

function decorateHub(root) {
  const screen = root.querySelector('[data-screen="hub"], [data-screen="questions"]');
  if (!screen || screen.getAttribute('data-child')) return;
  const sourcePane = screen.querySelector('.source-pane');
  if (!sourcePane) return;
  if (!screen.querySelector('[data-published-starts="true"]')) sourcePane.before(buildPublishedStarts());
  if (!screen.querySelector('[data-open-door="true"]')) sourcePane.before(buildOpenDoor());
}

function decorate(root) { decorateHub(root); decorateBoard(root); }

export function startOpenDoorLayer(root) {
  if (!root || root.dataset.openDoorLayer === 'true') return;
  root.dataset.openDoorLayer = 'true';
  installStyle();

  root.addEventListener('input', (event) => {
    const card = event.target.closest('[data-published-job="arched-opening"]');
    if (card && root.contains(card)) renderArchedPreview(card);
  });

  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-published-start]');
    if (!button || !root.contains(button)) return;
    const id = button.getAttribute('data-published-start');
    if (id === 'square-stick') { pendingPublishedStart = id; root.querySelector('[data-open-door-child="board"]')?.click(); return; }
    if (PUBLISHED_JOB_TRIAL_IDS.has(id)) {
      showCandidateBoundary(root, id);
      const card = button.closest('[data-published-job]');
      const inputs = card ? readPublishedInputs(card) : null;
      if (!inputs) {
        const message = root.querySelector('[data-published-message="true"]');
        if (message) message.textContent = 'Enter a number in each field. No Store request was sent.';
        return;
      }
      runPublishedJobTrial(root, id, inputs);
    }
  });

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; decorate(root); });
  };
  const observer = new MutationObserver(schedule);
  observer.observe(root, { childList: true, subtree: true });
  schedule();
}
