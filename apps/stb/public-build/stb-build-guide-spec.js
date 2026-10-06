(function(g){
  'use strict';

  const VERSION='STB-DEV-GUIDE-0.2';
  const guide=(goal,rows,later=[])=>Object.freeze({goal,rows:Object.freeze(rows.map(row=>Object.freeze(row))),later:Object.freeze(later.map(row=>Object.freeze(row)))});



  // Dev/Rev rails: a bold header, then plain lines. Fences for developers, not a contract.
  // Keep a line only if it blocks a specific bad move. Shared vocabulary comes from System docs/definitions.
  const FLAG='Intent makes the knobs. The bench only turns them.';
  const STORE_FLAG=FLAG+' Store answers Store questions.';
  const STORE_OWNS='Store owns capability, time, economics, and retained-control truth.';
  const STORE_ZERO='Store Zero is a declared reference lumberyard. Not inventory. Not a quote.';
  const WHOLE_RESULT='The Store budgetary answer is the whole Store result.';
  const NO_COMPLETE='Missing required component → no complete budgetary estimate.';
  const README_URL='https://github.com/GeorgePlattDemo/scan-to-build-store/blob/main/README.md';
  const TRAVEL_URL='https://github.com/GeorgePlattDemo/scan-to-build-store/blob/9c62d9d6f7775deef83d47196d32c9b5174a352c/DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md';
  const D001_URL='https://github.com/GeorgePlattDemo/scan-to-build-store/blob/9c62d9d6f7775deef83d47196d32c9b5174a352c/D-001-STAGE2-ENVELOPE-0.1.md';
  const S001_URL='https://github.com/GeorgePlattDemo/scan-to-build-store/blob/9c62d9d6f7775deef83d47196d32c9b5174a352c/S-001-STAGE2-ENVELOPE-0.1.md';
  const REVIEW_URL='https://github.com/GeorgePlattDemo/scan-to-build-store/blob/main/docs/project-1-digital-trail/D001_Project1_Review.md';
  const sec=(title,items,quiet)=>quiet?{title,items,quiet:true}:{title,items};
  const rail=(header,flag,bullets,sections=[])=>({header,flag,bullets,sections});
  const PLUMB_FRAME=sec('Plumbing',['postMessage is a contract: origin, schema, correlation.','Known wart: two DOMs.'],true);
  const SIMULATED_YARD=['The cut plan is the Store’s, board by board.','Simulated.','Allocation ≠ release ≠ Cycle Start.','Cycle Start belongs to the person at the cell.'];
  const YOUR_CALL=who=>['Only a fresh SUPPORTABLE answer can be accepted.','ACCEPT moves no money. Starts no machine.','DECLINE is a result too.','One shared terms flow. No '+who+' commerce of its own.'];

  const JOB1={
    'job1-intake':rail('DEV/REV GUIDE — JOB 1 · IDEA','Intake. Not a step.',[
      'Lands here. Ends at Intent.',
      'No step bar. No number.',
      'Known values go to Intent. Nobody types them twice.'
    ]),
    'job1-idea':rail('DEV/REV GUIDE — JOB 1 · PAGE 1 · INTENT',FLAG,[
      'KEEP USERS OUT OF CONFIGURATOR HELL.',
      'One board. One job. Numbers are theirs.',
      'Knobs for this job are made here. Never added on the bench.',
      'Wood is stated here: SPF, or what the Store lookup sets. Never on the bench, unless a change-species tool is added to that job.',
      'No Store call from this page.',
      'Never write “configurator” in customer copy.',
      'ADD opens the full list. Display only: under construction is never priced, sent or saved.',
      'Next: the bench.'
    ],[
      sec('Authority',['User owns the want. System keeps the definition.',STORE_OWNS,'None rewrites another.']),
      sec('Plumbing',['Parent routes. Child owns the definition.'],true)
    ]),
    'job1-bench':rail('DEV/REV GUIDE — JOB 1 · PAGE 2 · THE BENCH',FLAG,[
      'Knobs are used here. Never added here. Missing knob → back to Intent.',
      'Always “the bench.” Do not rename it configurator.',
      'Every change is a new version.',
      'No Store shadow logic: no price, time or fit computed here. Ask the Store.',
      'The Store says why the board changed. Never hide that line.',
      'Say “hardly worth,” never “not worth.”',
      'Keep visible: within limits, tight, stub, derived geometry.'
    ],[
      sec('Authority',[STORE_OWNS]),
      sec('Plumbing',['Iframe keeps its width.','postMessage is a contract: origin, schema, correlation.','Known wart: two DOMs.'],true)
    ]),
    'job1-store':rail('DEV/REV GUIDE — JOB 1 · PAGE 3 · STORE ANSWER',STORE_FLAG,[
      'One answer. One version. Read-only: no side effects.',
      'Store Zero is a declared reference lumberyard. Not inventory. Not a quote.',
      'Four answers: SUPPORTABLE / UNRESOLVED / REFUSED / UNAVAILABLE. Every no carries its reasons.',
      'A no stays a no.',
      'No Store shadow logic. No price, time or fit computed here.',
      'No silent substitution. Shortage ≠ preference.',
      'Missing required fact → no complete budgetary estimate.',
      'The Store never touches geometry, dimensions, feature locations, material choice or version.',
      'Sent ≠ received ≠ answered ≠ accepted. A sent hash is not a receipt.',
      'ACCEPT moves no money. Starts no machine.',
      'CHANGE DEFINITION forks a new version. Never edits this one.',
      'Cycle Start belongs to the person at the cell.'
    ],[
      sec('Read more — two links',[
        'Store README — what this Store owns, offers, and answers: '+README_URL,
        'Project 1 digital trail — browser-readable text of the accepted 22-page engineering review, following one definition end to end: '+REVIEW_URL
      ])
    ])
  };

  const JOB2={
    'alcove-idea':rail('DEV/REV GUIDE — JOB 2 · ALCOVE · PAGE 1 · INTENT',FLAG,[
      'No universal configurator. Each job assembles its own knobs.',
      'Picture is context. Scan is context. Neither is a measurement.',
      'Controlling facts own the cut.',
      'Bow stays bow. Slope stays slope. Plumb stays plumb.',
      'Never auto-correct a room nobody else stood in.',
      'A choice can add required facts. No hidden defaults.',
      'Doors yes → door facts required. Doors no → no door knobs.',
      'S/O routes the work outside. Not approval, not stock, not a quote, not permission to substitute.',
      'Intent-complete ≠ Store-supportable.',
      'An open fact is fine. A hidden missing fact never is.',
      'The knob list is made here. The bench does not enlarge it.',
      'New required fact → back to Intent. Never invent a new knob on the bench.'
    ],[
      sec('Gap',['Door knobs, S/O routing and the knob manifest are rules here. Not built yet.'])
    ]),
    'alcove-bench':rail('DEV/REV GUIDE — JOB 2 · ALCOVE · PAGE 2 · THE BENCH',FLAG,[
      'Knobs are turned here. Never added. Missing knob → back to Intent.',
      'This page is the bench. Do not rename it configurator.',
      'If it changes a cut, feature, operation or material: show it.',
      'Spots stay tied to their shelf. The Store may price or refuse a spot. Never move it.',
      'The bench never invents intent, dimensions, material, shelf positions, doors, SKU, price, time or capability.',
      'Controlling change → new version → fresh Store ask.',
      'Never attach an old answer to changed work.',
      'Missing rule → stop. Missing Store fact → ask the Store.',
      'UNRESOLVED / REFUSED / UNAVAILABLE: the boundary working. Not a failure.'
    ],[
      sec('Gap',['No formal knob manifest yet. Don’t fake one.']),
      sec('Plumbing',['postMessage is a contract.','Known wart: two DOMs.'],true)
    ]),
    'alcove-store':rail('DEV/REV GUIDE — JOB 2 · ALCOVE · PAGE 3 · STORE ANSWER',STORE_FLAG,[
      'One answer. One version. One Store. Read-only: no side effects.',
      STORE_ZERO,
      'Four answers. Every no carries its reasons.',
      'The Store may choose compliant stock, length, SKU and service.',
      'The Store may not change site dimensions, shelf count or positions, the material asked for, feature locations, doors, S/O or version.',
      'No silent substitution. Easier geometry ≠ same geometry.',
      'No Store shadow logic in System. No answer → keep the gap.',
      NO_COMPLETE,
      'Pins and reasons travel with the answer.',
      'Only a fresh SUPPORTABLE answer feeds the simulated offer.',
      'ACCEPT moves no money. Starts no machine.',
      'CHANGE DEFINITION → new version, new chain. Never splice versions.',
      'Cycle Start belongs to the person at the cell.'
    ],[
      sec('THIRTEEN AUDIT EVENTS · SIX CUSTOMER STEPS',[
        'SENT — identified definition sent.',
        'ARRIVED — Store receipt.',
        'ANSWERED — Store budgetary answer or refusal.',
        'OFFERED — simulated commercial offer.',
        'YOUR CALL — accept or decline.',
        'PAID — simulated.',
        'QUEUED — sent to Store / yard queue.',
        'MATERIAL ALLOCATED.',
        'PRODUCTION RELEASED.',
        'CUT · MILL · DRILL · LABEL.',
        'STAGED.',
        'READY NOTICE.',
        'PICKED UP · CUSTODY.'
      ]),
      sec('Gap',['S/O is not carried through this Store path. Never simulate an answer for it.']),
      sec('Links',['Store Zero README: '+README_URL,'Travel standard: '+TRAVEL_URL,'D-001 envelope: '+D001_URL])
    ])
  };

  const JOB3={
    'ws-hero':rail('DEV/REV GUIDE — JOB 3 · WINDOW SEAT · PAGE 1 · WHAT SHE WANTS',FLAG,[
      'The picture is the want. Not the definition.',
      'Her words carry weight. They are not measurements.',
      'Nobody cuts to a picture.',
      'Two routes, one job: same state, same request, same answer.',
      'No step here. Intent starts on the next page.'
    ],[
      sec('Plumbing',['Guide text comes from the shared guide file. One guide, not two.','postMessage is a contract.'],true)
    ]),
    'ws-intent':rail('DEV/REV GUIDE — JOB 3 · WINDOW SEAT · PAGE 2 · YOUR INTENT',FLAG,[
      'No universal configurator. Make this job’s knobs here, then stop.',
      'Every knob is made here. Hand-added ones too.',
      'Missing knob → back here. Never invent one on the bench.',
      'Three kinds: from the sketch, by hand, derived. No rule, no derivation.',
      'An added knob starts empty. No hidden defaults. The Store waits.',
      'Only controlling numbers are cut to. Taste and what’s off cut nothing.',
      'Never auto-correct a room nobody else stood in.',
      'Seat strength: UNRESOLVED. Site assembly: DEFERRED. Never claimed.',
      'Labels / inspection / bundling / packing: kept, not sent. Show the exclusion. Never claim the work.'
    ],[
      sec('Gap',['No place yet to record a qualified person’s answer on the seat.','Wood list is on the page, not from the catalog. The Store still refuses what it doesn’t carry.'])
    ]),
    'ws-bench':rail('DEV/REV GUIDE — JOB 3 · WINDOW SEAT · PAGE 3 · THE BENCH',FLAG,[
      'The bench turns the knobs made at intent. It never adds one.',
      'This page is always the bench. Do not rename it configurator.',
      'Depth in ¼ in steps. Boards milled to width. No milling when a board lands exact.',
      'The mill limit is the Store’s. No shadow limit here. Too much → the Store refuses. Turn the knob, ask again.',
      'Spots on tower sides only.',
      'Screws travel as a requirement. The Store picks the item or refuses.',
      'Any change → new version → Store asked again.'
    ],[
      sec('Gap',['A no-change click re-asks the Store. Reproduce before fixing.']),
      PLUMB_FRAME
    ]),
    'ws-store':rail('DEV/REV GUIDE — JOB 3 · WINDOW SEAT · PAGE 4 · STORE ANSWER',STORE_FLAG,[
      'One fresh answer. This version. Read-only: no side effects.',
      STORE_ZERO,
      STORE_OWNS,
      'Four answers. Every no carries its reasons.',
      'A refusal is the result. Steps 4–6 stay inert.',
      'A failed ask fails closed. Nothing fills the gap.',
      'No SKU, price, stock, capability or mill limit in the page.',
      WHOLE_RESULT,
      NO_COMPLETE,
      'The Store Zero text is the shared file. Never a copy.'
    ],[
      sec('Links',['Store Zero README: '+README_URL,'Travel standard: '+TRAVEL_URL,'D-001 envelope: '+D001_URL])
    ]),
    'ws-request':rail('DEV/REV GUIDE — JOB 3 · WINDOW SEAT · PAGE 5 · YOUR CALL',FLAG,[
      ...YOUR_CALL('Window Seat'),
      'Never sell a finished seat. Parts, and what’s excluded.'
    ]),
    'ws-yard':rail('DEV/REV GUIDE — JOB 3 · WINDOW SEAT · PAGE 6 · WE CUT IT',FLAG,SIMULATED_YARD),
    'ws-record':rail('DEV/REV GUIDE — JOB 3 · WINDOW SEAT · PAGE 7 · PICK UP & BUILD',FLAG,[
      'Parts, their record, their boards. Not an engineered seat.',
      'Staged ≠ picked up. Custody closes the handoff.',
      'The record appends. Never rewritten.',
      'Site assembly stays DEFERRED.'
    ]),
    'ws-audit':rail('DEV/REV GUIDE — JOB 3 · WINDOW SEAT · AUDIT COPY',FLAG,[
      'Same job, read as an audit.',
      'Same state. Nothing recomputed.',
      'Outside the published site, it fails closed.',
      'Hash reproduced by hand once. Not proof.'
    ])
  };

  const JOB4={
    'od-plan':rail('DEV/REV GUIDE — JOB 4 · OUTDOOR BUILD · PAGE 1 · PICK A PLAN',FLAG,[
      'This app turns bounded plan requirements into Store-evaluable demand and modeled work.',
      'Picking a plan is the intent. Its knobs come from the plan.',
      'Photos are context. Nobody cuts to a photo.',
      'Plan source stays attached.',
      'Reading a plan is not CAM. Bounded CAM can then be generated from controlling requirements plus declared machine rules.',
      'The “From” price is a live Store answer. Never cached. No answer → the card says so.'
    ],[
      sec('Gap',['A-frame source not in the authority register.','Wood defaults and the benches plan’s hardware counts are our reading, not the plans’.']),
      PLUMB_FRAME
    ]),
    'od-bench':rail('DEV/REV GUIDE — JOB 4 · OUTDOOR BUILD · PAGE 2 · THE BENCH',STORE_FLAG,[
      'This page is always the bench. Do not rename it configurator.',
      'The bench turns the knobs made from the plan. It never adds one.',
      'The plan as published: size, wood, hardware. Quick road stays quick.',
      'Nothing added here: no holes, no extra cuts.',
      'Only the slats follow length. Every other part and angle stays.',
      '60–216 in, to the inch. The 25° legs never change.',
      'Every price is a live Store answer. None is cached.',
      'Change anything → the Store is asked again.',
      'Hardware travels as requirements. The Store picks the item and box count.',
      'Plans name no species, screw gauge or totals. Ours: #10. Label it ours.',
      'Size range is the plan’s, not a strength rule.'
    ],[
      sec('The Store',[STORE_ZERO,WHOLE_RESULT,NO_COMPLETE])
    ]),
    'od-edge':rail('DEV/REV GUIDE — JOB 4 · OUTDOOR BUILD · PAGE 3 · A BIGGER BENCH',STORE_FLAG,[
      'Say where the app stops.',
      'Knobs come from the plan, one per kind of board. Never added here.',
      'Three answers: can do / waiting on you / past the edge.',
      'Past the edge is a result, not an error. Show the reason and who could move the edge.',
      '“Back to the plan” drops the work. Same version asked again.',
      '“Send it with this work” opens only inside the edge.',
      'Hole locations are yours. Never the plan’s.',
      'No shadow copy of the Store’s angle limit.',
      'Information travels before atoms. Name what’s missing and who owns it.'
    ],[
      sec('The Store',[STORE_ZERO,WHOLE_RESULT,NO_COMPLETE]),
      sec('Gap',['One angle per set of boards, both ends, one plane.','Long point or short point: not defined. The Store answers the number it’s sent.','A spot is not a finished hole.']),
      sec('Links',['Store Zero README: '+README_URL,'D-001 envelope: '+D001_URL])
    ]),
    'od-call':rail('DEV/REV GUIDE — JOB 4 · OUTDOOR BUILD · PAGE 4 · YOUR CALL',FLAG,YOUR_CALL('Outdoor')),
    'od-yard':rail('DEV/REV GUIDE — JOB 4 · OUTDOOR BUILD · PAGE 5 · WE CUT IT',FLAG,SIMULATED_YARD),
    'od-record':rail('DEV/REV GUIDE — JOB 4 · OUTDOOR BUILD · PAGE 6 · PICK UP & BUILD',FLAG,[
      'Parts to get you closer. Not a finished table.',
      'Strength, engineering, hardware suitability: not evaluated.',
      'Staged ≠ picked up. The record appends.'
    ])
  };

  const JOB5={
    'ph-idea':rail('DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 1 · INTENT',FLAG,[
      'Sheet in. Parts out.',
      'Arched opening. Center kept for shutters. Every remnant returned.',
      'No machine side effects here.',
      'The features become this job’s knobs.',
      'Hinges and hardware: not in this order. Tab trimming: User 1.',
      'Interchangeable sheet heads: not proved.'
    ]),
    'ph-bench':rail('DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 2 · THE BENCH',FLAG,[
      'This page is always the bench. Do not rename it configurator.',
      'Three knobs: width, side height, arch rise. Reset: 36 / 24 / 12.',
      'The bench turns the knobs. It never adds one.',
      'Every turn is a new version. The Store is asked again.',
      'One sheet, 48 × 96 in, ½ in plywood. Four operations. Center on tabs. Remnants returned.',
      'The Store decides fit. Too wide or too tall → REFUSED, with its reason. The page never corrects it.'
    ],[
      sec('Plumbing',['Known wart: injected pages in the shell.'],true)
    ]),
    'ph-store':rail('DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 3 · STORE ANSWER',STORE_FLAG,[
      'One fresh answer to this version, sent as SHEET_PACKAGE_V1. Read-only: no side effects.',
      STORE_ZERO,
      WHOLE_RESULT,
      NO_COMPLETE,
      'The tab plan is a reference plan. Retention not measured.',
      'Machine time modeled. Stock declared.',
      'Another project’s or version’s answer is never shown.',
      'No answer → closed steps. Never a reference answer.',
      'The 36 / 24 / 12 hand check ($65.04) is history. Not current proof.'
    ],[
      sec('Links',['Store Zero README: '+README_URL,'S-001 envelope: '+S001_URL])
    ]),
    'ph-review':rail('DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 4 · REVIEW',FLAG,[
      'Freeze the whole ask, supported or not.',
      'Confirm keeps the definition. Not payment, release or execution.',
      'Confirm opens only after SUPPORTABLE for this version.'
    ]),
    'ph-call':rail('DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 5 · YOUR CALL',FLAG,[
      'Your call on this exact version.',
      'ACCEPT moves no money. Starts no machine.',
      'Request ≠ order.',
      'DECLINE is a result too.',
      'One shared terms flow. No Playhouse commerce of its own.'
    ]),
    'ph-yard':rail('DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 6 · WE CUT IT',FLAG,[
      'Only an accepted SUPPORTABLE answer reaches the yard.',
      'Simulated. No machine runs. No released program.',
      'Cycle Start belongs to the person at the cell.'
    ]),
    'ph-terms':rail('DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 7 · THE EVENTS',FLAG,[
      'Every event, in order, with its hash.',
      'Missing stays missing. Nothing filled in by assumption.',
      'New definition → new chain.',
      'Events live inside the six steps. No seventh step.'
    ]),
    'ph-recap':rail('DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 8 · RECAP',FLAG,[
      'Forward: chronology. Backward: audit.',
      'Proved: a sheet definition the Store can answer.',
      'Physical status: not claimed.'
    ]),
    'ph-record':rail('DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 9 · PICK UP & BUILD',FLAG,[
      'Only what this journey established.',
      'The record appends.',
      'Center and every remnant are required outputs.',
      'Custody simulated. Hardware not included.'
    ])
  };
  const asRail=r=>Object.freeze(Object.assign({},r,{rows:Object.freeze(r.bullets.map(b=>Object.freeze([b,'']))),later:Object.freeze([])}));
  const RAILS=Object.freeze(Object.fromEntries([JOB1,JOB2,JOB3,JOB4,JOB5].flatMap(job=>Object.entries(job)).map(([k,r])=>[k,asRail(r)])));

  // Guide pages: one optional first line, then plain lines. A line with a second part reads "first — second".
  const lines=(goal,items,later=[])=>guide(goal,items.map(t=>Array.isArray(t)?t:[t,'']),later.map(t=>Array.isArray(t)?t:[t,'']));
  const PAGES=Object.freeze({
    landing:lines('',['Say what this is','Show who does what','Make the seam visible','Offer three ways in']),
    'new-user':lines('',['Orient once','Don’t trap people','Play without an account'],['THIS DEVICE','EMAIL / SIGN IN']),
    'my-projects':lines('Resume the identified job.',[
      'Show the saved version and its last real event. No “done” badge.',
      'Old Store answers are history. Refresh.',
      'Changes fork. The source record stays.',
      'Device storage ≠ account.'
    ]),
    archive:lines('Read the handoff record.',[
      'Real events. Simulated ones marked. Missing ones shown.',
      'Parts and included work. No kit promises.',
      'Reopening grants nothing.',
      'Custody ≠ site fit.'
    ]),
    returning:lines('Resume cleanly',[
      ['Don’t start over','Saved project stays saved.'],
      ['Refresh outside facts','Old Store answers are history.'],
      ['Fork changes','New work gets a new version.'],
      ['Still demo-only','Named users are not real auth.']
    ],[
      ['MY PROJECTS ON THIS DEVICE','Device-held history. Resume or fork an identified version.'],
      ['OPEN A SAVED PROJECT FILE','Imported history. Check the digest; never promote an old answer to current.']
    ]),
    saved:lines('Find the right record.',[
      'Show the version.',
      'Last real event, not “done.”',
      'Demo records ≠ accounts.'
    ]),
    professional:lines('Bring work in',[
      ['Import, don’t bless','A plan is evidence, not truth.'],
      ['Keep provenance','Know what came from where.'],
      ['Same gates','Professional brings defined work; the dealer does not redraw it. Store and machine limits still apply.']
    ],[
      ['BRING A DRAWING, PDF OR PHOTO','Configured later with contractor adapters.'],
      ['PASTE A CUT LIST','Configured later with contractor adapters.']
    ]),
    projects:lines('Library.',[
      'Don’t overcrowd. Say live, bounded or deferred.',
      'Start your own: first. Never moves.',
      'One project at a time. Switch tile, clean state.',
      'No cross-talk. Job facts stay home.',
      'Same six steps, every tile. The scoreboard enforces it.',
      'Opening ≠ owning.',
      'No “complete product.” No configurator.',
      'Gap: read-only copy is Playhouse only.',
      'Gap: accounts are demo.',
      'Gap: legacy routes intercepted, not retired.'
    ]),
    'start-own':lines('Legacy donor.',[
      'Don’t build here.',
      'Tests still touch it.',
      'Delete only after a dependency audit.'
    ]),
    intake:lines('Take the file, not the bait.',[
      'Received ≠ understood.',
      'Keep the original. Hash it.',
      'Don’t trust uploads: limits, scanning, sandboxing.',
      'The user corrects extraction. Extraction never becomes truth.'
    ]),
    'alcove-idea':lines('Intake. Not a step.',[
      'Scan and story land here. End at Intent.',
      'No step bar. No number.',
      'Known values go to Intent. Nobody types them twice.'
    ]),
    'alcove-capture':RAILS['alcove-idea'],
    'alcove-config':RAILS['alcove-bench'],
    'alcove-review':lines('Freeze the exact version.',[
      'Confirm ≠ order.',
      'Edit forks. Never rewrite the confirmed version.'
    ]),
    store:RAILS['alcove-store'],
    request:lines('Scope the services.',[
      'Don’t redesign here.',
      'Yes / no / unavailable: keep all three.',
      'Name what’s included and excluded. No silent add-ons.'
    ]),
    yard:lines('Facts, not surprises.',[
      'No silent substitution. Changes come back as changes.',
      'Shortage ≠ preference.',
      'Every answer binds to its request.',
      'Still modeled.'
    ]),
    terms:lines('Keep the verbs apart.',[
      'Offer ≠ accept ≠ pay ≠ allocate.',
      'Read-only: viewing creates nothing.',
      'Commerce never creates Cycle Start.'
    ]),
    recap:lines('Summarize. Don’t backfill.',[
      'Creates no state.',
      'Missing stays missing.'
    ]),
    record:lines('Close with evidence.',[
      'Corrections append. History stays.',
      'Parts and included work. No implied finished product.',
      'Browser-held ≠ durable custody.'
    ]),
    'start-own-live':RAILS['job1-bench'],
    'outdoor-idea':lines('Intake. Not a step.',[
      'Two published plans land here. End at Intent.',
      'No step bar. No number.',
      'Known values go to Intent. Nobody types them twice.'
    ]),
    'outdoor-plan':RAILS['od-plan'],
    'outdoor-bench':RAILS['od-bench'],
    'outdoor-edge':RAILS['od-edge'],
    'outdoor-call':RAILS['od-call'],
    'outdoor-yard':RAILS['od-yard'],
    'outdoor-record':RAILS['od-record'],
    'outdoor-build-live':lines('Keep Outdoor its own job.',[
      'Never borrow Job 1 facts.',
      'Plan source stays attached.',
      'Missing Store coverage stays missing.',
      'Known wart: iframe.'
    ]),
    'window-seat-hero':RAILS['ws-hero'],
    'window-seat-intent':RAILS['ws-intent'],
    'window-seat-bench':RAILS['ws-bench'],
    'window-seat-store':RAILS['ws-store'],
    'window-seat-request':RAILS['ws-request'],
    'window-seat-yard':RAILS['ws-yard'],
    'window-seat-record':RAILS['ws-record'],
    'window-seat-audit':RAILS['ws-audit'],
    'window-seat-live':lines('One job, two views.',[
      'Same state, same gates.',
      'The fork lives on the Idea line only.',
      'Known wart: iframe.'
    ]),
    'proof-store':RAILS['job1-store'],
    'proof-accept':lines('Two choices.',[
      'Accept or decline this exact scope. Simulated.',
      'Separate the receipts: offer, decision, payment.',
      'Idempotent: a double-click never duplicates an event.',
      'No real payments, refunds or tax.'
    ]),
    'proof-yard':lines('Show the whole middle.',[
      'One long scroll. No internal buttons.',
      'Read-only: scrolling creates nothing.',
      'READY ≠ custody.',
      'No magic controller: no released program, no commissioned cell.',
      'Durable queue, staff events, telemetry: full build later.'
    ]),
    'proof-terms':lines('Audit only.',[
      'Not a customer stop.',
      'Read only.',
      'Retire after deep links move.'
    ]),
    'proof-record':lines('Close after custody.',[
      'No extra close button.',
      'Rebuild from receipts.',
      'Browser-held ≠ durable custody.'
    ]),
    'playhouse-idea':lines('Intake. Not a step.',[
      'Picture and story land here. End at Intent.',
      'No step bar. No number.',
      'Known values go to Intent. Nobody types them twice.'
    ]),
    'playhouse-s001':RAILS['ph-idea'],
    'playhouse-machine':RAILS['ph-bench'],
    'playhouse-store':RAILS['ph-store'],
    'playhouse-review':RAILS['ph-review'],
    'playhouse-request':RAILS['ph-call'],
    'playhouse-yard':RAILS['ph-yard'],
    'playhouse-terms':RAILS['ph-terms'],
    'playhouse-result':RAILS['ph-recap'],
    'playhouse-record':RAILS['ph-record'],
    'alcove-store-order-surface':lines('Store seam.',[
      'Store facts only. Bind to the request.',
      'Known wart: injected panel.'
    ]),
    'alcove-store-service-choices':lines('Service scope.',[
      'Yes / no / unavailable differ.',
      'No hidden defaults.'
    ]),
    'alcove-store-yard-answer':lines('Yard answer.',[
      'Every change carries its reason.',
      'Same job, same version.'
    ]),
    'alcove-store-commercial-sequence':lines('Keep events separate.',[
      'Read-only: viewing changes nothing.',
      'Commerce ≠ machine authority.'
    ]),
    'alcove-store-returned-offer':lines('Offer detail.',[
      'Old offers expire.',
      'Offer ≠ payment.'
    ])
  });

  function esc(value){
    return String(value ?? '').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function revItem(t){
    if(/^https:\/\/\S+$/.test(t)) return '<li><a href="'+esc(t)+'" target="_blank" rel="noopener">'+esc(t.replace(/^https:\/\/github\.com\/GeorgePlattDemo\//,''))+'</a></li>';
    const m=/^(.*?): (https:\/\/\S+)$/.exec(t);
    return '<li>'+(m?esc(m[1])+': <a href="'+esc(m[2])+'" target="_blank" rel="noopener">'+esc(m[2].replace(/^https:\/\/github\.com\/GeorgePlattDemo\//,''))+'</a>':esc(t))+'</li>';
  }
  function renderRail(r){
    return [
      '<p class="hd rev-hd">'+esc(r.header||'DEV/REV GUIDE')+'</p>',
      '<p class="rev-flag">'+esc(r.flag)+'</p>',
      ...(r.bullets.length ? ['<ul class="rev-list">'+r.bullets.map(revItem).join('')+'</ul>'] : []),
      ...r.sections.map(sec=>'<p class="rev-sec'+(sec.quiet?' quiet':'')+'">'+esc(sec.title)+'</p><ul class="rev-list'+(sec.quiet?' quiet':'')+'">'+sec.items.map(revItem).join('')+'</ul>')
    ].join('');
  }

  function render(pageId){
    const meta='<div class="guide-meta"><span>'+esc(pageId)+'</span><span>'+VERSION+'</span></div>';
    // Job 1 is one page with its Idea intake and two trail steps; all three rails ship and the page's stage picks one.
    if(pageId==='start-own-live'){
      return '<div class="rev-stage" data-rev-stage="idea">'+renderRail(RAILS['job1-intake'])+'</div>'
        +'<div class="rev-stage" data-rev-stage="intent">'+renderRail(RAILS['job1-idea'])+'</div>'
        +'<div class="rev-stage" data-rev-stage="bench">'+renderRail(RAILS['job1-bench'])+'</div>'+meta;
    }
    const p=PAGES[pageId] || guide('No guide for this page yet.',[
      ['Don’t fake one.',''],
      ['Developer notes stay in the rail.','']
    ]);
    if(p.flag) return renderRail(p)+meta;
    const line=row=>esc(row[1] ? row[0]+' — '+row[1] : row[0]);
    return [
      '<p class="hd rev-hd">DEV/REV GUIDE</p>',
      ...(p.goal ? ['<p class="rev-flag">'+esc(p.goal)+'</p>'] : []),
      '<ul class="rev-list">'+p.rows.map(row=>'<li>'+line(row)+'</li>').join('')+'</ul>',
      ...((p.later && p.later.length) ? ['<p class="rev-sec">Build later</p><ul class="rev-list later">'+p.later.map(row=>'<li data-coming-row="'+esc(row[0])+'">'+line(row)+'</li>').join('')+'</ul>'] : []),
      meta
    ].join('');
  }

  g.STBBuildGuideSpec=Object.freeze({
    version:VERSION,
    pages:PAGES,
    rails:RAILS,
    pageIds:Object.freeze(Object.keys(PAGES)),
    render
  });
})(window);
