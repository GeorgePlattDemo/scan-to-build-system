(function(g){
  'use strict';

  const VERSION='STB-DEV-GUIDE-0.2';
  const guide=(goal,rows,later=[])=>Object.freeze({goal,rows:Object.freeze(rows.map(row=>Object.freeze(row))),later:Object.freeze(later.map(row=>Object.freeze(row)))});

  const legacyWindow=guide('Legacy reference',[
    ['Don’t rebuild here','The live Window Seat owns the current path.'],
    ['Keep the donor','Useful copy and checks still depend on it.'],
    ['Retire carefully','Remove only after parity tests.']
  ]);
  const legacyPicnic=guide('Legacy reference',[
    ['Don’t route here','Outdoor uses the live bounded artifact.'],
    ['Keep the donor','Recovery still depends on some old anchors.'],
    ['Delete last','Retire after dependency checks.']
  ]);


  // Dev/Rev rails: a header, a flag line, then plain bullets and sections. Only the header is bold.
  // Job 1 rails: owner's text, verbatim (DEV/REV GUIDE ceiling).
  const JOB1={
    "job1-idea": {
      "header": "DEV/REV GUIDE — JOB 1 · PAGE 1 · YOUR IDEA",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "This page is the want. It does not become the bench.",
        "Knobs for this job are made here, auto or by hand, from the need.",
        "Condensed out of this tour. Alcove says where they come from.",
        "Never added on the bench.",
        "No universal configurator.",
        "A board job stays packed.",
        "One tile. One board. Numbers are theirs.",
        "Opening is not owning.",
        "Next is the bench."
      ],
      "sections": [
        {
          "title": "Authority",
          "items": [
            "Intent owns the want.",
            "Bench owns the board.",
            "Store owns capability, time, economics, and retained-control truth.",
            "None may rewrite the others."
          ]
        },
        {
          "title": "Plumbing",
          "items": [
            "Preserve the working artifact.",
            "Guide uses the rail. Iframe keeps its width.",
            "Parent routes. Child owns the bounded definition."
          ],
          "quiet": true
        }
      ]
    },
    "job1-bench": {
      "header": "DEV/REV GUIDE — JOB 1 · PAGE 2 · THE BENCH",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "This page is always the bench. Do not rename it configurator.",
        "Knobs are used here. Never added here. Never regrown here.",
        "This is where those knobs make the definition the Store prices.",
        "Picture is the want. Schematic is the same board.",
        "Higher is one toggle. Angle, hold, and stub move together.",
        "Store says why the stick changed. Do not hide that sentence.",
        "Not worth is a verdict. Hardly worth is the lean. Use hardly."
      ],
      "sections": [
        {
          "title": "Limits",
          "items": [
            "Within limits stays visible.",
            "Tight stays visible.",
            "Stub stays visible.",
            "Derived geometry stays visible."
          ]
        },
        {
          "title": "Authority",
          "items": [
            "Bench owns the board.",
            "Store owns capability, time, economics, and retained-control truth.",
            "Bench may not pre-compute price, time, envelope, or capability."
          ]
        },
        {
          "title": "Plumbing",
          "items": [
            "Preserve the working artifact.",
            "Don’t squeeze it. Guide uses the rail. Iframe keeps its width.",
            "Mind the seam. Parent routes. Child owns the bounded definition.",
            "postMessage is a contract. Origin, schema, correlation.",
            "Known wart. Two DOMs, focus and history seams, browser-held state."
          ],
          "quiet": true
        }
      ]
    },
    "job1-store": {
      "header": "DEV/REV GUIDE — JOB 1 · PAGE 3 · STORE ANSWER",
      "flag": "Intent makes the knobs. The bench only turns them. Store answers Store questions.",
      "bullets": [
        "This page is one answer to one confirmed version.",
        "Viewing it creates no event.",
        "Declared reference lumberyard. Not a dealer. Not live inventory. Not a quote.",
        "No payment, allocation, release, or Cycle Start authority.",
        "Same request, same pins, same number."
      ],
      "sections": [
        {
          "title": "Version chain",
          "items": [
            "Sent, receipt, result. Three hashes. Three events. Do not collapse them.",
            "A sent hash is not a receipt.",
            "A receipt is not a result.",
            "A result is not acceptance."
          ]
        },
        {
          "title": "May not touch",
          "items": [
            "Geometry. Controlling dimensions. Shelf locations. User material choice. Version identity."
          ]
        },
        {
          "title": "Must answer, or no complete answer",
          "items": [
            "Material identity and quantity.",
            "Capability. Required operations. Modeled time.",
            "Envelope pin. Economics pin.",
            "Unresolved stays visible. Disabled stays visible. A no stays a no.",
            "Missing required fact: no complete budgetary estimate.",
            "The travel standard calls that Q. Do not mint Q on the page."
          ]
        },
        {
          "title": "In hand",
          "items": [
            "Four answers, each with a reason: supportable, unresolved, refused, unavailable.",
            "Catalog clock. Same request, same clock, same number. A later clock is a different answer.",
            "Budgetary estimate if complete: material + machine service + declared extras.",
            "Not a quote. Not an offer. Not a reservation."
          ]
        },
        {
          "title": "Lanes",
          "items": [
            "Project defines what. Machine model defines how. Store resolves whether.",
            "If the Store must answer it, ask the Store.",
            "No local replica. No pre-computed price, time, or envelope.",
            "No silent substitution. A shortage is not a preference.",
            "Services may change price or handling. They do not rewrite geometry."
          ]
        },
        {
          "title": "Gates",
          "items": [
            "Request ≠ order ≠ payment ≠ allocation ≠ release ≠ Cycle Start.",
            "Staged ≠ picked up. Finished ≠ closed. Closed is custody.",
            "Twelve events stay separate. Missing events stay missing. Nothing is promoted by wording.",
            "ACCEPT creates the next event. It does not allocate, pay, or release.",
            "CHANGE DEFINITION mints a version. It does not edit this one."
          ]
        },
        {
          "title": "Machine",
          "items": [
            "Start position verified only when that event exists. Not setup.",
            "Cycle Start belongs to the person at the cell. No hash here can start a spindle."
          ]
        },
        {
          "title": "Not this page",
          "items": [
            "Live count. Validity clock. Payment. Allocation. Release. Readiness. Cycle Start. Inspection. Custody."
          ]
        },
        {
          "title": "Links",
          "items": [
            "Store Zero: https://github.com/GeorgePlattDemo/scan-to-build-store/blob/main/README.md",
            "Travel standard: https://github.com/GeorgePlattDemo/scan-to-build-store/blob/main/DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md",
            "D-001 envelope, file 0.1, version string D001-STAGE2-ENVELOPE-0.3: https://github.com/GeorgePlattDemo/scan-to-build-store/blob/main/D-001-STAGE2-ENVELOPE-0.1.md"
          ]
        }
      ]
    }
  };
  const asRail=r=>Object.freeze(Object.assign({},r,{rows:Object.freeze(r.bullets.map(b=>Object.freeze([b,'']))),later:Object.freeze([])}));
  const RAILS=Object.freeze({
    'job1-idea':asRail(JOB1['job1-idea']),
    'job1-bench':asRail(JOB1['job1-bench']),
    'job1-store':asRail(JOB1['job1-store'])
  });

  const PAGES=Object.freeze({
    landing:guide('Goal',[
      ['Say what this is','One screen, no scrolling to understand it.'],
      ['Show who does what','Four steps are yours, one is ours.'],
      ['Make the seam visible','The definition reaches the cut unchanged.'],
      ['Offer three ways in','Same road after. Different opening.']
    ]),
    'new-user':guide('Orient once',[
      ['Keep it short','One pass, then into the work.'],
      ['Don’t trap people','Back and skip still work.'],
      ['No hidden authority','Orientation changes no project fact.'],
      ['Play without an account','LATER opens everything. Saving or buying asks who you are.']
    ],[
      ['THIS DEVICE','Phase 2 · keep this project in this browser.'],
      ['EMAIL / SIGN IN','Later · same project file, kept on a server.']
    ]),
    returning:guide('Resume cleanly',[
      ['Don’t start over','Saved project stays saved.'],
      ['Refresh outside facts','Old Store answers are history.'],
      ['Fork changes','New work gets a new version.'],
      ['Still demo-only','Named users are not real auth.']
    ],[
      ['MY PROJECTS ON THIS DEVICE','Phase 3 · resume, make another, replace a part.'],
      ['OPEN A SAVED PROJECT FILE','Phase 3 · check the digest, mark it imported.']
    ]),
    saved:guide('Find the right record',[
      ['Show the version','Don’t flatten history into one card.'],
      ['Keep status useful','Last real event, not generic “done.”'],
      ['No fake account model','Demo records are not secure tenancy.']
    ]),
    professional:guide('Bring work in',[
      ['Import, don’t bless','A plan is evidence, not truth.'],
      ['Keep provenance','Know what came from where.'],
      ['Same gates','Professional does not bypass Store or machine limits.']
    ],[
      ['BRING A DRAWING, PDF OR PHOTO','Configured later with contractor adapters.'],
      ['PASTE A CUT LIST','Configured later with contractor adapters.']
    ]),
    projects:guide('Library',[
      ['Don’t overcrowd','Live, bounded or deferred. Say which.'],
      ['Tiles = tests','Board · plan · fit · assembly · sheet.'],
      ['Start your own','First. Never moves.'],
      ['One project at a time','Switch tile → clear route + state.'],
      ['No cross-talk','Job 1 facts stay in Job 1.'],
      ['Same six steps','Every tile, every door. Scoreboard enforces.'],
      ['Opening ≠ owning','Read-only copy until Make changes / Save.'],
      ['Gap','Read-only copy: Playhouse only. Rest open live.'],
      ['Gap','Accounts are demo. User 1 only. No auth.'],
      ['Still patched','Legacy routes intercepted, not retired.'],
      ['Build configurators as needed','One small bench per job class. No universal configurator.']
    ]),
    'start-own':guide('Legacy donor',[
      ['Don’t build here','The live Job 1 artifact owns this route.'],
      ['Keep for now','Recovery/tests still touch it.'],
      ['Delete last','Only after a dependency audit.']
    ]),
    intake:guide('Take the file, not the bait',[
      ['Show what parsed','Received ≠ understood.'],
      ['Keep the original','Hash it; keep parser provenance.'],
      ['Don’t trust uploads','Full build needs file limits, scanning, sandboxed parsing.'],
      ['Let users correct it','Extraction must never become truth by accident.']
    ]),
    'alcove-capture':guide('Separate context from cut facts',[
      ['Scan is context','Measurements control parts.'],
      ['Record the ugly','Slope and bow stay visible.'],
      ['Don’t auto-correct','Observed ≠ fixed.'],
      ['Full build','Add uncertainty, device/source metadata, accessibility.']
    ]),
    'alcove-config':guide('Change it once',[
      ['Recompute on change','Material, geometry, work and Store answer stay tied.'],
      ['Kill stale replies','Late Store answers cannot overwrite newer edits.'],
      ['Keep Store logic out','Browser does not pick SKU or price.'],
      ['Spots are bound','Each upright carries its own spots; the Store times, prices or refuses them.']
    ]),
    'alcove-review':guide('Freeze the exact version',[
      ['Show what changed','A real build needs a proper revision diff.'],
      ['Confirm ≠ order','No payment or production authority here.'],
      ['Fork after edit','Never rewrite the confirmed version.']
    ]),
    'window-intake':legacyWindow,
    'window-space':legacyWindow,
    'window-span':legacyWindow,
    'window-resolve':legacyWindow,
    'window-parts':legacyWindow,
    'window-review':legacyWindow,
    'picnic-chooser':legacyPicnic,
    'picnic-config':legacyPicnic,
    'picnic-review':guide('Keep the bridge gap honest',[
      ['Freeze user choices','Form, scope, length, preference.'],
      ['Don’t invent Store input','No demand packet yet.'],
      ['No fake green','Unresolved stays unresolved.']
    ]),
    store:guide('Let Store answer Store questions',[
      ['Keep the basis','Pin, request, hashes, material, capability, Q.'],
      ['Changed job = new answer','Never reuse the old result.'],
      ['Quote is not custody','No inventory or payment implied.'],
      ['Full build','Need expiry, concurrency, retries, signed receipts.']
    ]),
    request:guide('Scope the services',[
      ['Don’t redesign here','Geometry is already defined.'],
      ['Keep yes/no explicit','Declined work matters downstream.'],
      ['Request ≠ order','No hidden defaults or silent add-ons.']
    ]),
    yard:guide('Return facts, not surprises',[
      ['No silent substitution','Changes come back as changes.'],
      ['Keep reasons','Shortage ≠ preference.'],
      ['Response binds to request','No floating Yard answer.'],
      ['Still modeled','No real staff queue or inventory custody.']
    ]),
    terms:guide('Keep the verbs apart',[
      ['Offer ≠ accept','Accept ≠ pay. Pay ≠ allocate.'],
      ['Scroll does nothing','Viewing never creates an event.'],
      ['No machine leap','Commerce cannot create Cycle Start.']
    ]),
    recap:guide('Summarize, don’t backfill',[
      ['Read the record','Do not create state here.'],
      ['Keep gaps visible','Missing stays missing.'],
      ['Link the receipts','Summary is not the audit trail.']
    ]),
    record:guide('Close with evidence',[
      ['Keep the chain','Definition → Store → fulfillment → custody.'],
      ['No rewrite','Corrections append; history stays.'],
      ['Still not durable','Full build needs signed, stored owner records.']
    ]),
    'start-own-live':RAILS['job1-bench'],
    'outdoor-build-live':guide('Keep Outdoor its own job',[
      ['Don’t borrow Job 1','Own definition, own Store handoff.'],
      ['Keep source trail','Plan/source stays attached.'],
      ['Fail closed','Missing Store coverage stays missing.'],
      ['Known wart','Still iframe-hosted.']
    ]),
    'window-seat-live':guide('One job, two views',[
      ['Same rules','Six steps, live Store. No exception.'],
      ['Whole job = audit view','Same state, every step shown.'],
      ['Fork at the hero','Bench, or read it all.'],
      ['Edge mill','Any depth: boards milled to width, priced by Store.'],
      ['Known wart','Iframe complicates focus, print, routing.']
    ]),
    'proof-store':RAILS['job1-store'],
    'proof-accept':guide('Two customer choices',[
      ['Back or buy','Nothing else.'],
      ['One click, three receipts','Offer · acceptance · payment stay separate.'],
      ['Make it idempotent','Double-click/retry must not double-charge.'],
      ['Still simulated','No PSP, webhook, refund, tax, settlement.']
    ]),
    'proof-yard':guide('Show the whole middle',[
      ['One long scroll','No internal Yard buttons.'],
      ['Scroll is inert','Events come from the explicit simulation.'],
      ['READY ≠ custody','Handoff closes it.'],
      ['No magic controller','Lowering/program/cycle objects are not commissioned yet.'],
      ['Full build','Durable queue, staff events, telemetry, reruns, material reconciliation.']
    ]),
    'proof-terms':guide('Audit-only surface',[
      ['Not a customer stop','Yard already carries the receipts.'],
      ['Read only','No new events here.'],
      ['Retire later','Keep until deep links/tests move.']
    ]),
    'proof-record':guide('Close after custody',[
      ['No extra close button','Handoff already did it.'],
      ['Rebuild from receipts','Final state should be derivable.'],
      ['Still browser-held','Full build needs durable signed storage.']
    ]),
    'playhouse-s001':guide('Define the sheet job first',[
      ['Geometry first','Machine answer comes later.'],
      ['Keep extra ops','Don’t drop the hard parts to get green.'],
      ['No controller code','This is still a project definition.']
    ]),
    'playhouse-machine':guide('Only machine-facing facts',[
      ['Keep it portable','Part geometry, not controller registers.'],
      ['Test the math','Geometry kernels need tolerance tests.'],
      ['Controller stays local','Postprocessor belongs at the commissioned cell.']
    ]),
    'playhouse-store':guide('Mixed answer is okay',[
      ['Green what is green','Supported route stays supported.'],
      ['Keep the red lines','Unresolved ops stay visible.'],
      ['No scope trimming','Store cannot quietly delete work.']
    ]),
    'playhouse-review':guide('Freeze the whole ask',[
      ['Keep unresolved work','Version includes every requested op.'],
      ['No silent partial order','Partial acceptance needs an explicit rule.'],
      ['Show the boundary','Supported ≠ fully fulfilled.']
    ]),
    'playhouse-request':guide('Carry the exact ask',[
      ['Send all lines','Not just the supported ones.'],
      ['Request ≠ order','No commercial promotion.'],
      ['Still incomplete','Mixed-job commerce is not built yet.']
    ]),
    'playhouse-yard':guide('Return the mixed answer',[
      ['Don’t fake completeness','Supported + unresolved can coexist.'],
      ['Reason every gap','Line-level reasons, not generic refusal.'],
      ['No seller yet','Reference answer is not an offer.']
    ]),
    'playhouse-terms':guide('Null is valid',[
      ['Don’t fill blanks','No offer means no payment/allocation.'],
      ['No action here','Chronology only.'],
      ['Keep it boring','Truth beats a green timeline.']
    ]),
    'playhouse-result':guide('Say what the proof proved',[
      ['Geometry proof only','Do not imply physical execution.'],
      ['Keep unresolved ops','They still belong to the job.'],
      ['Next proof','Need real yield, toolpath and inspection evidence.']
    ]),
    'playhouse-record':guide('Keep the incomplete record',[
      ['Missing stays missing','No physical completion claim.'],
      ['Keep the definition','A useful record can still stop early.'],
      ['Full build','Same durable owner-record service as every project.']
    ]),
    'picnic-store':guide('Stop at the bridge gap',[
      ['Choices are valid','The project is not the problem.'],
      ['No demand packet','So no Store answer.'],
      ['Don’t fake green','No SKU, price or refusal invented.']
    ]),
    'picnic-request':guide('Defer without erasing',[
      ['Keep the project','Back preserves the choices.'],
      ['Disable with a reason','No mystery dead-end.'],
      ['Bridge first','Build the demand packet before Yard.']
    ]),
    'picnic-yard':guide('Not reached',[
      ['No request, no answer','Simple.'],
      ['Don’t infer downstream','Keep this empty on purpose.']
    ]),
    'picnic-terms':guide('Not reached',[
      ['Null stays null','No offer, payment or allocation.'],
      ['Don’t decorate it green','Nothing happened.']
    ]),
    'picnic-recap':guide('Stop where the job stopped',[
      ['Keep the choices','Project survives the gap.'],
      ['No backfill','Later events stay absent.']
    ]),
    'picnic-record':guide('Keep the failed-to-advance record',[
      ['Show what is known','And what never happened.'],
      ['No fake completion','Commercial + physical stay null.']
    ]),
    'alcove-store-order-surface':guide('Store seam',[
      ['Store facts only','No customer geometry rewrite.'],
      ['Bind to the request','No floating answer.'],
      ['Recovery wart','Injected surface; consolidate only after parity.']
    ]),
    'alcove-store-service-choices':guide('Service scope',[
      ['Yes/no/unavailable differ','Keep all three.'],
      ['No hidden defaults','Selected work must be explicit.'],
      ['Full build','Drive this from Store-backed service schema.']
    ]),
    'alcove-store-yard-answer':guide('Yard answer',[
      ['Reason changes','No silent substitution.'],
      ['Bind to request','Same job, same version.'],
      ['Recovery wart','Injected surface, not final component architecture.']
    ]),
    'alcove-store-commercial-sequence':guide('Keep events separate',[
      ['No scroll events','Viewing changes nothing.'],
      ['Commerce ≠ machine','Never jump authority layers.'],
      ['Still reference-only','Populate from real services later.']
    ]),
    'alcove-store-returned-offer':guide('Offer detail',[
      ['Show the basis','Version, Store state, validity.'],
      ['Expire it','Old offers need revalidation.'],
      ['Offer ≠ payment','Keep the seam.']
    ])
  });

  function esc(value){
    return String(value ?? '').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function revItem(t){
    const m=/^(.*?): (https:\/\/\S+)$/.exec(t);
    return '<li>'+(m?esc(m[1])+': <a href="'+esc(m[2])+'" target="_blank" rel="noopener">'+esc(m[2].replace(/^https:\/\/github\.com\/GeorgePlattDemo\//,''))+'</a>':esc(t))+'</li>';
  }
  function renderRail(r){
    return [
      '<p class="hd rev-hd">'+esc(r.header||'DEV/REV GUIDE')+'</p>',
      '<p class="rev-flag">'+esc(r.flag)+'</p>',
      '<ul class="rev-list">'+r.bullets.map(revItem).join('')+'</ul>',
      ...r.sections.map(sec=>'<p class="rev-sec'+(sec.quiet?' quiet':'')+'">'+esc(sec.title)+'</p><ul class="rev-list'+(sec.quiet?' quiet':'')+'">'+sec.items.map(revItem).join('')+'</ul>')
    ].join('');
  }

  function render(pageId){
    const meta='<div class="guide-meta"><span>'+esc(pageId)+'</span><span>'+VERSION+'</span></div>';
    // Job 1 is one page with two trail steps; both rails ship and the page's stage picks one.
    if(pageId==='start-own-live'){
      return '<div class="rev-stage" data-rev-stage="intent">'+renderRail(RAILS['job1-idea'])+'</div>'
        +'<div class="rev-stage" data-rev-stage="bench">'+renderRail(RAILS['job1-bench'])+'</div>'+meta;
    }
    const p=PAGES[pageId] || guide('Keep it honest',[
      ['Don’t fake a contract','This page still needs a specific Dev Guide.'],
      ['Preserve the main','Developer notes stay in the rail.']
    ]);
    if(p.flag) return renderRail(p)+meta;
    return [
      '<p class="hd">DEV GUIDE</p>',
      '<p class="goal">'+esc(p.goal)+'</p>',
      ...p.rows.map(row=>'<div class="row guide-row"><b>'+esc(row[0])+'</b><span>'+esc(row[1])+'</span></div>'),
      ...((p.later && p.later.length) ? ['<p class="goal later-hd">Build later</p>', ...p.later.map(row=>'<div class="row guide-row later" data-coming-row="'+esc(row[0])+'"><b>'+esc(row[0])+'</b><span>'+esc(row[1])+'</span></div>')] : []),
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
