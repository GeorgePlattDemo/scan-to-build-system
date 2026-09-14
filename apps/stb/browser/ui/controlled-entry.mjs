const README_HREF = 'https://github.com/GeorgePlattDemo/scan-to-build-system#readme';

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  const { className, attrs, text } = options;
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      if (value !== undefined && value !== null) node.setAttribute(name, String(value));
    }
  }
  for (const child of children) if (child) node.append(child);
  return node;
}

function html(markup) {
  const template = document.createElement('template');
  template.innerHTML = markup.trim();
  return template.content.firstElementChild;
}

const GITHUB_MARK = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="4" cy="3.2" r="1.7"/><circle cx="4" cy="12.8" r="1.7"/><circle cx="12" cy="6.4" r="1.7"/><path d="M4 4.9v6.2"/><path d="M12 8.1v.6a2.4 2.4 0 0 1-2.4 2.4H6"/></svg>`;

function readmePill() {
  const link = el('a', {
    className: 'ghpill',
    attrs: { href: README_HREF, target: '_blank', rel: 'noopener' },
  }, [html(GITHUB_MARK), document.createTextNode('Readme')]);
  return el('div', { className: 'foot' }, [
    link,
    el('p', { text: 'Reference build. Input welcome.' }),
  ]);
}

function rail(rows) {
  return el('aside', { className: 'rail', attrs: { 'data-build-guide': 'true' } }, [
    el('p', { className: 'hd', text: 'BUILD GUIDE' }),
    el('p', { className: 'goal', text: 'Goal' }),
    ...rows.map(([title, body]) => el('div', { className: 'row' }, [
      el('b', { text: title }),
      el('span', { text: body }),
    ])),
    readmePill(),
  ]);
}

function backBar(where) {
  return el('div', { className: 'pagenav' }, [
    el('button', {
      attrs: { type: 'button', 'data-action': 'history-back' },
      text: '← Back',
    }),
    el('button', {
      attrs: { type: 'button', 'data-action': 'scroll-top' },
      text: '↑ Top',
    }),
    where ? el('span', { className: 'where', text: where }) : null,
  ]);
}

function controlledPage(main, guideRows, { id, backWhere } = {}) {
  if (backWhere) main.append(backBar(backWhere));
  return el('section', {
    className: 'controlled-page',
    attrs: id ? { id, 'data-controlled-page': id } : { 'data-controlled-page': 'true' },
  }, [main, rail(guideRows)]);
}

export function controlledLandingScreen(actorLabels) {
  const main = el('main', {
    className: 'main controlled-main',
    attrs: { 'data-screen': 'landing', 'data-shell': 'entry', 'data-actor': 'none' },
  }, [
    el('h1', { className: 'screen-heading', attrs: { id: 'screen-heading', tabindex: '-1' }, text: 'SCAN TO BUILD' }),
    el('p', { className: 'sub', text: 'Your idea. Your measurements. Your parts.' }),
    verb('YOU SCAN', 'Capture the space with laser, AR, or tape. The measurements are yours.'),
    verb('YOU DEFINE', "One part, several parts, or a need we don't offer yet."),
    verb('YOU SELECT', 'Set the material, size, doors, and other available options.'),
    verb('YOU CONFIRM', 'Approve exactly what you want built—and nothing else.'),
    verb('YOUR DEFINITION REACHES THE CUT', 'Your confirmed dimensions guide the work without being redrawn, retyped, or reinterpreted along the way.'),
    verb('WE CUT · MILL · DRILL · LABEL', "Within stated limits. Staged for pickup. We tell you when they're ready."),
    el('p', { className: 'you-build', text: 'YOU BUILD.' }),
    el('p', { className: 'starting-label', text: 'HOW ARE YOU STARTING?' }),
    el('div', { className: 'btns', attrs: { role: 'group', 'aria-label': 'HOW ARE YOU STARTING?' } }, [
      actorButton('new', actorLabels.new),
      actorButton('returning', actorLabels.returning),
      actorButton('professional', actorLabels.professional),
    ]),
  ]);
  return controlledPage(main, [
    ['Say what this is', 'One screen, no scrolling to understand it.'],
    ['Show who does what', 'Four steps are yours, one is ours.'],
    ['Make the seam visible', 'The definition reaches the cut unchanged.'],
    ['Offer three ways in', 'Same road after. Different opening.'],
  ], { id: 'landing' });
}

function actorButton(actor, label) {
  return el('button', {
    attrs: { type: 'button', 'data-action': 'choose-actor', 'data-actor': actor },
    text: label,
  });
}

function verb(title, body) {
  return el('p', { className: 'verb' }, [
    el('b', { text: title }),
    el('span', { className: 'dim', text: body }),
  ]);
}

const ORIENTATION = Object.freeze({
  new: Object.freeze({
    heading: "We don't sell products.",
    sub: "We capture what you want and turn it into parts. You tell us. That's what you get.",
    paragraphs: Object.freeze([
      ['No catalogue.', "Nothing here was made before you asked for it. There's no shelf sitting in a warehouse waiting to almost fit your wall."],
      ['No reinterpreting.', 'What you confirm is what gets cut. Not something close. Not something easier. Not something we thought you meant.'],
      ['No returns', ", because nothing is stock. Your parts are your parts. That's why the confirm step is real, and why we show you everything before you take it."],
      ["We don't check your numbers.", 'If the opening is 45½ and you enter 45, you get 45. The measurements are yours, and so is what comes back.'],
    ]),
    trailing: 'Nothing costs anything until you say so. Nothing gets cut today.',
    buttons: Object.freeze([['START', 'next', 'NEXT']]),
    rail: Object.freeze([
      ['Name the category', 'Not a store. Not a catalogue.'],
      ['Set expectation once', 'Made to your numbers, not picked off a shelf.'],
      ['Make confirm mean something', 'Nothing to return, so the step matters.'],
      ['Hand over responsibility', 'Your numbers, your parts. No scolding.'],
    ]),
  }),
  returning: Object.freeze({
    heading: 'Nothing moved while you were gone.',
    sub: 'Your measurements, your choices, your confirmed version — exactly as you left them.',
    lead: ['What changed is outside your project.', "What the store had on the rack, what the machine could do that day. Those were true when you asked. We'll ask again."],
    sectionHeading: 'Pick up, or do it again',
    paragraphs: Object.freeze([
      ['Resume.', 'Open it where you stopped.'],
      ['Make another.', 'Same project, new numbers. The second one takes minutes.'],
      ['Replace a part.', "One shelf, one panel. You don't reorder the whole thing."],
    ]),
    buttons: Object.freeze([
      ['OPEN A PROJECT', 'next', 'NEXT'],
      ['START SOMETHING NEW', 'next', null],
    ]),
    rail: Object.freeze([
      ["Don't start over", 'Everything saved is still saved.'],
      ["Trust what's saved", 'Nothing edited in the background.'],
      ['Second one is easy', 'Same project, new numbers.'],
      ['Parts stay orderable', 'Replace one, not all.'],
    ]),
  }),
  professional: Object.freeze({
    heading: 'Send us what you want. Nothing else.',
    sub: "We don't need your job file, your client list, or your pricing.",
    leadParagraphs: Object.freeze([
      ['The least that works:', "a material, a dimension, an operation. That's a part we can make."],
      ['Send more if it helps you.', 'A drawing, a photo, a PDF — we keep it with the job. Held as reference, not read.'],
    ]),
    sectionHeading: "Your customer's copy — your call",
    sectionSub: "Every job can carry a record your customer keeps. You decide what's in it.",
    paragraphs: Object.freeze([
      ['Nothing.', 'The job stays yours.'],
      ['Just the parts.', 'Names and sizes. Five years out, one shelf breaks — they order that one piece instead of calling you about a whole unit.'],
      ['Everything.', 'Parts, material, what was made and when.'],
    ]),
    trailing: "Different answer per job. It's your customer.",
    buttons: Object.freeze([
      ['ATTACH A FILE', 'next', 'NEXT'],
      ['TYPE IT IN', 'next', null],
    ]),
    rail: Object.freeze([
      ['Reduce friction', 'Send the least that works.'],
      ['Save time', 'No re-drawing, no re-quoting.'],
      ['Plan end early', 'Decide the handoff before the job starts.'],
      ['Offer organization tool', 'Part records his customer keeps.'],
    ]),
  }),
});

function richParagraph(title, body, className = '') {
  return el('p', { className }, [el('b', { text: title }), el('span', { className: 'dim', text: body })]);
}

export function controlledOrientationScreen(actorId) {
  const spec = ORIENTATION[actorId];
  if (!spec) return null;
  const children = [
    el('h1', { className: 'screen-heading', attrs: { id: 'screen-heading', tabindex: '-1' }, text: spec.heading }),
    el('p', { className: 'sub', text: spec.sub }),
  ];
  if (spec.lead) children.push(richParagraph(spec.lead[0], spec.lead[1], 'orientation-lead'));
  for (const pair of spec.leadParagraphs ?? []) children.push(richParagraph(pair[0], pair[1]));
  if (spec.sectionHeading) children.push(el('h2', { text: spec.sectionHeading }));
  if (spec.sectionSub) children.push(el('p', { className: 'dim orientation-section-sub', text: spec.sectionSub }));
  for (const pair of spec.paragraphs ?? []) children.push(richParagraph(pair[0], pair[1]));
  if (spec.trailing) children.push(el('p', { className: 'dim orientation-trailing', text: spec.trailing }));
  children.push(el('div', { className: 'btns' }, spec.buttons.map(([label, action, ariaLabel]) =>
    el('button', {
      attrs: {
        type: 'button',
        'data-action': action,
        ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
      },
      text: label,
    }),
  )));
  const main = el('main', {
    className: 'main controlled-main',
    attrs: { 'data-screen': 'orientation', 'data-shell': 'entry', 'data-actor': actorId },
  }, children);
  return controlledPage(main, spec.rail, { id: actorId === 'new' ? 'new-user' : actorId, backWhere: 'Back' });
}

const PROJECT_SVGS = Object.freeze({
  own: `<svg viewBox="0 0 100 72" aria-hidden="true"><defs><linearGradient id="plank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d5430"/><stop offset=".5" stop-color="#5e3d1f"/><stop offset="1" stop-color="#432a14"/></linearGradient></defs><rect width="100" height="72" fill="var(--surface)"/><g transform="rotate(-25 50 34)"><rect x="12" y="27" width="20" height="13" rx="3" fill="#3b2412" stroke="#241408" stroke-width="1.1"/><path d="M20 30 q6 4 0 8" fill="none" stroke="#6b4423" stroke-width="1.2"/><path d="M32 27.5 L88 30 L88 37.5 L32 40 Z" fill="#dfe4e9" stroke="#8b959e" stroke-width="1"/><path d="M34 32 L86 34" stroke="#b9c1c8" stroke-width=".9"/><path d="M34 40 l3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4" fill="none" stroke="#7c868f" stroke-width="1.3"/></g><g transform="rotate(25 50 34)"><rect x="12" y="28" width="76" height="12" rx="2.5" fill="#efa919" stroke="#9c6c0a" stroke-width="1.1"/><rect x="12" y="28" width="76" height="4" rx="2" fill="#ffc94d" opacity=".7"/><rect x="40" y="31" width="20" height="6" rx="3" fill="#fbf7ec" stroke="#9c6c0a" stroke-width=".9"/><circle cx="50" cy="34" r="2.2" fill="#8ed15a" stroke="#4e8a26" stroke-width=".6"/><rect x="22" y="31.5" width="6" height="5" rx="1.2" fill="#d18f0c"/><rect x="72" y="31.5" width="6" height="5" rx="1.2" fill="#d18f0c"/></g><g transform="translate(0 3)"><rect x="4" y="56" width="92" height="12" rx="2" fill="url(#plank)"/><g stroke="#33200f" stroke-width="1" opacity=".5"><path d="M4 60 Q50 58 96 61"/><path d="M4 65 Q50 63 96 66"/></g><ellipse cx="70" cy="62" rx="5" ry="3" fill="none" stroke="#33200f" stroke-width="1" opacity=".55"/><rect x="4" y="56" width="92" height="3" fill="#8e6136" opacity=".55"/></g></svg>`,
  alcove: `<svg viewBox="0 0 100 72" aria-hidden="true"><rect width="100" height="72" fill="#f3ece1"/><g transform="skewY(-7) translate(0 9)"><rect x="16" y="6" width="68" height="54" fill="#c89b62"/><rect x="20" y="10" width="60" height="46" fill="#e8d4b4"/><g fill="#c89b62"><rect x="20" y="22" width="60" height="3.5"/><rect x="20" y="36" width="60" height="3.5"/><rect x="20" y="50" width="60" height="3.5"/></g><g><rect x="24" y="12" width="4" height="10" fill="#8c4b3f"/><rect x="29" y="13" width="3" height="9" fill="#41618a"/><rect x="33" y="11" width="4" height="11" fill="#c2a03a"/><rect x="66" y="14" width="10" height="8" fill="#7fa05c" opacity=".85"/><rect x="24" y="27" width="4" height="9" fill="#5d7f63"/><rect x="29" y="26" width="3" height="10" fill="#8c4b3f"/><rect x="62" y="28" width="14" height="8" fill="#b9743f"/><rect x="24" y="41" width="12" height="9" fill="#41618a" opacity=".7"/><rect x="62" y="42" width="6" height="8" fill="#c2a03a"/></g><rect x="16" y="6" width="68" height="54" fill="none" stroke="#9a7343" stroke-width="1.4"/></g></svg>`,
  window: `<svg viewBox="0 0 100 72" aria-hidden="true"><rect width="100" height="72" fill="#efe6d8"/><rect x="4" y="4" width="92" height="64" fill="#dcbd8c"/><rect x="8" y="8" width="16" height="56" fill="#f0e2ca"/><rect x="76" y="8" width="16" height="56" fill="#f0e2ca"/><g fill="#8c4b3f"><rect x="10" y="12" width="3" height="9"/><rect x="79" y="34" width="3" height="9"/></g><g fill="#41618a"><rect x="14" y="13" width="3" height="8"/><rect x="83" y="35" width="3" height="8"/></g><g fill="#5d7f63"><rect x="18" y="11" width="3" height="10"/><rect x="87" y="33" width="3" height="10"/></g><g fill="#c89b62"><rect x="8" y="21" width="16" height="2.5"/><rect x="8" y="43" width="16" height="2.5"/><rect x="76" y="21" width="16" height="2.5"/><rect x="76" y="43" width="16" height="2.5"/></g><rect x="26" y="8" width="48" height="42" fill="#f5eee0"/><path d="M50 12 L70 24 L70 42 L50 48 L30 42 L30 24 Z" fill="#7ec0e8"/><path d="M50 12 L70 24 L70 42 L50 48 L30 42 L30 24 Z" fill="none" stroke="#c89b62" stroke-width="3"/><g fill="#6fa03f" opacity=".9"><ellipse cx="40" cy="38" rx="9" ry="7"/><ellipse cx="58" cy="36" rx="10" ry="8"/><ellipse cx="50" cy="42" rx="8" ry="5"/></g><circle cx="62" cy="22" r="4" fill="#ffe9a3" opacity=".9"/><rect x="28" y="50" width="44" height="8" rx="2.5" fill="#c0392b"/><rect x="28" y="50" width="44" height="3" rx="1.5" fill="#d9503f"/><rect x="26" y="58" width="48" height="6" fill="#e8d4b4"/><rect x="4" y="4" width="92" height="64" fill="none" stroke="#a87f4b" stroke-width="1.4"/></svg>`,
  picnic: `<svg viewBox="0 0 100 72" aria-hidden="true"><rect width="100" height="72" fill="#e7eddd"/><ellipse cx="50" cy="64" rx="44" ry="6" fill="#c3d3a8"/><path d="M27 27 L13 63 L20 63 L32 27 Z" fill="#a97c47" stroke="#7d5a30" stroke-width=".8"/><path d="M33 27 L47 63 L40 63 L28 27 Z" fill="#b98b52" stroke="#7d5a30" stroke-width=".8"/><path d="M67 27 L53 63 L60 63 L72 27 Z" fill="#a97c47" stroke="#7d5a30" stroke-width=".8"/><path d="M73 27 L87 63 L80 63 L68 27 Z" fill="#b98b52" stroke="#7d5a30" stroke-width=".8"/><rect x="23" y="44" width="54" height="4" fill="#9d7241"/><rect x="4" y="45" width="30" height="6" rx="1" fill="#c89b62" stroke="#8f6733" stroke-width=".8"/><rect x="66" y="45" width="30" height="6" rx="1" fill="#c89b62" stroke="#8f6733" stroke-width=".8"/><rect x="6" y="22" width="88" height="8" rx="1.5" fill="#dcae72" stroke="#8f6733" stroke-width="1"/><g stroke="#a87f4b" stroke-width=".8"><line x1="6" y1="24.7" x2="94" y2="24.7"/><line x1="6" y1="27.4" x2="94" y2="27.4"/></g><rect x="6" y="30" width="88" height="2" fill="#a87f4b"/></svg>`,
});

function projectTile({ kind, title, subtitle, action, classId, first = false, referenceId = null }) {
  return el('button', {
    className: `tile project-door${first ? ' first' : ''}`,
    attrs: {
      type: 'button',
      title,
      'data-project-door': kind,
      'data-action': action,
      ...(classId ? { 'data-class-id': classId } : {}),
      ...(referenceId ? { 'data-reference-id': referenceId } : {}),
    },
  }, [
    html(PROJECT_SVGS[kind]),
    el('span', { className: 't1', text: title === 'Start your own project' ? 'Start your own' : title }),
    el('span', { className: 't2', text: subtitle }),
  ]);
}

export function controlledPage1Main({ pendingSwitch = null, pendingCollision = null, switchDialog = null, collisionDialog = null } = {}) {
  const ribbon = el('div', { className: 'ribbon', attrs: { 'aria-label': 'Project doors' } }, [
    projectTile({ kind: 'own', title: 'Start your own project', subtitle: 'Board, sketch, or file', action: 'start-own', first: true }),
    projectTile({ kind: 'alcove', title: 'Critical fit', subtitle: 'Shelf insert', action: 'choose-mapped', classId: 'alcove-shelf-blanks' }),
    projectTile({ kind: 'window', title: 'Space utilization', subtitle: 'Window seat', action: 'open-window-seat-reference', referenceId: 'window-seat' }),
    projectTile({ kind: 'picnic', title: 'Outdoor build', subtitle: 'To fit your space', action: 'choose-mapped', classId: 'classic-picnic-table-fixture' }),
  ]);

  const body = el('div', { className: 'ribbonbody' }, [
    el('h1', { className: 'screen-heading project-heading', attrs: { id: 'screen-heading', tabindex: '-1' }, text: 'What are you making?' }),
    el('p', {}, [
      el('b', { text: 'A bounded project is one somebody already worked out.' }),
      el('span', { className: 'dim', text: " How the parts go together, what thickness holds up, where the fasteners land — that's settled. It doesn't get asked again." }),
    ]),
    el('p', { className: 'dim' }, [
      document.createTextNode("What's left is the part only you can answer: "),
      el('span', { className: 'strong-text', text: 'how big is your space, and what should it look like.' }),
      document.createTextNode(' Answer about ten questions and you get a list of parts, cut to your numbers.'),
    ]),
    el('p', { className: 'dim', text: "You're not designing furniture. If a question needs a woodworker to answer it, we shouldn't be asking you." }),
    el('p', { className: 'project-look-first' }, [
      el('b', { text: "That's why the list is worth a look first." }),
      el('span', { className: 'dim', text: " Not because your idea has to fit it — because when it does, you skip everything except the choices that are actually yours." }),
    ]),
    el('h3', { text: 'Some answers open more questions' }),
    el('p', { className: 'dim project-door-intro', text: "Doors on the bottom of the shelving, say. There's more than one way to do doors." }),
    el('ul', {}, [
      el('li', { text: 'Cut from flat stock, hinge cutouts machined, hardware pack to match' }),
      el('li', { text: 'Picked from a catalogue, our parts cut to suit them' }),
      el('li', { text: 'Just the machining — you already have the hinges you want' }),
      el('li', { text: 'No doors. You looked, you changed your mind.' }),
    ]),
    el('p', { className: 'dim project-say-no', text: 'Say no and none of it appears.' }),
    el('h3', { text: 'If nothing here is your thing' }),
    el('p', { className: 'dim project-miss', text: "Tell us anyway. We'd rather keep the record of what you wanted than push it into the closest thing on the list. Some of what's on this ribbon got here that way." }),
    backBar('Page 1'),
  ]);

  const main = el('main', {
    className: 'split controlled-main controlled-projects',
    attrs: { 'data-screen': 'begin', 'data-controlled-projects': 'true' },
  }, [ribbon, body]);

  const page = controlledPage(main, [
    ['Name the problem', 'Critical fit, not "shelving."'],
    ['Make it want touching', 'Color and character earn the click.'],
    ['Keep the door open', 'Start your own is first and never moves.'],
    ['Capture the miss', "A need we don't offer is worth keeping."],
  ], { id: 'projects' });

  const host = el('div', { className: 'controlled-page-host', attrs: { 'data-controlled-entry': 'projects' } }, [page]);
  if (pendingSwitch && switchDialog) host.append(switchDialog);
  if (pendingCollision && collisionDialog) host.append(collisionDialog);
  return host;
}

export const CONTROLLED_ENTRY_SOURCE = Object.freeze({
  name: 'stb-app-build-pages-0.9.html',
  sha256: 'c415bfd7047d42f4431384a612171b3ba56fc0d9cc54811c67f54d137860df8e',
  readme: README_HREF,
});
