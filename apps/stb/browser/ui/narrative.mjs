const AUTHORITY_STAGES = Object.freeze([
  {
    name: 'YOU',
    subtitle: 'the person with the space or the project',
    owns: 'Your space, measurements, choices, source material, and which project version you confirm.',
    receives: 'Nothing is required before you begin. You start the record with whatever you already have.',
    mayDo: 'Confirm a version, correct it, change it, walk away, or ask for something the current system does not offer.',
    mayNot: 'There is no downstream authority over what you want. Safety, Store capability, commercial, and machine gates still keep their own separate boundaries.',
  },
  {
    name: 'STORE',
    subtitle: 'material, offering, capability, and Store basis',
    owns: 'Material identity, quantity, current offering, supportability, availability basis, and Store economics.',
    receives: 'The project requirement for one identified revision. It does not receive permission to rewrite it.',
    mayDo: 'Resolve Store items and quantity, answer supportable / unresolved / refused / unavailable, and return its basis.',
    mayNot: 'Redraw, retype, substitute, round, or alter the requirement to make the job supportable.',
  },
  {
    name: 'COMMERCIAL',
    subtitle: 'future offer and agreement boundary',
    owns: 'The future offer, acceptance evidence, validity window, and required commercial condition.',
    receives: 'One identified project revision and the Store answer that the offer relies on.',
    mayDo: 'Make an offer with a validity window, record acceptance, let it lapse, or withdraw it according to later reviewed terms.',
    mayNot: 'Accept on the holder’s behalf, revive a lapsed offer silently, treat acceptance as payment, or treat payment as allocation.',
  },
  {
    name: 'PRODUCTION RELEASE',
    subtitle: 'permission for eligible work to enter production',
    owns: 'The decision that commercial work with its required conditions met may become production work.',
    receives: 'An accepted version with the commercial conditions required for release actually satisfied.',
    mayDo: 'Release that version or hold it and name the blocking condition.',
    mayNot: 'Release on assumption, release an unaccepted version, or confer machine readiness or Cycle Start.',
  },
  {
    name: 'LOCAL CELL',
    subtitle: 'machine-local translation and operation',
    owns: 'Machine-specific translation, local setup, tooling, calibration, readiness, and local Cycle Start.',
    receives: 'Bounded machine-neutral work tied to an identified project/release context.',
    mayDo: 'Translate within its declared configuration, refuse work outside it, establish local readiness, and make the local Cycle Start decision.',
    mayNot: 'Alter the project definition, treat Store support as motion authority, or proceed through an unresolved local condition.',
  },
  {
    name: 'QUALITY',
    subtitle: 'compare what was made with what was required',
    owns: 'Inspection against the confirmed requirement, exceptions, nonconformance, and disposition records.',
    receives: 'Made parts plus the exact requirement they are to be checked against.',
    mayDo: 'Accept, reject, record an exception, or route a part for bounded rework/disposition.',
    mayNot: 'Change the requirement to match the output or relabel a nonconforming part as conforming.',
  },
  {
    name: 'FULFILLMENT',
    subtitle: 'identity, staging, notice, and custody',
    owns: 'Labels, staging identity, ready notice, package/custody record, and later pickup or delivery handoff.',
    receives: 'Parts that have reached the required quality/disposition state for fulfillment.',
    mayDo: 'Label, stage, notify, and record the eventual custody handoff.',
    mayNot: 'Treat incomplete as complete, staged as picked up, or a ready notice as custody transfer.',
  },
  {
    name: 'OWNER RECORD',
    subtitle: 'reconciliation, not a new authority',
    owns: 'The chronology linking what was brought, observed, confirmed, answered, agreed, released, made, inspected, staged, and received when those events actually exist.',
    receives: 'Records from the other stages, including unresolved, refused, missing, superseded, and historical states.',
    mayDo: 'Show provenance and chronology, preserve revisions, and export the owner-controlled record.',
    mayNot: 'Rewrite history, invent a missing event, turn a software result into physical outcome truth, or create authority that did not exist.',
  },
]);

const COLLAPSES = Object.freeze([
  ['Confirmation', 'an order'],
  ['An order', 'payment'],
  ['Payment', 'material allocation'],
  ['Material allocation', 'production release'],
  ['Qualified resolution', 'production release'],
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
    .narrative-axis{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;margin:12px 0 16px}
    .narrative-axis>div{border:1px solid #e3ded7;border-radius:10px;padding:10px 12px;background:#fff}
    .narrative-axis b{display:block;font-size:12px;margin-bottom:3px}
    .narrative-axis span{display:block;font-size:12px;color:#625c55;line-height:1.4}
    .narrative-next{border-left:4px solid #a98255;padding-left:12px;margin:14px 0 18px}
    .narrative-next p{margin:3px 0}
    .authority-chain{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:10px 0 14px}
    .authority-chain span{border:1px solid #d9c3a2;border-radius:999px;padding:5px 9px;font-size:11px;background:#f6efe4}
    .authority-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:8px;margin:10px 0 16px}
    .authority-stage{border:1px solid #e3ded7;border-radius:10px;padding:11px 12px;background:#fff}
    .authority-stage h3{font-size:13px;margin:0 0 2px}
    .authority-stage .stage-subtitle{font-size:10.5px;color:#7a7168;margin:0 0 7px}
    .authority-stage p{font-size:12px;margin:5px 0;color:#57534e;line-height:1.45}
    .collapse-list{margin:8px 0 0;padding-left:20px}
    .collapse-list li{margin:4px 0;font-size:13px}
    .qualified-loop{border:1px solid #d9c3a2;background:#f6efe4;border-radius:12px;padding:14px 16px;margin:14px 0}
    .qualified-loop .route{font-weight:650;margin:7px 0}
    .qualified-loop .holder-options{font-size:12px;font-weight:650;letter-spacing:.03em;margin:10px 0 3px}
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
  // The landing sequence is locked proposition copy. Narrative belongs beside it,
  // not inside the sequence items where it would mutate the public statement.
  const list = screen.querySelector('.landing-sequence');
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
        text: 'Choose a prepared example or start your own project. In either case, keep the source, review the proposed definition, and leave unanswered questions visible.',
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
        node('span', { text: 'See the original source, what was entered or read from it, and any calculation.' }),
      ]),
      node('div', {}, [
        node('b', { text: 'What authority it has' }),
        node('span', { text: 'Keeping a source, recording an observation, proposing a definition, and confirming it are separate steps. Reading a file does not approve it.' }),
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
    candidateHeading.textContent = 'WHAT WE HAVE ESTABLISHED OR PROPOSED';
  }
  const needsHeading = screen.querySelector('.needs-pane h2');
  if (needsHeading && needsHeading.dataset.narrativeLabel !== 'true') {
    needsHeading.dataset.narrativeLabel = 'true';
    needsHeading.textContent = 'WHAT IS STILL UNKNOWN';
  }

  const next = once(screen, 'next-question', () =>
    node('section', { className: 'narrative-next' }, [
      node('p', { className: 'narrative-kicker', text: 'Next question' }),
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
    node('p', { className: 'narrative-kicker', text: 'When a question needs a qualified person' }),
    node('p', { text: lead }),
    node('p', { className: 'route', text: 'You identify the question. The applicable rule determines who can answer it.' }),
    node('p', { className: 'holder-options', text: 'ASK THE QUALIFIED PERSON  ·  CHANGE THE PROJECT  ·  LEAVE IT UNRESOLVED' }),
    node('ul', {}, [
      node('li', { text: 'A qualified answer resolves one bounded question. It does not edit the project.' }),
      node('li', { text: 'The answer needs an author, declared standing, exact question/answer, scope, and conditions that void it.' }),
      node('li', { text: 'The holder sees the question, who it went to, and the scoped answer when it returns.' }),
      node('li', { text: 'Human review answers only the stated question within that person’s authority; it is not a general approval.' }),
      node('li', { text: 'Resolution is not release. Release is not readiness. Readiness is not Cycle Start.' }),
    ]),
    node('p', { className: 'narrative-copy', text: 'Routing, standing validation, expiry, blocking behavior, and persistence for qualified resolution are not implemented in this build.' }),
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
    node('p', { className: 'narrative-copy', text: 'The project originates with you. Every handoff should pass the same identified version. Downstream authority gets narrower, not broader.' }),
    chain,
    node('div', { className: 'authority-grid' }, AUTHORITY_STAGES.map((stage) =>
      node('article', { className: 'authority-stage', attrs: { 'data-authority-stage': stage.name } }, [
        node('h3', { text: stage.name }),
        node('p', { className: 'stage-subtitle', text: stage.subtitle }),
        node('p', {}, [node('strong', { text: 'OWNS — ' }), document.createTextNode(stage.owns)]),
        node('p', {}, [node('strong', { text: 'RECEIVES — ' }), document.createTextNode(stage.receives)]),
        node('p', {}, [node('strong', { text: 'MAY DO — ' }), document.createTextNode(stage.mayDo)]),
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
        text: 'The record brings together your sources, observations, exact versions, reviews, Store answers, and later events only when they are recorded. It preserves missing events and stopped versions; it creates no authority.',
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

