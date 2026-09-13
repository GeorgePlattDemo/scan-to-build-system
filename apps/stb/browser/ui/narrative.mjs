const LANDING_DETAILS = Object.freeze({
  'YOU SCAN': 'Capture the space with laser, AR, or tape. The measurements are yours.',
  'YOU DEFINE': 'One part, several parts, or a need we do not offer yet.',
  'YOU SELECT': 'Set the material, size, doors, and other available options.',
  'YOU CONFIRM YOUR DEFINITION': 'Approve exactly what you want built—and nothing else.',
  'YOUR DEFINITION REACHES THE CUT': 'Your confirmed dimensions guide the work without being redrawn, retyped, or reinterpreted along the way.',
  'WE CUT · MILL · DRILL · LABEL': 'Within stated limits. Staged for pickup. We tell you when your parts are ready.',
  'YOU BUILD.': 'Assembly and use stay on your side of the handoff. Installation is not offered in this build.',
});

const AUTHORITY_STAGES = Object.freeze([
  {
    name: 'YOU',
    owns: 'Your space, measurements, choices, and which version you confirm.',
    mayNot: 'No downstream actor may silently change your project on your behalf.',
  },
  {
    name: 'STORE',
    owns: 'Material identity, current offering, quantity, supportability, and Store basis.',
    mayNot: 'Redraw, retype, substitute, round, or alter the confirmed requirement to make it supportable.',
  },
  {
    name: 'COMMERCIAL',
    owns: 'Offer, acceptance evidence, and commercial condition.',
    mayNot: 'Treat acceptance as payment, payment as allocation, or silence as agreement.',
  },
  {
    name: 'PRODUCTION RELEASE',
    owns: 'The decision that eligible commercial work may enter production.',
    mayNot: 'Release on assumption or confer machine readiness.',
  },
  {
    name: 'LOCAL CELL',
    owns: 'Machine-specific translation, setup, tooling, calibration, readiness, and local Cycle Start.',
    mayNot: 'Alter the definition or treat Store support as permission to move a machine.',
  },
  {
    name: 'QUALITY',
    owns: 'Comparison of the made part against the confirmed requirement and recorded exceptions.',
    mayNot: 'Change the requirement to match the output.',
  },
  {
    name: 'FULFILLMENT',
    owns: 'Identity, labeling, staging, ready notice, and custody handoff.',
    mayNot: 'Treat staged as picked up or incomplete as complete.',
  },
  {
    name: 'OWNER RECORD',
    owns: 'Reconciliation of what was asked, confirmed, answered, reviewed, and later fulfilled.',
    mayNot: 'Rewrite history or create authority that did not exist at the time.',
  },
]);

const COLLAPSES = Object.freeze([
  ['Confirmation', 'an order'],
  ['An order', 'payment'],
  ['Payment', 'material allocation'],
  ['Material allocation', 'production release'],
  ['Production release', 'machine readiness'],
  ['Machine readiness', 'Cycle Start'],
  ['Store support', 'Cycle Start'],
  ['Machine completion', 'inspection'],
  ['Inspection', 'staging'],
  ['Staging', 'pickup'],
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
  for (const child of children) {
    if (child) element.append(child);
  }
  return element;
}

function addStyle() {
  if (document.getElementById('stb-narrative-style')) return;
  const style = document.createElement('style');
  style.id = 'stb-narrative-style';
  style.textContent = `
    .narrative-band,.narrative-card{border:1px solid #d8d1c7;border-radius:12px;padding:14px 16px;margin:14px 0;background:#fbfaf8}
    .narrative-band strong,.narrative-card strong{font-weight:650}
    .narrative-kicker{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#7a7168;margin:0 0 6px}
    .narrative-copy{margin:0;color:#4e4943;line-height:1.55}
    .landing-sequence li[data-narrative-detail="true"]{margin-bottom:10px}
    .landing-sequence .narrative-detail{display:block;font-size:13px;color:#6c655e;margin-top:2px;max-width:58rem}
    .narrative-axis{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;margin:12px 0 16px}
    .narrative-axis>div{border:1px solid #e3ded7;border-radius:10px;padding:10px 12px;background:#fff}
    .narrative-axis b{display:block;font-size:12px;margin-bottom:3px}
    .narrative-axis span{display:block;font-size:12px;color:#625c55;line-height:1.4}
    .narrative-next{border-left:4px solid #a98255;padding-left:12px;margin:14px 0 18px}
    .narrative-next p{margin:3px 0}
    .authority-chain{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:10px 0 14px}
    .authority-chain span{border:1px solid #d9c3a2;border-radius:999px;padding:5px 9px;font-size:11px;background:#f6efe4}
    .authority-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin:10px 0 16px}
    .authority-stage{border:1px solid #e3ded7;border-radius:10px;padding:11px 12px;background:#fff}
    .authority-stage h3{font-size:13px;margin:0 0 5px}
    .authority-stage p{font-size:12px;margin:3px 0;color:#57534e;line-height:1.45}
    .collapse-list{margin:8px 0 0;padding-left:20px}
    .collapse-list li{margin:4px 0;font-size:13px}
    .qualified-loop{border:1px solid #d9c3a2;background:#f6efe4;border-radius:12px;padding:14px 16px;margin:14px 0}
    .qualified-loop .route{font-weight:650;margin:7px 0}
    .qualified-loop ul{margin:8px 0 0;padding-left:20px}
    .qualified-loop li{margin:4px 0;font-size:13px}
    .narrative-owner-record{border-top:1px solid #e3ded7;padding-top:14px;margin-top:18px}
    @media (prefers-color-scheme: dark){
      .narrative-band,.narrative-card{background:#201d18;border-color:#3c352c}
      .narrative-copy,.narrative-axis span,.authority-stage p{color:#c8c0b5}
      .narrative-axis>div,.authority-stage{background:#181613;border-color:#3c352c}
      .qualified-loop{background:#2a231a;border-color:#5b4935}
    }
  `;
  document.head.append(style);
}

function once(host, key, build) {
  if (!host || host.querySelector(`[data-narrative="${key}"]`)) return null;
  const built = build();
  built.setAttribute('data-narrative', key);
  return built;
}

function decorateLanding(screen) {
  const list = screen.querySelector('.landing-sequence');
  if (list) {
    for (const item of list.querySelectorAll('li')) {
      if (item.dataset.narrativeDetail === 'true') continue;
      const detail = LANDING_DETAILS[item.textContent.trim()];
      if (!detail) continue;
      item.dataset.narrativeDetail = 'true';
      item.append(node('span', { className: 'narrative-detail', text: detail }));
    }
  }
  const band = once(screen, 'landing-contract', () =>
    node('section', { className: 'narrative-band' }, [
      node('p', { className: 'narrative-kicker', text: 'One definition, all the way through' }),
      node('p', {
        className: 'narrative-copy',
        text: 'Bring what you have. We preserve the source, use what we can reliably establish, show what remains unresolved, and nothing becomes controlling merely because software read it.',
      }),
    ]),
  );
  if (band) {
    const service = screen.querySelector('.service-statement');
    (service ?? list ?? screen.lastElementChild)?.after(band);
  }
}

function decorateOrientation(screen) {
  const actor = screen.getAttribute('data-actor');
  const copy = actor === 'professional'
    ? 'Keep working in the tools you already use. A drawing, PDF, takeoff, cut list, photo, measurements, or structured file may enter as source evidence. We use only what this build can reliably establish, and we do not make a file authoritative by reading it.'
    : actor === 'returning'
      ? 'Your saved project remains one versioned record. New evidence or corrections create new history; they do not rewrite what you previously confirmed.'
      : 'Start with a sentence, a measurement, a picture, a scan, a sketch, or a file. You do not have to translate the project into our format before you begin.';
  const band = once(screen, `orientation-${actor}`, () =>
    node('section', { className: 'narrative-band' }, [
      node('p', { className: 'narrative-kicker', text: 'Bring what you have' }),
      node('p', { className: 'narrative-copy', text: copy }),
    ]),
  );
  if (band) screen.querySelector('.actions')?.before(band);
}

function decorateBegin(screen) {
  const band = once(screen, 'begin-two-paths', () =>
    node('section', { className: 'narrative-band' }, [
      node('p', { className: 'narrative-kicker', text: 'Two ways forward' }),
      node('p', {
        className: 'narrative-copy',
        text: 'Use a mapped project when the construction logic is already bounded, or start your own and bring whatever information you already have. Both paths converge on the same evidence, definition, review, Store, and record boundaries.',
      }),
    ]),
  );
  if (band) screen.querySelector('.screen-heading')?.after(band);
}

function page2NextQuestion(screen) {
  const needs = [...screen.querySelectorAll('[data-need]')];
  if (needs.length > 0) {
    return `Resolve the first visible gap: ${needs[0].textContent.trim()}`;
  }
  const observations = screen.querySelectorAll('[data-observation-id]');
  const mappable = screen.querySelector('[data-action="map-observation"]');
  const sources = screen.querySelectorAll('[data-source-row]');
  if (observations.length === 0 && sources.length === 0) {
    return 'What are you trying to make, replace, change, or fit? A sentence is enough to start.';
  }
  if (observations.length === 0 && sources.length > 0) {
    return 'What, if anything, can this source reliably establish? Viewing a source does not create an observation.';
  }
  if (mappable) {
    return 'Which retained observation, if any, should be used in the candidate? Mapping is explicit; reading alone does not make a value controlling.';
  }
  return 'Review what is in the candidate and what is still unresolved. Continue only when the candidate says what you mean.';
}

function decoratePage2(screen) {
  const intro = once(screen, 'intake-contract', () =>
    node('section', { className: 'narrative-band' }, [
      node('p', { className: 'narrative-kicker', text: 'Open-door intake' }),
      node('p', {
        className: 'narrative-copy',
        text: 'Receive broadly. Preserve the source. Record observations separately. Expose conflicts and unknowns. Ask only for what is still missing. Broad intake does not imply Store support, an offer, production release, machine admission, or fabrication.',
      }),
    ]),
  );
  if (intro) {
    const prompt = screen.querySelector('.page2-prompt,.handoff-status');
    (prompt ?? screen.querySelector('.project-name') ?? screen.querySelector('.screen-heading'))?.after(intro);
  }

  const axis = once(screen, 'intake-two-axes', () =>
    node('div', { className: 'narrative-axis' }, [
      node('div', {}, [
        node('b', { text: 'How we got it' }),
        node('span', { text: 'Source, entered observation, extracted candidate, or derived value describes provenance.' }),
      ]),
      node('div', {}, [
        node('b', { text: 'What authority it has' }),
        node('span', { text: 'Retained, unresolved, used in a candidate, and later confirmed are different conditions. Reading is not authority.' }),
      ]),
      node('div', {}, [
        node('b', { text: 'Conflict rule' }),
        node('span', { text: 'If two sources disagree, keep both and surface the conflict. Do not pick a winner silently.' }),
      ]),
    ]),
  );
  if (axis) screen.querySelector('.source-pane')?.before(axis);

  const sourceHeading = screen.querySelector('.source-pane h2');
  if (sourceHeading && sourceHeading.dataset.narrativeLabel !== 'true') {
    sourceHeading.dataset.narrativeLabel = 'true';
    sourceHeading.textContent = 'WHAT YOU BROUGHT';
  }
  const candidateHeading = screen.querySelector('.candidate-pane h2');
  if (candidateHeading && candidateHeading.dataset.narrativeLabel !== 'true') {
    candidateHeading.dataset.narrativeLabel = 'true';
    candidateHeading.textContent = 'OBSERVATIONS / CANDIDATE INPUTS';
  }
  const needsHeading = screen.querySelector('.needs-pane h2');
  if (needsHeading && needsHeading.dataset.narrativeLabel !== 'true') {
    needsHeading.dataset.narrativeLabel = 'true';
    needsHeading.textContent = 'WHAT STILL NEEDS RESOLUTION';
  }

  const next = once(screen, 'next-question', () =>
    node('section', { className: 'narrative-next' }, [
      node('p', { className: 'narrative-kicker', text: 'Working next question' }),
      node('p', { text: page2NextQuestion(screen) }),
      node('p', { className: 'narrative-copy', text: 'This prompt helps close the definition gap. It is not a Store answer, professional judgment, or production authority.' }),
    ]),
  );
  if (next) screen.querySelector('.needs-pane')?.after(next);
}

function qualifiedLoop({ unresolvedCount = 0 } = {}) {
  const lead = unresolvedCount > 0
    ? `${unresolvedCount} unresolved condition${unresolvedCount === 1 ? '' : 's'} remain. An unresolved condition should be classified before anyone guesses.`
    : 'If a future bounded condition requires professional judgment, the answer belongs in a scoped human-resolution loop rather than in a customer guess or a software default.';
  return node('section', { className: 'qualified-loop' }, [
    node('p', { className: 'narrative-kicker', text: 'Human-in-the-loop — bounded, named, on the record' }),
    node('p', { text: lead }),
    node('p', { className: 'route', text: 'HOLDER  |  RULE  |  QUALIFIED PERSON' }),
    node('ul', {}, [
      node('li', { text: 'A qualified answer resolves one bounded question. It does not edit the project.' }),
      node('li', { text: 'The answer needs an author, declared standing, scope, and conditions that void it.' }),
      node('li', { text: 'Qualified resolution is a loop, not a ninth stage.' }),
      node('li', { text: 'Resolution is not release. Release is not readiness. Readiness is not Cycle Start.' }),
    ]),
    node('p', { className: 'narrative-copy', text: 'Routing and persistence for qualified resolution are not implemented in this build.' }),
  ]);
}

function decorateStore(screen) {
  const card = once(screen, 'store-boundary', () =>
    node('section', { className: 'narrative-band' }, [
      node('p', { className: 'narrative-kicker', text: 'Store boundary' }),
      node('p', {
        className: 'narrative-copy',
        text: 'The Store answers from its own material, inventory, capability, and price basis. It may support, leave unresolved, refuse, or report unavailable. It does not redraw the project. Store support is not production release or Cycle Start.',
      }),
    ]),
  );
  if (card) screen.querySelector('.screen-heading')?.after(card);
}

function decorateConfirm(screen) {
  const meaning = once(screen, 'confirm-freeze', () =>
    node('section', { className: 'narrative-band' }, [
      node('p', { className: 'narrative-kicker', text: 'What confirm means' }),
      node('p', {
        className: 'narrative-copy',
        text: 'Confirm freezes this exact definition as one identified version. Change anything later and that creates a new version. Confirmation does not by itself mean ordered, paid, material allocated, production released, machine ready, authorized, or cut.',
      }),
    ]),
  );
  if (meaning) screen.querySelector('.project-name')?.after(meaning);
  const unresolvedCount = screen.querySelectorAll('[data-unresolved-condition]').length;
  const loop = once(screen, 'qualified-resolution', () => qualifiedLoop({ unresolvedCount }));
  if (loop) screen.querySelector('[data-review-unresolved]')?.after(loop);
}

function authorityMap() {
  const chain = node('div', { className: 'authority-chain' });
  AUTHORITY_STAGES.forEach((stage, index) => {
    chain.append(node('span', { text: stage.name }));
    if (index < AUTHORITY_STAGES.length - 1) chain.append(document.createTextNode('→'));
  });
  return node('section', { className: 'narrative-card' }, [
    node('p', { className: 'narrative-kicker', text: 'Who is responsible for what' }),
    node('p', { className: 'narrative-copy', text: 'The project originates with you. Downstream authority gets narrower, not broader.' }),
    chain,
    node('div', { className: 'authority-grid' }, AUTHORITY_STAGES.map((stage) =>
      node('article', { className: 'authority-stage' }, [
        node('h3', { text: stage.name }),
        node('p', {}, [node('strong', { text: 'OWNS — ' }), document.createTextNode(stage.owns)]),
        node('p', {}, [node('strong', { text: 'MAY NOT — ' }), document.createTextNode(stage.mayNot)]),
      ]),
    )),
  ]);
}

function collapseList() {
  return node('section', { className: 'narrative-card' }, [
    node('p', { className: 'narrative-kicker', text: 'Things that are not the same' }),
    node('ol', { className: 'collapse-list' }, COLLAPSES.map(([a, b]) => node('li', { text: `${a} is not ${b}.` }))),
  ]);
}

function decorateResult(screen) {
  const map = once(screen, 'authority-map', authorityMap);
  if (map) {
    const retained = screen.querySelector('.result-retained');
    (retained ?? screen.querySelector('.screen-heading'))?.after(map);
  }
  const loop = once(screen, 'qualified-loop-result', () => qualifiedLoop());
  if (loop) screen.querySelector('[data-store-on-result]')?.after(loop);
  const collapses = once(screen, 'collapses', collapseList);
  if (collapses) screen.querySelector('[data-result-events]')?.before(collapses);
}

function decorateRecord(screen) {
  const card = once(screen, 'owner-record', () =>
    node('section', { className: 'narrative-owner-record' }, [
      node('p', { className: 'narrative-kicker', text: 'Owner record' }),
      node('p', {
        className: 'narrative-copy',
        text: 'The record is the reconciliation layer: what you brought, what became observations, which revision you reviewed, what the Store answered, and what later outcomes are actually recorded. Missing physical events stay missing; the record does not infer them.',
      }),
    ]),
  );
  if (card) screen.querySelector('.screen-heading')?.after(card);
}

function decorate(root) {
  const screen = root.querySelector('[data-screen]');
  if (!screen) return;
  const name = screen.getAttribute('data-screen');
  if (name === 'landing') decorateLanding(screen);
  else if (name === 'orientation') decorateOrientation(screen);
  else if (name === 'begin') decorateBegin(screen);
  else if (name === 'hub' || name === 'questions') decoratePage2(screen);
  else if (name === 'store') decorateStore(screen);
  else if (name === 'confirm') decorateConfirm(screen);
  else if (name === 'result') decorateResult(screen);
  else if (name === 'record') decorateRecord(screen);
}

export function startNarrativeLayer(root) {
  if (!root || root.dataset.narrativeLayer === 'true') return;
  root.dataset.narrativeLayer = 'true';
  addStyle();
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
