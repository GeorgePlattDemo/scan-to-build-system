import { INTAKE_CARDS, PUBLISHED_BOARD_SKU, STORE_PIN } from '/shared/contracts.mjs';

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

const STORE_CANDIDATE_BASIS = '096e99d645d745b1670185f46c75de75f9e59661';
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
    detail: '3/4 in ACX-sanded sheet reference. Published reference blank: 24 × 18 in.',
    basis: 'STB-ZERO-PLY-075-48X96-001 · SHEET_MODE2_STENCIL_V1',
    defaults: 'Reference implementation uses 4 retained tabs and 0.5 in route depth.',
    state: 'candidate',
    button: 'ASK STORE ABOUT THIS SHAPE',
  }),
  Object.freeze({
    id: 'arched-opening',
    label: 'Arched opening in 1/2 in plywood',
    detail: 'Reference outer panel 48 × 72 in. Opening 36 in wide, 36 in straight height, 12 in rise.',
    basis: 'STB-ZERO-PLY-050-48X96-001 · SHEET_MODE2_ARCHED_APERTURE_V0',
    defaults: '36 in chord + 12 in rise → 19.5 in radius.',
    state: 'candidate',
    button: 'ASK STORE ABOUT THIS SHAPE',
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
    .published-state,.open-door-status{display:inline-block;margin-top:6px;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#7a7168}
    .published-state.connected{color:#416b46}
    .published-state.candidate,.open-door-status.planned{color:#8b6a3f}
    .published-boundary{margin:10px 0 0!important;padding:10px 12px;border-left:4px solid #a98255;background:#fbfaf8}
    .published-active{margin:0 0 12px;padding:10px 12px;border:1px solid #d8d1c7;border-radius:10px;background:#fbfaf8}
    .published-active strong{display:block;margin-bottom:3px}
    .published-active span{display:block;font-size:11.5px;line-height:1.4;color:#625c55}
    .open-door-multi{margin:12px 0 0!important;padding-top:10px;border-top:1px solid #ece7e0}
    .open-door-minimum{margin:7px 0 0!important;font-size:11.5px!important}
    @media (prefers-color-scheme: dark){
      .published-starts,.open-door{background:#181613;border-color:#3c352c}
      .published-starts>p,.open-door>p,.open-door-action span,.published-card p,.published-card code,.published-active span{color:#c8c0b5}
      .published-card,.open-door-action,.published-boundary,.published-active{background:#201d18;border-color:#3c352c}
      .published-card button{background:#181613;border-color:#5b5146}
    }
  `;
  document.head.append(style);
}

function cardStatus(child) {
  return INTAKE_CARDS.find((card) => card.id === child)?.status ?? 'active';
}

function buildPublishedStarts() {
  return node('section', { className: 'published-starts', attrs: { 'data-published-starts': 'true' } }, [
    node('h2', { text: 'MAKE A SIMPLE SHAPE' }),
    node('p', { text: 'Pick a named shape instead of starting with evaluator language. Square 2×4 uses the current app Store pin. The two sheet references can ask the exact isolated Store candidate when that checkout is deliberately mounted.' }),
    node('div', { className: 'published-grid' }, PUBLISHED_STARTS.map((job) =>
      node('article', { className: 'published-card', attrs: { 'data-published-job': job.id, 'data-published-state': job.state } }, [
        node('h3', { text: job.label }),
        node('p', { text: job.detail }),
        node('p', { text: job.defaults }),
        node('code', { text: job.basis }),
        node('small', {
          className: `published-state ${job.state}`,
          text: job.state === 'connected' ? 'connected to current app pin' : 'isolated Store candidate trial',
        }),
        node('button', {
          text: job.button,
          attrs: { type: 'button', 'data-published-start': job.id },
        }),
      ]),
    )),
    node('p', {
      className: 'published-boundary',
      attrs: { 'data-published-message': 'true' },
      text: `Current app Store pin: ${STORE_PIN}. Candidate sheet trial: ${STORE_CANDIDATE_BASIS}. Naming or evaluating a job does not create an order or authorize fabrication.`,
    }),
  ]);
}

function buildOpenDoor() {
  return node('section', { className: 'open-door', attrs: { 'data-open-door': 'true' } }, [
    node('h2', { text: 'WAYS TO START' }),
    node('p', { text: 'You do not have to put it in our format first. Start with the information you already have.' }),
    node('div', { className: 'open-door-grid' }, ACTIONS.map((action) => {
      const status = cardStatus(action.child);
      return node('button', {
        className: 'open-door-action',
        attrs: {
          type: 'button',
          'data-action': 'open-child',
          'data-child': action.child,
          'data-open-door-child': action.id,
          'data-open-door-status': status,
        },
      }, [
        node('b', { text: action.label }),
        node('span', { text: action.detail }),
        node('small', {
          className: status === 'planned' ? 'open-door-status planned' : 'open-door-status',
          text: status === 'planned' ? 'source can be kept; interpretation planned' : 'current intake path',
        }),
      ]);
    })),
    node('p', {
      className: 'open-door-multi',
      text: 'Bring more than one. A photo, tape measurements, and a drawing can stay together in one project record.',
    }),
    node('p', {
      className: 'open-door-minimum',
      text: 'Use the least that works. Do not send client lists, pricing, workforce data, or other information that is not needed to define this project.',
    }),
  ]);
}

function showCandidateBoundary(root, id) {
  const message = root.querySelector('[data-published-message="true"]');
  if (!message) return;
  if (id === 'rect-stencil') {
    message.textContent = `Rectangular sheet stencil is published on Store candidate ${STORE_CANDIDATE_BASIS}. The app will use only the isolated candidate trial endpoint; the current app Store pin remains ${STORE_PIN}.`;
  } else if (id === 'arched-opening') {
    message.textContent = `Arched opening is published on Store candidate ${STORE_CANDIDATE_BASIS}; 36 in chord + 12 in rise derives 19.5 in radius. The current app Store pin remains ${STORE_PIN}.`;
  }
}

function publishedJobAnswerText(body) {
  if (!body?.ready) {
    return `This Store trial is not mounted here (${body?.code ?? 'STORE_UNAVAILABLE'}). No Store answer was invented.`;
  }
  const estimate = body.estimate;
  const materialText = estimate?.Q != null
    ? ` Material-only reference: $${Number(estimate.Q).toFixed(2)}; process cost remains ${estimate.processQ_status ?? 'unresolved'}.`
    : '';
  return `${body.label}: Store ${body.status}.${materialText} This is a Store answer only — no order, machine program, Cycle Start, or physical fabrication is authorized.`;
}

async function runPublishedJobTrial(root, id) {
  const message = root.querySelector('[data-published-message="true"]');
  if (!message) return;
  message.textContent = 'Asking the exact published Store candidate…';
  try {
    const response = await fetch(PUBLISHED_JOB_TRIAL_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: id }),
    });
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
    form.before(node('section', {
      className: 'published-active',
      attrs: { 'data-published-active': 'square-stick' },
    }, [
      node('strong', { text: 'Square 2×4' }),
      node('span', { text: `${PUBLISHED_BOARD_SKU} · BOARD_SQUARE_V1 · one square crosscut. Change the finished length; the Store keeps its own answer and limits.` }),
    ]));
  }
  if (pendingPublishedStart === 'square-stick') {
    pendingPublishedStart = null;
    const field = form.querySelector('[data-field="board-length"]');
    if (field && !field.value) {
      field.value = '45';
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.focus();
    }
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

function decorate(root) {
  decorateHub(root);
  decorateBoard(root);
}

export function startOpenDoorLayer(root) {
  if (!root || root.dataset.openDoorLayer === 'true') return;
  root.dataset.openDoorLayer = 'true';
  installStyle();

  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-published-start]');
    if (!button || !root.contains(button)) return;
    const id = button.getAttribute('data-published-start');
    if (id === 'square-stick') {
      pendingPublishedStart = id;
      root.querySelector('[data-open-door-child="board"]')?.click();
      return;
    }
    if (PUBLISHED_JOB_TRIAL_IDS.has(id)) {
      showCandidateBoundary(root, id);
      runPublishedJobTrial(root, id);
    }
  });

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      decorate(root);
    });
  };
  const observer = new MutationObserver(schedule);
  observer.observe(root, { childList: true, subtree: true });
  schedule();
}
