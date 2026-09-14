const root = document.getElementById('app');

const VIEW_KEY = 'stb-restored-page1-view';

const LANDING_RAIL = [
  ['Say what this is', 'One screen, no scrolling to understand it.'],
  ['Show who does what', 'Four steps are yours, one is ours.'],
  ['Make the seam visible', 'The definition reaches the cut unchanged.'],
  ['Offer three ways in', 'Same road after. Different opening.'],
];

const PAGE1_RAIL = [
  ['Name the problem', 'Critical fit, not “shelving.”'],
  ['Make it want touching', 'Color and character earn the click.'],
  ['Keep the door open', 'Start your own is first and never moves.'],
  ['Capture the miss', 'A need we don’t offer is worth keeping.'],
];

const ACTORS = {
  new: {
    heading: 'We don’t sell products.',
    sub: 'We capture what you want and turn it into parts. You tell us. That’s what you get.',
    body: `
      <p><b>No catalogue.</b> <span class="rx-dim">Nothing here was made before you asked for it. There’s no shelf sitting in a warehouse waiting to almost fit your wall.</span></p>
      <p><b>No reinterpreting.</b> <span class="rx-dim">What you confirm is what gets cut. Not something close. Not something easier. Not something we thought you meant.</span></p>
      <p><b>No returns,</b> <span class="rx-dim">because nothing is stock. Your parts are your parts. That’s why the confirm step is real, and why we show you everything before you take it.</span></p>
      <p><b>We don’t check your numbers.</b> <span class="rx-dim">If the opening is 45½ and you enter 45, you get 45. The measurements are yours, and so is what comes back.</span></p>
      <p class="rx-dim" style="margin-top:18px">Nothing costs anything until you say so. Nothing gets cut today.</p>`,
    buttons: '<button type="button" data-action="next" data-rx-intent="projects">START</button>',
    rail: [
      ['Name the category', 'Not a store. Not a catalogue.'],
      ['Set expectation once', 'Made to your numbers, not picked off a shelf.'],
      ['Make confirm mean something', 'Nothing to return, so the step matters.'],
      ['Hand over responsibility', 'Your numbers, your parts. No scolding.'],
    ],
  },
  returning: {
    heading: 'Nothing moved while you were gone.',
    sub: 'Your measurements, your choices, your confirmed version — exactly as you left them.',
    body: `
      <p style="margin-bottom:24px"><b>What changed is outside your project.</b> <span class="rx-dim">What the store had on the rack, what the machine could do that day. Those were true when you asked. We’ll ask again.</span></p>
      <h2>Pick up, or do it again</h2>
      <p><b>Resume.</b> <span class="rx-dim">Open it where you stopped.</span></p>
      <p><b>Make another.</b> <span class="rx-dim">Same project, new numbers. The second one takes minutes.</span></p>
      <p><b>Replace a part.</b> <span class="rx-dim">One shelf, one panel. You don’t reorder the whole thing.</span></p>`,
    buttons: '<button type="button" data-action="next" data-rx-intent="resume">OPEN A PROJECT</button><button type="button" data-action="next" data-rx-intent="projects">START SOMETHING NEW</button>',
    rail: [
      ['Don’t start over', 'Everything saved is still saved.'],
      ['Trust what’s saved', 'Nothing edited in the background.'],
      ['Second one is easy', 'Same project, new numbers.'],
      ['Parts stay orderable', 'Replace one, not all.'],
    ],
  },
  professional: {
    heading: 'Send us what you want. Nothing else.',
    sub: 'We don’t need your job file, your client list, or your pricing.',
    body: `
      <p><b>The least that works:</b> <span class="rx-dim">a material, a dimension, an operation. That’s a part we can make.</span></p>
      <p style="margin-bottom:26px"><b>Send more if it helps you.</b> <span class="rx-dim">A drawing, a photo, a PDF — we keep it with the job. Held as reference, not read.</span></p>
      <h2>Your customer’s copy — your call</h2>
      <p class="rx-dim" style="margin-bottom:14px">Every job can carry a record your customer keeps. You decide what’s in it.</p>
      <p><b>Nothing.</b> <span class="rx-dim">The job stays yours.</span></p>
      <p><b>Just the parts.</b> <span class="rx-dim">Names and sizes. Five years out, one shelf breaks — they order that one piece instead of calling you about a whole unit.</span></p>
      <p><b>Everything.</b> <span class="rx-dim">Parts, material, what was made and when.</span></p>
      <p class="rx-dim">Different answer per job. It’s your customer.</p>`,
    buttons: '<button type="button" data-action="next" data-rx-intent="professional-attach">ATTACH A FILE</button><button type="button" data-action="next" data-rx-intent="professional-type">TYPE IT IN</button>',
    rail: [
      ['Reduce friction', 'Send the least that works.'],
      ['Save time', 'No re-drawing, no re-quoting.'],
      ['Plan end early', 'Decide the handoff before the job starts.'],
      ['Offer organization tool', 'Part records his customer keeps.'],
    ],
  },
};

const WINDOW_STEPS = [
  {
    tag: '01 · Intent', title: 'The Object She Wants',
    narrative: 'She is not asking for lumber. She is asking for a useful fixture: storage, seating, symmetry, and a strange window turned into the center of the design. The cushion turns this from shelving into a real home seating fixture.',
    resolves: ['Human outcome named before machine logic begins', 'Fixture class: window seat + side towers', 'The hex window becomes a feature, not an obstruction'],
  },
  {
    tag: '02 · Capture', title: 'The Room Becomes Data',
    narrative: 'The scan does not merely measure a wall. It creates a bounded envelope the system can safely reason about.',
    resolves: ['103″ overall wall width', '24″ / 55″ / 24″ class layout', '14″ depth target, crown clearance, floor slope, wall bow, and hex-window no-cut zone'],
  },
  {
    tag: '03 · Constraints', title: 'The Shape Locks In',
    narrative: 'The system converts the captured room into a buildable geometry. The project is no longer a sketch; it is a constrained object.',
    resolves: ['Left tower, center seat, and right tower zones', 'Window clearance and backer-panel zones', 'Bench-span warning surfaced for the 55″ seat zone'],
  },
  {
    tag: '04 · Materials', title: 'Real Lumber Enters the System',
    narrative: 'The system should not pretend a 14″ cherry board is ordinary. It resolves the fixture through realistic stock: paired 1×8 boards and sheet goods. Biscuit-slot cutting is included because it is a subtractive machine operation; glue-up remains downstream.',
    resolves: ['D-stream: paired 1×8 cherry boards', 'S-stream: two 5/16″ cherry plywood sheets', '100 #20 biscuits as practical BOM quantity'],
  },
  {
    tag: '05 · Gate', title: 'The System Refuses Guesswork',
    narrative: 'The manufacturability gate is where the system decides whether the packet is safe enough to produce. The purpose is not speed alone; it is controlled permission.',
    resolves: ['Scan confidence and material availability', 'Machine envelope, sheet nesting, tab clearance, and label completeness', 'Cycle-time field reserved for engineering validation'],
  },
  {
    tag: '06 · Packet', title: 'The Packet Is Born',
    narrative: 'The messy home object has become a bounded Manufacturing Execution Packet. The packet contains what machines need, what people need, and what remains outside this subtractive-processing cycle.',
    resolves: ['BOM, cut list, linear footage, and machine operation maps', 'Biscuit-slot map, sheet-routing map, tab map, drilling map, and labels', 'Cycle-time output field: packet-computed after engineering validation'],
  },
  {
    tag: '07 · Roles + Streams', title: 'The Expert Chain Collapses / Two Streams Run',
    narrative: 'This is not just automation. The system moves decisions upstream so the downstream role becomes supervised execution rather than specialist interpretation. The screen shows machine-running operations only and excludes glue-up, finishing, cushion fabrication, delivery, and installation.',
    resolves: ['Conventional authoring chain replaced by packet logic', 'D-stream operations for dimensional cherry', 'S-stream operations for sheet goods'],
  },
  {
    tag: '08 · Bundle + SKU Boundary', title: 'The Parts Leave With Names',
    narrative: 'The system does not output anonymous parts. It outputs named relationships so the downstream process can be taught and tested. Project 2 stops at the subtractive-processing packet; the last mile is separated into teachable, testable, ownable modules.',
    resolves: ['Labeled machine-processed bundle', 'Plywood tabs intact for downstream handling', 'Glue-up, finish, cushion, delivery, installation, and feedback as separate SKUs'],
  },
  {
    tag: '09 · Invitation', title: 'The Invitation',
    narrative: 'The purpose of Project 2 is not to pretend the last mile is finished. The purpose is to show that the remaining work is bounded enough for institutions to teach, test, improve, and potentially own.',
    resolves: ['The patented spine remains visible', 'Implementation layers are separated from downstream SKU layers', 'Institutional contribution lanes are explicit'],
  },
];

let windowStep = 0;
let queued = false;

function rail(rows) {
  return `<aside class="rx-rail"><p class="hd">BUILD GUIDE</p><p class="goal">Goal</p>${rows.map(([a,b]) => `<div class="row"><b>${a}</b><span>${b}</span></div>`).join('')}<div class="foot"><button type="button" data-rx-notes>Build notes ↗</button><p>Reference build. Input welcome.</p></div></aside>`;
}

function projectSvg(kind) {
  if (kind === 'own') return `<svg viewBox="0 0 100 72" aria-hidden="true"><defs><linearGradient id="rx-plank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d5430"/><stop offset=".5" stop-color="#5e3d1f"/><stop offset="1" stop-color="#432a14"/></linearGradient></defs><rect width="100" height="72" fill="var(--surface)"/><g transform="rotate(-25 50 34)"><rect x="12" y="27" width="20" height="13" rx="3" fill="#3b2412"/><path d="M32 27.5 L88 30 L88 37.5 L32 40 Z" fill="#dfe4e9" stroke="#8b959e"/><path d="M34 40 l3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4 3.4-3.4 3.4 3.4 3.4-3.4 3.4" fill="none" stroke="#7c868f"/></g><g transform="rotate(25 50 34)"><rect x="12" y="28" width="76" height="12" rx="2.5" fill="#efa919" stroke="#9c6c0a"/><rect x="40" y="31" width="20" height="6" rx="3" fill="#fbf7ec" stroke="#9c6c0a"/><circle cx="50" cy="34" r="2.2" fill="#8ed15a" stroke="#4e8a26"/></g><rect x="4" y="59" width="92" height="10" rx="2" fill="url(#rx-plank)"/></svg>`;
  if (kind === 'alcove') return `<svg viewBox="0 0 100 72" aria-hidden="true"><rect width="100" height="72" fill="#f3ece1"/><g transform="skewY(-7) translate(0 9)"><rect x="16" y="6" width="68" height="54" fill="#c89b62"/><rect x="20" y="10" width="60" height="46" fill="#e8d4b4"/><g fill="#c89b62"><rect x="20" y="22" width="60" height="3.5"/><rect x="20" y="36" width="60" height="3.5"/><rect x="20" y="50" width="60" height="3.5"/></g><rect x="16" y="6" width="68" height="54" fill="none" stroke="#9a7343" stroke-width="1.4"/></g></svg>`;
  if (kind === 'window') return `<svg viewBox="0 0 100 72" aria-hidden="true"><rect width="100" height="72" fill="#efe6d8"/><rect x="4" y="4" width="92" height="64" fill="#dcbd8c"/><rect x="8" y="8" width="16" height="56" fill="#f0e2ca"/><rect x="76" y="8" width="16" height="56" fill="#f0e2ca"/><rect x="26" y="8" width="48" height="42" fill="#f5eee0"/><path d="M50 12 L70 24 L70 42 L50 48 L30 42 L30 24 Z" fill="#7ec0e8" stroke="#c89b62" stroke-width="3"/><rect x="28" y="50" width="44" height="8" rx="2.5" fill="#c0392b"/><rect x="26" y="58" width="48" height="6" fill="#e8d4b4"/></svg>`;
  return `<svg viewBox="0 0 100 72" aria-hidden="true"><rect width="100" height="72" fill="#e7eddd"/><ellipse cx="50" cy="64" rx="44" ry="6" fill="#c3d3a8"/><path d="M27 27 L13 63 L20 63 L32 27 Z" fill="#a97c47"/><path d="M33 27 L47 63 L40 63 L28 27 Z" fill="#b98b52"/><path d="M67 27 L53 63 L60 63 L72 27 Z" fill="#a97c47"/><path d="M73 27 L87 63 L80 63 L68 27 Z" fill="#b98b52"/><rect x="23" y="44" width="54" height="4" fill="#9d7241"/><rect x="4" y="45" width="30" height="6" fill="#c89b62"/><rect x="66" y="45" width="30" height="6" fill="#c89b62"/><rect x="6" y="22" width="88" height="8" fill="#dcae72"/></svg>`;
}

function tile(kind, title, sub, attrs, first = false) {
  return `<button type="button" class="rx-tile${first ? ' first' : ''}" ${attrs}>${projectSvg(kind)}<span class="t1">${title}</span><span class="t2">${sub}</span></button>`;
}

function captureSvg() {
  return `<svg class="rx-capture-svg" viewBox="0 0 380 200" aria-label="Dimensioned room capture illustration">
    <rect width="380" height="200" fill="#f2ece2"/><rect width="380" height="18" fill="#e3d9ca"/><rect y="182" width="380" height="18" fill="#d9c7a8"/>
    <rect x="75" y="104" width="111" height="78" fill="#e6ddd0"/><rect x="84" y="112" width="93" height="70" fill="#dbd0c0"/><rect x="99" y="121" width="63" height="54" fill="#2e2620"/><rect x="68" y="98" width="125" height="6.5" fill="#b0824a"/>
    <path d="M186 104 Q190.5 61 186 18" fill="none" stroke="#8f8371" stroke-width="1.5"/><line x1="265" y1="183.6" x2="265" y2="18" stroke="#8f8371" stroke-width="1.5"/>
    <g stroke="#2f6f9e" stroke-width="1.4" fill="none"><line x1="186" y1="40" x2="265" y2="40"/><path d="M186 36 l0 8 M265 36 l0 8"/></g><rect x="200" y="32" width="51" height="15" rx="3" fill="#f2ece2" stroke="#2f6f9e"/><text x="225" y="43" font-size="10" fill="#2f6f9e" text-anchor="middle">45½ in</text>
    <g stroke="#2f6f9e" stroke-width="1.4" fill="none"><line x1="56" y1="101" x2="56" y2="182"/><path d="M52 101 l8 0 M52 182 l8 0"/></g><rect x="6" y="133" width="46" height="15" rx="3" fill="#f2ece2" stroke="#2f6f9e"/><text x="29" y="144" font-size="10" fill="#2f6f9e" text-anchor="middle">45 in</text><text x="29" y="158" font-size="8.5" fill="#7d9bb3" text-anchor="middle">mantel</text>
    <line x1="190" y1="69" x2="261" y2="69" stroke="#c0392b" stroke-width="1.3" stroke-dasharray="6 4"/><g stroke="#c0392b" stroke-width="1.4"><line x1="300" y1="69" x2="300" y2="182"/></g><rect x="310" y="118" width="48" height="15" rx="3" fill="#f2ece2" stroke="#c0392b"/><text x="334" y="129" font-size="10" fill="#c0392b" text-anchor="middle">65 in</text><text x="334" y="143" font-size="8.5" fill="#c88a80" text-anchor="middle">shelf top</text>
    <text x="221" y="55" font-size="8.5" fill="#c0392b">recessed wall bows in ½ in</text><text x="234" y="196" font-size="8.5" fill="#c0392b" text-anchor="end">floor slopes 1.2°</text><text x="333" y="26" font-size="8.5" fill="#a09484" text-anchor="end">drawn to scale · 94½ in ceiling</text>
  </svg>`;
}

function windowSvg() {
  return `<svg class="rx-window-svg" viewBox="0 0 760 360" fill="none" aria-label="Window seat fixture wireframe"><rect x="30" y="42" width="700" height="282" rx="18" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="54" y="72" width="166" height="226" rx="8" fill="#fff" stroke="#92400e" stroke-width="3"/><rect x="540" y="72" width="166" height="226" rx="8" fill="#fff" stroke="#92400e" stroke-width="3"/><rect x="236" y="72" width="288" height="226" rx="8" fill="#fff" stroke="#d6d3d1" stroke-width="2"/><g stroke="#a16207" stroke-width="4"><line x1="72" y1="112" x2="202" y2="112"/><line x1="72" y1="154" x2="202" y2="154"/><line x1="72" y1="196" x2="202" y2="196"/><line x1="558" y1="112" x2="688" y2="112"/><line x1="558" y1="154" x2="688" y2="154"/><line x1="558" y1="196" x2="688" y2="196"/></g><polygon points="380,96 430,122 430,176 380,204 330,176 330,122" fill="#e0f2fe" stroke="#1e40af" stroke-width="3"/><rect x="260" y="254" width="240" height="42" rx="9" fill="#fff" stroke="#92400e" stroke-width="3"/><rect x="268" y="240" width="224" height="22" rx="11" fill="#b91c1c" opacity=".9"/><text x="380" y="256" fill="#fff" font-size="13" text-anchor="middle" font-weight="700">cushion</text><text x="137" y="58" font-size="14" fill="#92400e" text-anchor="middle">24″ left tower</text><text x="380" y="58" font-size="14" fill="#44403c" text-anchor="middle">55″ center / window / seat</text><text x="623" y="58" font-size="14" fill="#92400e" text-anchor="middle">24″ right tower</text><text x="380" y="344" font-size="13" fill="#78716c" text-anchor="middle">103″ overall wall width · 14″ finished depth target</text></svg>`;
}

function installStyle() {
  if (document.getElementById('stb-restored-experience-style')) return;
  const style = document.createElement('style');
  style.id = 'stb-restored-experience-style';
  style.textContent = `
    :root{--bg:#faf9f7;--surface:#fff;--rail:#f4f2ef;--tint:#f6efe4;--grass:#eef2e6;--border:#e3ded7;--border-accent:#d9c3a2;--text:#1c1917;--text-2:#57534e;--text-3:#8a8580;--accent:#7a4f22}
    #app{width:min(1040px,100%);margin:0 auto;padding:28px 20px 28px}
    .rx-host>:not([data-restored-surface]){display:none!important}
    .rx-page{display:grid;grid-template-columns:1fr 172px;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--surface);margin-bottom:24px;color:var(--text)}
    .rx-main{padding:28px 26px;border-right:1px solid var(--border);min-width:0}.rx-split{display:flex;min-width:0;border-right:1px solid var(--border)}
    .rx-page h1{margin:0 0 12px;font-size:25px;line-height:1.2;letter-spacing:-.01em}.rx-page h2{margin:20px 0 10px;font-size:18px}.rx-page h3{margin:0 0 5px;font-size:16px}.rx-page p{margin:0 0 12px}.rx-sub{margin:0 0 22px;color:var(--text-2)}.rx-dim{color:var(--text-2)}
    .rx-btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.rx-page button{font:inherit;font-size:13px;padding:8px 16px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);cursor:pointer}.rx-page button:hover{border-color:var(--text-3)}
    .rx-rail{background:var(--rail);padding:24px 14px 16px;display:flex;flex-direction:column}.rx-rail .hd{font-size:10px;font-weight:600;letter-spacing:.08em;color:var(--text-3);margin:0 0 24px}.rx-rail .goal{font-size:13px;font-weight:600;margin:0 0 30px}.rx-rail .row{margin:0 0 28px}.rx-rail .row b{display:block;font-size:13px;margin-bottom:3px}.rx-rail .row span{font-size:11.5px;line-height:1.45;color:var(--text-2)}.rx-rail .foot{margin-top:auto;padding-top:14px;border-top:1px solid var(--border)}.rx-rail .foot button{width:100%;font-size:11.5px}.rx-rail .foot p{margin:8px 0 0;font-size:10px;color:var(--text-3)}
    .rx-ribbon{width:128px;flex:none;border-right:1px solid var(--border);background:var(--rail);padding:14px 10px;display:flex;flex-direction:column;gap:12px}.rx-ribbonbody{padding:18px;min-width:0}.rx-ribbonbody ul{margin:0 0 10px;padding-left:18px;color:var(--text-2)}
    .rx-tile{display:block!important;padding:0!important;border:0!important;background:transparent!important;border-radius:0!important;text-align:left!important;width:100%!important}.rx-tile svg{width:100%;display:block;border-radius:9px;border:1px solid var(--border);background:var(--surface)}.rx-tile.first svg{border-color:var(--border-accent)}.rx-tile .t1{display:block;margin:5px 0 0;font-size:11px;font-weight:600;line-height:1.2}.rx-tile.first .t1{color:var(--accent)}.rx-tile .t2{display:block;margin:1px 0 0;font-size:9.5px;line-height:1.25;color:var(--text-3)}
    .rx-boards{display:flex;gap:8px;margin-bottom:16px;overflow-x:auto}.rx-board{flex:none;width:66px}.rx-swatch{height:52px;border-radius:8px;border:1px solid rgba(0,0,0,.22);box-shadow:inset 0 -6px 10px -6px rgba(0,0,0,.3)}.rx-board p{margin:4px 0 0;font-size:11px;font-weight:600}.rx-hero{background:var(--tint);border:1px solid var(--border-accent);border-radius:10px;padding:14px 16px;margin-bottom:16px;color:var(--accent)}.rx-hero .lead{font-size:15px;font-weight:600;margin-bottom:3px}.rx-step{display:flex;gap:10px;margin-bottom:10px;font-size:14px;line-height:1.5}.rx-step .n{color:var(--text-3);width:14px;flex:none}
    .rx-door-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0}.rx-door-grid button{text-align:left;padding:11px 13px;background:var(--surface)}.rx-door-grid button b{display:block;margin-bottom:2px}.rx-door-grid button span{font-size:11.5px;color:var(--text-2);line-height:1.4}.rx-keep{background:var(--rail);border-radius:9px;padding:12px 14px;margin:16px 0;font-size:12.5px}.rx-keep p{margin:0 0 5px}
    .rx-capture-svg,.rx-window-svg{width:100%;display:block;background:#f2ece2;border-radius:9px;margin:8px 0 18px}.rx-live{margin-top:18px;border-top:1px solid var(--border);padding-top:18px}.rx-live>.child-panel,.rx-live>.pane,.rx-live>.project-configurator,.rx-live>[data-project-configurator]{display:block!important;margin:0 0 12px!important;border-color:var(--border)!important}.rx-live .narrative-band,.rx-live .narrative-card,.rx-live [data-published-starts],.rx-live [data-open-door]{display:none!important}
    .rx-banner{background:var(--tint);border:1px solid var(--border-accent);border-radius:9px;padding:11px 13px;margin:0 0 16px;font-size:12.5px;color:var(--accent)}.rx-chain{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin:16px 0;font-size:11px}.rx-chain b{background:var(--tint);border:1px solid var(--border-accent);color:var(--accent);border-radius:20px;padding:4px 10px}.rx-stage{border:1px solid var(--border);border-radius:10px;margin-bottom:10px;overflow:hidden}.rx-stage h4{margin:0;padding:9px 14px;background:var(--rail);font-size:13.5px;border-bottom:1px solid var(--border)}.rx-stage-grid{display:grid;grid-template-columns:1fr 1fr}.rx-cell{padding:9px 14px;font-size:12.5px;line-height:1.5;border-bottom:1px solid var(--border)}.rx-cell:nth-child(odd){border-right:1px solid var(--border)}.rx-cell b{display:block;font-size:9.5px;letter-spacing:.07em;color:var(--text-3)}
    .rx-window-steps{display:flex;gap:5px;flex-wrap:wrap;margin:0 0 14px}.rx-window-steps button{font-size:10.5px;padding:5px 8px}.rx-window-steps button.on{background:var(--tint);border-color:var(--border-accent);color:var(--accent);font-weight:600}.rx-resolves{margin:12px 0 0;padding-left:18px;color:var(--text-2)}.rx-reference{font-size:12px;color:var(--text-3);border-top:1px solid var(--border);padding-top:12px;margin-top:16px}
    .rx-picnic-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:14px}.rx-picnic-grid button{text-align:left;padding:0;overflow:hidden;background:var(--surface)}.rx-picnic-grid svg{display:block;width:100%;background:#eef2e6}.rx-picnic-grid span{display:block;padding:7px 9px}.rx-picnic-grid b{display:block;font-size:12px}.rx-picnic-grid small{display:block;color:var(--text-3)}
    @media(max-width:760px){#app{padding:16px 12px}.rx-page{grid-template-columns:1fr}.rx-main,.rx-split{border-right:0;border-bottom:1px solid var(--border)}.rx-ribbon{width:112px}.rx-stage-grid,.rx-door-grid{grid-template-columns:1fr}.rx-rail .row,.rx-rail .goal{margin-bottom:16px}}
  `;
  document.head.append(style);
}

function mount(screen, html) {
  if (!screen) return null;
  screen.classList.add('rx-host');
  let surface = screen.querySelector(':scope > [data-restored-surface]');
  if (!surface) {
    surface = document.createElement('div');
    surface.dataset.restoredSurface = 'true';
    screen.prepend(surface);
  }
  surface.innerHTML = html;
  return surface;
}

function landing(screen) {
  if (screen.dataset.rx === 'landing') return;
  screen.dataset.rx = 'landing';
  mount(screen, `<section class="rx-page"><div class="rx-main"><h1 class="screen-heading" id="screen-heading" tabindex="-1">SCAN TO BUILD</h1><p class="rx-sub">Your idea. Your measurements. Your parts.</p>
    <p><b>YOU SCAN</b><br><span class="rx-dim">Capture the space with laser, AR, or tape. The measurements are yours.</span></p>
    <p><b>YOU DEFINE</b><br><span class="rx-dim">One part, several parts, or a need we don’t offer yet.</span></p>
    <p><b>YOU SELECT</b><br><span class="rx-dim">Set the material, size, doors, and other available options.</span></p>
    <p><b>YOU CONFIRM</b><br><span class="rx-dim">Approve exactly what you want built—and nothing else.</span></p>
    <p><b>YOUR DEFINITION REACHES THE CUT</b><br><span class="rx-dim">Your confirmed dimensions guide the work without being redrawn, retyped, or reinterpreted along the way.</span></p>
    <p><b>WE CUT · MILL · DRILL · LABEL</b><br><span class="rx-dim">Within stated limits. Staged for pickup. We tell you when they’re ready.</span></p>
    <p style="font-weight:600;font-size:16px;margin:0 0 24px">YOU BUILD.</p><p style="font-size:13px;font-weight:600;letter-spacing:.05em;color:var(--text-2);margin:0">HOW ARE YOU STARTING?</p>
    <div class="rx-btns"><button type="button" data-action="choose-actor" data-actor="new">NEW USER</button><button type="button" data-action="choose-actor" data-actor="returning">RETURNING USER</button><button type="button" data-action="choose-actor" data-actor="professional">PROFESSIONAL</button></div></div>${rail(LANDING_RAIL)}</section>`);
}

function orientation(screen) {
  const actor = screen.dataset.actor;
  const data = ACTORS[actor];
  if (!data || screen.dataset.rx === `orientation-${actor}`) return;
  screen.dataset.rx = `orientation-${actor}`;
  mount(screen, `<section class="rx-page"><div class="rx-main"><h1 class="screen-heading" id="screen-heading" tabindex="-1">${data.heading}</h1><p class="rx-sub">${data.sub}</p>${data.body}<div class="rx-btns">${data.buttons}</div></div>${rail(data.rail)}</section>`);
}

function page1(screen) {
  const family = new URLSearchParams(window.location.search).get('family');
  if (family === 'picnic') return picnicChooser(screen);
  if (sessionStorage.getItem(VIEW_KEY) === 'window-seat') return windowSeat(screen);
  if (screen.dataset.rx === 'page1') return;
  screen.dataset.rx = 'page1';
  mount(screen, `<section class="rx-page"><div class="rx-split"><div class="rx-ribbon">
    ${tile('own','Start your own','Board, sketch, or file','data-front-door="start-own"',true)}
    ${tile('alcove','Critical fit','Shelf insert','data-front-door="alcove"')}
    ${tile('window','Space utilization','Window seat','data-front-door="window-seat"')}
    ${tile('picnic','Outdoor build','To fit your space','data-front-door="picnic"')}
    </div><div class="rx-ribbonbody"><h1 class="screen-heading" id="screen-heading" tabindex="-1" style="font-size:21px;margin-bottom:14px">What are you making?</h1>
    <p><b>A bounded project is one somebody already worked out.</b> <span class="rx-dim">How the parts go together, what thickness holds up, where the fasteners land — that’s settled. It doesn’t get asked again.</span></p>
    <p class="rx-dim">What’s left is the part only you can answer: <span style="color:var(--text)">how big is your space, and what should it look like.</span> Answer about ten questions and you get a list of parts, cut to your numbers.</p>
    <p class="rx-dim">You’re not designing furniture. If a question needs a woodworker to answer it, we shouldn’t be asking you.</p>
    <p style="margin-bottom:20px"><b>That’s why the list is worth a look first.</b> <span class="rx-dim">Not because your idea has to fit it — because when it does, you skip everything except the choices that are actually yours.</span></p>
    <h3>Some answers open more questions</h3><p class="rx-dim" style="margin-bottom:7px">Doors on the bottom of the shelving, say. There’s more than one way to do doors.</p><ul><li>Cut from flat stock, hinge cutouts machined, hardware pack to match</li><li>Picked from a catalogue, our parts cut to suit them</li><li>Just the machining — you already have the hinges you want</li><li>No doors. You looked, you changed your mind.</li></ul><p class="rx-dim" style="margin-bottom:20px">Say no and none of it appears.</p>
    <h3>If nothing here is your thing</h3><p class="rx-dim">Tell us anyway. We’d rather keep the record of what you wanted than push it into the closest thing on the list. Some of what’s on this ribbon got here that way.</p>
    </div></div>${rail(PAGE1_RAIL)}</section>`);
}

function boardSwatches() {
  const boards = [
    ['1×6 pine','linear-gradient(178deg,#E0BC55,#C9A227 45%,#B99320)'],
    ['1×6 poplar','linear-gradient(178deg,#B2B98C,#9FA678 50%,#8E9569)'],
    ['1×6 cherry','linear-gradient(178deg,#BA6435,#A6522C 45%,#8E4423)'],
    ['1×8 oak','linear-gradient(178deg,#D4B27C,#C4A06A 48%,#B08E58)'],
    ['2×4 stud','linear-gradient(178deg,#E4D8BC,#D8C9A8 50%,#C9B995)'],
    ['¾ plywood','linear-gradient(178deg,#C09B63,#B08D57 50%,#9E7D4B)'],
  ];
  return `<div class="rx-boards">${boards.map(([name,bg],i)=>`<button type="button" class="rx-board" data-rx-child="${i===4?'board':'board'}" aria-label="${name}"><div class="rx-swatch" style="background:${bg}"></div><p>${name}</p></button>`).join('')}</div>`;
}

function intakeDoors() {
  return `<div class="rx-door-grid">
    <button type="button" data-rx-child="measurements"><b>Tell us what you want</b><span>A sentence is enough to start.</span></button>
    <button type="button" data-rx-child="measurements"><b>Enter measurements</b><span>Type what you took. Fractions or decimals.</span></button>
    <button type="button" data-rx-child="sketch"><b>Add photos</b><span>A picture of the space or the thing.</span></button>
    <button type="button" data-rx-child="scan"><b>Scan it</b><span>Phone, LiDAR, AR — whatever you used.</span></button>
    <button type="button" data-rx-child="sketch"><b>Sketch it</b><span>On paper, on a napkin, on your screen.</span></button>
    <button type="button" data-rx-back-begin><b>Use a previous project</b><span>Reorder, replace one part, or start from it.</span></button>
    <button type="button" data-rx-child="drawing"><b>Attach a file</b><span>Drawing, PDF, cut list, takeoff, spreadsheet, CAD.</span></button>
    <button type="button" data-rx-child="measurements"><b>I’m not sure</b><span>Start with a question. We’ll work it out.</span></button>
  </div>`;
}

function startOwn(screen) {
  if (screen.dataset.rx === 'start-own') return;
  screen.dataset.rx = 'start-own';
  mount(screen, `<section class="rx-page"><div class="rx-main"><h1 class="screen-heading" id="screen-heading" tabindex="-1" style="font-size:21px;margin-bottom:3px">Start your own project</h1><p class="rx-sub" style="font-size:13.5px">Nothing on the list fits? Fine. Here’s what we can do for you.</p>
    ${boardSwatches()}<div class="rx-hero"><p class="lead">Grab a board and tell us what you want done to it.</p><p>Cut it to length. Put a hole in it. That’s a whole project and it’s a perfectly good reason to be here. Everything below is the same idea with more in it.</p></div>
    <p class="rx-dim" style="font-size:13.5px">More ways we can help, roughly easiest first.</p>
    <div class="rx-step"><span class="n">2</span><span><b>Add pieces as you go.</b> <span class="rx-dim">One board, then the next. You don’t have to know the whole thing up front.</span></span></div>
    <div class="rx-step"><span class="n">3</span><span><b>Just tell us in plain words.</b> <span class="rx-dim">Say what you’re after and we’ll write down what we heard. You check it.</span></span></div>
    <div class="rx-step"><span class="n">4</span><span><b>Type the numbers.</b> <span class="rx-dim">Lengths, widths, where the holes go. We draw it back so you can see it.</span></span></div>
    <div class="rx-step"><span class="n">5</span><span><b>Send a scan or a photo.</b> <span class="rx-dim">Phone, laser, a picture of the wall. Even a napkin sketch.</span></span></div>
    <div class="rx-step"><span class="n">6</span><span><b>Draw it here.</b> <span class="rx-dim">Boxes at right angles, which is most of what wood is. Enough for a bench or a frame.</span></span></div>
    <div class="rx-step"><span class="n">7</span><span><b>Bring what you already have.</b> <span class="rx-dim">A cut list, a PDF, a CAD export. Keep working in the tool you know — we’ll take what it gives us.</span></span></div>
    <p class="rx-dim" style="font-size:13.5px">Nobody climbs the whole list. Come in where you are, and move up only if it helps.</p>
    <h2>Bring what you have.</h2><p class="rx-sub">You don’t have to put it in our format first. Give us whatever you’ve already got and we’ll work out what’s missing.</p>${intakeDoors()}
    <p class="rx-dim" style="font-size:13px"><b style="color:var(--text)">Bring more than one.</b> A photo, your tape measurements, and a PDF of the bracket is one project — not three.</p>
    <div class="rx-keep"><p style="font-weight:600">What we promise, and what we don’t</p><p class="rx-dim"><b style="color:var(--text)">We keep your source.</b> The file stays the file. Nothing overwrites it.</p><p class="rx-dim"><b style="color:var(--text)">We read what we reliably can</b> — and show you what we read, and where it came from.</p><p class="rx-dim"><b style="color:var(--text)">We tell you what we couldn’t establish</b> instead of filling it in.</p><p class="rx-dim"><b style="color:var(--text)">We ask only for what’s still missing.</b> If your file already says the quantity, we don’t ask you the quantity.</p></div>
    <p class="rx-dim" style="font-size:12.5px">Nothing here becomes your project definition until you review it and confirm it.</p></div>${rail([['Floor is one board','A cut is a project. Start there.'],['Sort by effort','Not by who they are. No beginner box.'],['Offer, don’t instruct','What we can do, not what they must.'],['No wrong entry','Every rung is a complete path.']])}</section>`);
}

function liveChild(screen) {
  const child = screen.dataset.child;
  if (!child) return startOwn(screen);
  if (screen.dataset.rx === `child-${child}`) return;
  screen.dataset.rx = `child-${child}`;
  const title = child === 'scan' ? 'Define your project to your space — and your taste' : 'Here’s what we got';
  const intro = child === 'scan' ? `${captureSvg()}<p><b>Start with a scan if you have one.</b> <span class="rx-dim">Your phone can capture the room — the walls, the opening, roughly where things sit. That gives us context.</span></p><p><b>A scan is not a measurement.</b> <span class="rx-dim">It’s close, and close is fine for context. It isn’t fine for a part that has to slide into a 45½-inch opening with a quarter inch to spare.</span></p><p><b>So you take the ones that matter.</b> <span class="rx-dim">Width at the top, middle and bottom. Height on both sides. Depth front to back. Record slope, bow and twist; don’t silently correct them.</span></p><p><b>You decide which numbers are controlling.</b> <span class="rx-dim">Everything else stays as context.</span></p>` : `<p class="rx-sub">Your source, what we could read, what we couldn’t, and the one thing we still need.</p><p class="rx-dim">Extraction is a <b style="color:var(--text)">candidate</b>, never a fact. A candidate becomes controlling only when you say it does. Nothing on this page is your definition yet.</p>`;
  const surface = mount(screen, `<section class="rx-page"><div class="rx-main"><h1 class="screen-heading" id="screen-heading" tabindex="-1">${title}</h1>${intro}<div class="rx-live" data-rx-live></div></div>${rail(child==='scan' ? [['Headline first','Name the job before showing the room.'],['Separate the roles','Scan is context. Measurement is controlling.'],['Fit and taste both count','Shelf height is a preference, not a constraint.'],['Record, don’t correct','Slope and bow are drawn, not straightened.']] : [['Show the seam','Source, candidate, gap — never merged.'],['Basis on every value','Who said it, and where it came from.'],['Conflict stops the field','Two sources disagree, nobody wins.'],['Ask only the gap','A clean cut list gets one question.'],['I don’t know is valid','Never force fake precision to advance.']])}</section>`);
  const live = surface.querySelector('[data-rx-live]');
  for (const selector of ['.child-panel','.source-pane','.candidate-pane','.needs-pane']) {
    const node = screen.querySelector(`:scope > ${selector}`);
    if (node) live.append(node);
  }
}

function alcove(screen) {
  if (screen.dataset.rx === 'alcove') return;
  screen.dataset.rx = 'alcove';
  const surface = mount(screen, `<section class="rx-page"><div class="rx-main"><h1 class="screen-heading" id="screen-heading" tabindex="-1">Define your project to your space — and your taste</h1><p class="rx-sub">A scan gets the shape. You get the numbers.</p>${captureSvg()}
    <p><b>Start with a scan if you have one.</b> <span class="rx-dim">A scan gives context. It is not automatically a controlling measurement.</span></p><p><b>So you take the ones that matter.</b> <span class="rx-dim">Width, height and depth stay tied to how they were established. Slope and bow stay recorded instead of being silently straightened.</span></p>
    <h2>Make it yours</h2><p class="rx-dim">The current configurator below is the live candidate engine. Its present Store, revision and unresolved-state rules control; historical donor prices do not.</p><div class="rx-live" data-rx-live></div></div>${rail([['Headline first','Name the job before showing the room.'],['Separate the roles','Scan is context. Measurement is controlling.'],['Feel like a tool','Configuration stays visible and inspectable.'],['Say UNRESOLVED','Never invent what the current engine cannot answer.']])}</section>`);
  const live = surface.querySelector('[data-rx-live]');
  const config = screen.querySelector('[data-project-configurator="alcove-shelf-blanks"]');
  if (config) live.append(config);
  for (const selector of ['.source-pane','.candidate-pane','.needs-pane']) {
    const node = screen.querySelector(`:scope > ${selector}`);
    if (node) live.append(node);
  }
}

function picnicSvg(form, scope) {
  const frames = scope === 'frame-kit';
  const c = '#C9A227';
  let g = '<rect width="96" height="60" fill="#eef2e6"/><ellipse cx="48" cy="50" rx="41" ry="4" fill="#cfdcbb"/>';
  if (form === 'attached-bench') {
    if (frames) g += `<rect x="8" y="19" width="80" height="6" fill="none" stroke="${c}" stroke-dasharray="4 3"/><rect x="10" y="35" width="76" height="4" fill="none" stroke="${c}" stroke-dasharray="4 3"/>`;
    else g += '<rect x="8" y="19" width="80" height="6" fill="#E0BC55"/><rect x="10" y="35" width="76" height="4" fill="#D9B43C"/>';
    g += `<path d="M30 22 L20 50 L25 50 L34 22 Z" fill="${c}"/><path d="M34 22 L44 50 L39 50 L30 22 Z" fill="#B8931F"/><path d="M62 22 L52 50 L57 50 L66 22 Z" fill="${c}"/><path d="M66 22 L76 50 L71 50 L62 22 Z" fill="#B8931F"/>`;
  } else {
    if (frames) g += `<rect x="26" y="19" width="44" height="6" fill="none" stroke="${c}" stroke-dasharray="4 3"/><rect x="4" y="36" width="18" height="4" fill="none" stroke="${c}" stroke-dasharray="3 2"/><rect x="74" y="36" width="18" height="4" fill="none" stroke="${c}" stroke-dasharray="3 2"/>`;
    else g += '<rect x="26" y="19" width="44" height="6" fill="#E0BC55"/><rect x="4" y="36" width="18" height="4" fill="#D9B43C"/><rect x="74" y="36" width="18" height="4" fill="#D9B43C"/>';
    g += '<rect x="31" y="25" width="3.5" height="25" fill="#B8931F"/><rect x="61" y="25" width="3.5" height="25" fill="#B8931F"/>';
  }
  return `<svg viewBox="0 0 96 60" aria-hidden="true">${g}</svg>`;
}

function picnicChooser(screen) {
  if (screen.dataset.rx === 'picnic-chooser') return;
  screen.dataset.rx = 'picnic-chooser';
  mount(screen, `<section class="rx-page"><div class="rx-split"><div class="rx-ribbon"><button type="button" class="rx-tile" data-picnic-form="attached-bench" data-picnic-scope="complete-part-set">${picnicSvg('attached-bench','complete-part-set')}<span class="t1">Attached bench</span><span class="t2">The classic one</span></button><button type="button" class="rx-tile" data-picnic-form="attached-bench" data-picnic-scope="frame-kit">${picnicSvg('attached-bench','frame-kit')}<span class="t1">Attached · frames</span><span class="t2">You bring boards</span></button><button type="button" class="rx-tile" data-picnic-form="separate-benches" data-picnic-scope="complete-part-set">${picnicSvg('separate-benches','complete-part-set')}<span class="t1">Separate benches</span><span class="t2">Three pieces</span></button><button type="button" class="rx-tile" data-picnic-form="separate-benches" data-picnic-scope="frame-kit">${picnicSvg('separate-benches','frame-kit')}<span class="t1">Separate · frames</span><span class="t2">You bring boards</span></button></div><div class="rx-ribbonbody"><p style="font-size:12px;color:var(--text-3)"><button type="button" data-front-door-back style="padding:0;border:0;background:transparent;color:var(--accent)">Begin</button> › Picnic tables</p><h1 class="screen-heading" id="screen-heading" tabindex="-1">Picnic tables</h1><p class="rx-sub">Off the shelf, three choices. You have a tape measure.</p>
    <p><b>Attached bench.</b> <span class="rx-dim">The one everybody pictures. Seats hang off the same A-frames as the top, so it’s one object — sit down and the whole thing stays put. Nothing to line up on assembly.</span></p>
    <p><b>Separate benches.</b> <span class="rx-dim">A table and two benches. Each stands on its own, so you can pull a bench out, put one against a wall, or seat someone in a wheelchair at the end.</span></p>
    <p><b>Frames only.</b> <span class="rx-dim">Either shape, minus the long boards. We make the hard frame geometry; the long straight members stay explicitly on your supply list.</span></p>
    <div class="rx-keep"><p style="font-weight:600">Why anyone picks frames only</p><p class="rx-dim">It is not merely a discount. It is a way to keep the hard geometry local while long straight stock remains holder-supplied when local rack, material, or fulfillment limits require it.</p></div>
    <p class="rx-dim" style="font-size:12.5px">Form is one choice. Fulfillment scope is another. Structure, Store support, price, machine support and production authority remain separate facts.</p>
    </div></div>${rail([['Four doors, two classes','Form is a class. Scope is a flag.'],['Name the tradeoff','Separate benches are a different form.'],['Frames-only has a reason','Not a discount. A way past the local rack.'],['Structure is never a choice','Unsupported structural claims remain unresolved.']])}</section>`);
}

function picnicConfig(screen) {
  if (screen.dataset.rx === 'picnic-config') return;
  screen.dataset.rx = 'picnic-config';
  const surface = mount(screen, `<section class="rx-page"><div class="rx-main"><h1 class="screen-heading" id="screen-heading" tabindex="-1">Picnic table</h1><p class="rx-sub">The form and fulfillment scope you chose are part of this candidate version.</p><div class="rx-banner"><b>Current system rules control.</b> The historical donor’s placeholder 2×6 SKUs, prices, 60 in structural trigger, and cell-recovery arithmetic are not imported as present authority.</div><div class="rx-live" data-rx-live></div><details><summary>What the words mean</summary><p><b>A-frame.</b> The splayed leg assembly that holds the table up.</p><p><b>Frames only.</b> The hard frame parts are on the local make side; long straight members remain on your supply side and stay in the project record.</p><p><b>Cut list.</b> Part names, lengths and counts. It remains part of the project definition even when some members are holder-supplied.</p><p><b>Budgetary estimate.</b> A planning number is not a quote, reservation or production release.</p></details></div>${rail([['One number drives it','Length changes the candidate geometry.'],['Structure is not a choice','The system must resolve or refuse; the holder is not asked to engineer it.'],['Show the rule firing','Derived parts stay inspectable.'],['Confirm ≠ contract','Definition and commercial authority stay separate.']])}</section>`);
  const live = surface.querySelector('[data-rx-live]');
  const config = screen.querySelector('[data-project-configurator="classic-picnic-table-fixture"]');
  if (config) live.append(config);
  for (const selector of ['.source-pane','.candidate-pane','.needs-pane']) {
    const node = screen.querySelector(`:scope > ${selector}`);
    if (node) live.append(node);
  }
}

function windowSeat(screen) {
  const s = WINDOW_STEPS[windowStep];
  screen.dataset.rx = `window-${windowStep}`;
  mount(screen, `<section class="rx-page"><div class="rx-main"><p style="font-size:12px;color:var(--text-3)"><button type="button" data-rx-window-close style="padding:0;border:0;background:transparent;color:var(--accent)">Begin</button> › Space utilization</p><h1 class="screen-heading" id="screen-heading" tabindex="-1">Window Seat Insert — 103″ Wall Fixture</h1><p class="rx-sub">Project 2 · Class B · reference walkthrough. This is preserved product work, not a current executable Store-to-production class.</p><div class="rx-window-steps">${WINDOW_STEPS.map((step,i)=>`<button type="button" data-rx-window-step="${i}" class="${i===windowStep?'on':''}">${step.tag.split(' · ')[1]}</button>`).join('')}</div><p style="font-size:11px;font-weight:600;letter-spacing:.08em;color:var(--accent)">${s.tag}</p><h2 style="margin-top:0">${s.title}</h2>${windowSvg()}<p>${s.narrative}</p><h3>What this step resolves</h3><ul class="rx-resolves">${s.resolves.map(x=>`<li>${x}</li>`).join('')}</ul><div class="rx-btns"><button type="button" data-rx-window-prev ${windowStep===0?'disabled':''}>← Back</button><button type="button" data-rx-window-next>${windowStep===WINDOW_STEPS.length-1?'Restart ↺':'Next →'}</button></div><p class="rx-reference">Preserved reference journey. Current app authority is not promoted by this walkthrough: structural adequacy, Store support, production release, machine readiness and physical execution require their own current evidence.</p></div>${rail([['Keep the object human','The user asked for a place to sit and store things, not a BOM.'],['Let gates stop it','A stop is a valid result when evidence is missing.'],['Keep two streams visible','Dimensional and sheet work remain distinct.'],['Preserve the boundary','A reference walkthrough is not physical capability.']])}</section>`);
}

const NEXT_STAGES = [
  ['YOU','Your space, measurements, choices, and which values are controlling.','Nothing. You start the record.','Confirm a version. Change it. Walk away.','Nothing downstream may rewrite what you want.'],
  ['STORE','Material identity, quantity, current offering, supportability and price basis.','Your confirmed version, unchanged.','Resolve items and quantity; support, refuse or leave unresolved.','Redraw, substitute, round or change the project.'],
  ['COMMERCIAL','Offer, acceptance and payment condition.','The Store answer for one identified version.','Make an offer; record acceptance; let it lapse.','Accept for you or collapse acceptance into payment.'],
  ['PRODUCTION RELEASE','Permission for eligible work to enter production.','An accepted version with required conditions met.','Release or hold and name the blocker.','Create machine readiness or release on assumption.'],
  ['LOCAL CELL','Machine-local translation, setup, tooling, readiness and Cycle Start.','Bounded machine-neutral work.','Translate inside declared limits or refuse.','Alter the definition or treat Store support as Cycle Start.'],
  ['QUALITY','Comparison of made part to confirmed requirement.','Made parts plus exact requirement.','Accept, reject or record an exception.','Change the requirement to match output.'],
  ['FULFILLMENT','Labels, staging, ready notice and custody handoff.','Accepted parts with identities.','Label, stage, notify and hand over.','Treat incomplete as complete or staged as picked up.'],
  ['OWNER RECORD','The chronology from asked through received.','Every stage, as it actually occurs.','Show history, export and travel with the holder.','Invent a missing event or silently rewrite one.'],
];

function nextContent() {
  return `<h2>What happens next</h2><p class="rx-sub">Seven steps, then who is responsible for each one. Nobody skips a step, and nobody redraws your project along the way.</p><p><b>1 · You confirm.</b> <span class="rx-dim">The exact dimensions, material and choices freeze as one identified version.</span></p><p><b>2 · The store answers.</b> <span class="rx-dim">It resolves the material and supportability it can actually answer. It does not silently change your project.</span></p><p><b>3 · You decide.</b> <span class="rx-dim">Take the answer, change the project, or stop.</span></p><p><b>4 · The job is released.</b> <span class="rx-dim">Only after required commercial and production conditions are met.</span></p><p><b>5 · The local cell does its part.</b> <span class="rx-dim">Machine-local readiness and Cycle Start remain local responsibilities.</span></p><p><b>6 · Inspect, label, stage.</b> <span class="rx-dim">Made parts are checked against the requirement and kept with their identities.</span></p><p><b>7 · You receive.</b> <span class="rx-dim">The parts and the record that belongs with them.</span></p><div class="rx-chain">${NEXT_STAGES.map((x,i)=>`${i?'<span>→</span>':''}<b>${x[0]}</b>`).join('')}</div>${NEXT_STAGES.map(([name,owns,receives,may,maynot])=>`<div class="rx-stage"><h4>${name}</h4><div class="rx-stage-grid"><div class="rx-cell"><b>OWNS</b>${owns}</div><div class="rx-cell"><b>RECEIVES</b>${receives}</div><div class="rx-cell"><b>MAY DO</b>${may}</div><div class="rx-cell"><b>MAY NOT DO</b>${maynot}</div></div></div>`).join('')}<h2>Nine things that are not the same</h2><div class="rx-keep"><p>≠ <b>Confirmation</b> is not <b>an order</b>.</p><p>≠ <b>An order</b> is not <b>payment</b>.</p><p>≠ <b>Payment</b> is not <b>material allocation</b>.</p><p>≠ <b>Material allocation</b> is not <b>production release</b>.</p><p>≠ <b>Production release</b> is not <b>machine readiness</b>.</p><p>≠ <b>Store support</b> is not <b>Cycle Start</b>.</p><p>≠ <b>Machine completion</b> is not <b>inspection</b>.</p><p>≠ <b>Inspection</b> is not <b>staging</b>.</p><p>≠ <b>Staging</b> is not <b>pickup</b>.</p></div>`;
}

function review(screen) {
  if (screen.dataset.rx === 'review') return;
  screen.dataset.rx = 'review';
  const surface = mount(screen, `<section class="rx-page"><div class="rx-main"><h1 class="screen-heading" id="screen-heading" tabindex="-1">Review this version</h1><p class="rx-sub">This is exactly what gets frozen. Read it before you confirm it.</p><div class="rx-banner"><b>What confirm means.</b> Confirm freezes this exact definition as one identified version. Change anything afterward and that makes a new version. It does not by itself mean ordered, paid, material reserved, production released, machine authorized, or cut.</div><div class="rx-live" data-rx-live></div></div>${rail([['Show the exact version','Not a summary. The thing being frozen.'],['Mark what controls','Controlling, derived, unresolved.'],['Confirm ≠ contract','Commercial and production steps remain separate.'],['Leave a way back','Keep editing is always offered.']])}</section>`);
  const live = surface.querySelector('[data-rx-live]');
  for (const node of [...screen.children]) if (node !== surface) live.append(node);
}

function result(screen) {
  if (screen.dataset.rx === 'result') return;
  screen.dataset.rx = 'result';
  const surface = mount(screen, `<section class="rx-page"><div class="rx-main"><h1 class="screen-heading" id="screen-heading" tabindex="-1">What happens next</h1><div class="rx-live" data-rx-live></div>${nextContent()}</div>${rail([['One page, six readers','Customer, contractor, yard, builder, engineer, researcher.'],['Owner per stage','Owns, receives, may, may not.'],['Keep the steps apart','Collapsed states create false authority.'],['One definition throughout','Nobody silently redraws the confirmed geometry.']])}</section>`);
  const live = surface.querySelector('[data-rx-live]');
  for (const node of [...screen.children]) if (node !== surface) live.append(node);
}

function resume(screen) {
  if (screen.dataset.rx === 'resume') return;
  screen.dataset.rx = 'resume';
  const saved = screen.querySelector('.saved-projects');
  const surface = mount(screen, `<section class="rx-page"><div class="rx-main"><h1 class="screen-heading" id="screen-heading" tabindex="-1">Open a project</h1><p class="rx-sub">Everything saved is still saved. External Store and capability facts may need a fresh answer.</p><div data-rx-saved></div><div class="rx-btns"><button type="button" data-rx-new>START SOMETHING NEW</button></div></div>${rail([['Don’t start over','Everything saved is still saved.'],['Trust what’s saved','Nothing edited in the background.'],['Second one is easy','Same project, new numbers.'],['Parts stay orderable','Replace one, not all.']])}</section>`);
  const host = surface.querySelector('[data-rx-saved]');
  if (saved) host.append(saved);
}

function render() {
  if (!root) return;
  const landingScreen = root.querySelector('main[data-screen="landing"]');
  if (landingScreen) return landing(landingScreen);
  const orientationScreen = root.querySelector('main[data-screen="orientation"]');
  if (orientationScreen) return orientation(orientationScreen);
  const begin = root.querySelector('main[data-screen="begin"]');
  if (begin) {
    const intent = sessionStorage.getItem('stb-rx-intent');
    if (begin.closest('[data-actor]')?.dataset.actor === 'returning' && intent === 'resume') return resume(begin);
    return page1(begin);
  }
  const questions = root.querySelector('main[data-screen="questions"]');
  if (questions) {
    if (questions.dataset.classId === 'classic-picnic-table-fixture') return picnicConfig(questions);
    if (questions.dataset.classId === 'alcove-shelf-blanks') return alcove(questions);
    return liveChild(questions);
  }
  const hub = root.querySelector('main[data-screen="hub"]');
  if (hub) return liveChild(hub);
  const confirm = root.querySelector('main[data-screen="confirm"]');
  if (confirm) return review(confirm);
  const resultScreen = root.querySelector('main[data-screen="result"]');
  if (resultScreen) return result(resultScreen);
}

function schedule() {
  if (queued) return;
  queued = true;
  queueMicrotask(() => { queued = false; render(); });
}

if (root) {
  installStyle();
  root.addEventListener('click', (event) => {
    const intent = event.target.closest('[data-rx-intent]')?.dataset.rxIntent;
    if (intent) sessionStorage.setItem('stb-rx-intent', intent);

    const childButton = event.target.closest('[data-rx-child]');
    if (childButton) {
      event.preventDefault();
      event.stopPropagation();
      const child = childButton.dataset.rxChild;
      const underlying = root.querySelector(`[data-action="open-child"][data-child="${child}"]`);
      underlying?.click();
      return;
    }

    if (event.target.closest('[data-rx-back-begin]')) {
      event.preventDefault();
      event.stopPropagation();
      window.history.pushState({}, '', '/begin');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }

    if (event.target.closest('[data-rx-new]')) {
      sessionStorage.setItem('stb-rx-intent', 'projects');
      const begin = root.querySelector('main[data-screen="begin"]');
      if (begin) { begin.dataset.rx = ''; page1(begin); }
      return;
    }

    const windowDoor = event.target.closest('[data-front-door="window-seat"]');
    if (windowDoor) {
      event.preventDefault();
      event.stopImmediatePropagation();
      sessionStorage.setItem(VIEW_KEY, 'window-seat');
      windowStep = 0;
      const begin = root.querySelector('main[data-screen="begin"]');
      if (begin) { begin.dataset.rx = ''; windowSeat(begin); }
      return;
    }

    const windowClose = event.target.closest('[data-rx-window-close]');
    if (windowClose) {
      sessionStorage.removeItem(VIEW_KEY);
      const begin = root.querySelector('main[data-screen="begin"]');
      if (begin) { begin.dataset.rx = ''; page1(begin); }
      return;
    }
    const jump = event.target.closest('[data-rx-window-step]');
    if (jump) {
      windowStep = Number(jump.dataset.rxWindowStep) || 0;
      const begin = root.querySelector('main[data-screen="begin"]');
      if (begin) windowSeat(begin);
      return;
    }
    if (event.target.closest('[data-rx-window-prev]')) {
      windowStep = Math.max(0, windowStep - 1);
      const begin = root.querySelector('main[data-screen="begin"]');
      if (begin) windowSeat(begin);
      return;
    }
    if (event.target.closest('[data-rx-window-next]')) {
      windowStep = windowStep === WINDOW_STEPS.length - 1 ? 0 : windowStep + 1;
      const begin = root.querySelector('main[data-screen="begin"]');
      if (begin) windowSeat(begin);
      return;
    }

    if (event.target.closest('[data-rx-notes]')) {
      event.preventDefault();
      alert('Build notes are collaborator guidance. They do not change project state.');
    }
  }, true);

  const observer = new MutationObserver(schedule);
  observer.observe(root, { childList: true, subtree: true });
  window.addEventListener('popstate', schedule);
  schedule();
}
