import { INTAKE_CARDS } from '/shared/contracts.mjs';

const ACTIONS = Object.freeze([
  { label: 'Pick a board', detail: 'Start with one bounded part and a finished length.', child: 'board' },
  { label: 'Tell us what you want', detail: 'A sentence is enough to start.', child: 'measurements' },
  { label: 'Enter measurements', detail: 'Type what you took. Keep the units you used.', child: 'measurements' },
  { label: 'Add photos or a sketch', detail: 'JPEG or PNG can be kept and displayed.', child: 'sketch' },
  { label: 'Scan a space', detail: 'Keep an existing scan; native interpretation is still planned.', child: 'scan' },
  { label: 'Attach a drawing or PDF', detail: 'Keep and display the PDF; no OCR or scale extraction is claimed.', child: 'drawing' },
  { label: 'Add a takeoff or cut list', detail: 'Keep raw text and enter bounded rows without retyping unrelated job data.', child: 'takeoff' },
  { label: 'CAD / BIM / structured file', detail: 'Keep the source even when this build cannot interpret it.', child: 'cad' },
  { label: 'I’m not sure', detail: 'Start with the need. Unknown is a valid state.', child: 'measurements' },
]);

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
    .open-door{margin:14px 0 18px;padding:14px 16px;border:1px solid #d8d1c7;border-radius:12px;background:#fff}
    .open-door h2{margin:0 0 4px;font-size:17px}
    .open-door>p{margin:0 0 12px;color:#625c55;font-size:13px}
    .open-door-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px}
    .open-door-action{display:block;width:100%;text-align:left;border:1px solid #e3ded7;border-radius:10px;padding:10px 12px;background:#fbfaf8;color:inherit;cursor:pointer}
    .open-door-action:hover{border-color:#b89a73}
    .open-door-action b{display:block;font-size:13px;margin-bottom:2px}
    .open-door-action span{display:block;font-size:11.5px;line-height:1.4;color:#625c55}
    .open-door-status{display:inline-block;margin-top:6px;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#7a7168}
    .open-door-status.planned{color:#8b6a3f}
    .open-door-multi{margin:12px 0 0!important;padding-top:10px;border-top:1px solid #ece7e0}
    .open-door-minimum{margin:7px 0 0!important;font-size:11.5px!important}
    @media (prefers-color-scheme: dark){
      .open-door{background:#181613;border-color:#3c352c}
      .open-door>p,.open-door-action span{color:#c8c0b5}
      .open-door-action{background:#201d18;border-color:#3c352c}
    }
  `;
  document.head.append(style);
}

function cardStatus(child) {
  return INTAKE_CARDS.find((card) => card.id === child)?.status ?? 'active';
}

function buildOpenDoor() {
  return node('section', { className: 'open-door', attrs: { 'data-open-door': 'true' } }, [
    node('h2', { text: 'BRING WHAT YOU HAVE' }),
    node('p', { text: 'You do not have to put it in our format first. Start with the information you already have.' }),
    node('div', { className: 'open-door-grid' }, ACTIONS.map((action) => {
      const status = cardStatus(action.child);
      return node('button', {
        className: 'open-door-action',
        attrs: {
          type: 'button',
          'data-action': 'open-child',
          'data-child': action.child,
          'data-open-door-child': action.child,
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

function decorate(root) {
  const screen = root.querySelector('[data-screen="hub"]');
  if (!screen || screen.getAttribute('data-child')) return;
  if (screen.querySelector('[data-open-door="true"]')) return;
  const sourcePane = screen.querySelector('.source-pane');
  if (!sourcePane) return;
  sourcePane.before(buildOpenDoor());
}

export function startOpenDoorLayer(root) {
  if (!root || root.dataset.openDoorLayer === 'true') return;
  root.dataset.openDoorLayer = 'true';
  installStyle();
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
