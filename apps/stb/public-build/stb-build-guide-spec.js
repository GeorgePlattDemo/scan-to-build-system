(function(g){
  'use strict';

  const VERSION='STB-DEV-GUIDE-0.2';
  const guide=(goal,rows)=>Object.freeze({goal,rows:Object.freeze(rows.map(row=>Object.freeze(row)))});

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
      ['No hidden authority','Orientation changes no project fact.']
    ]),
    returning:guide('Resume cleanly',[
      ['Don’t start over','Saved project stays saved.'],
      ['Refresh outside facts','Old Store answers are history.'],
      ['Fork changes','New work gets a new version.'],
      ['Still demo-only','Named users are not real auth.']
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
    ]),
    projects:guide('Keep the library obvious',[
      ['Don’t overcrowd','Show live, bounded, or deferred clearly.'],
      ['One project at a time','Clear old route/state on project switch.'],
      ['No cross-talk','Job 1 facts stay out of Outdoor, Alcove, Sheet.'],
      ['Still patched','Some legacy routes are intercepted, not retired.']
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
      ['Known gap','Spot target mapping is not fully bound yet.']
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
    'start-own-live':guide('Preserve the working artifact',[
      ['Don’t squeeze it','Guide uses the rail; iframe keeps its width.'],
      ['Mind the seam','Parent routes; child owns the bounded definition.'],
      ['postMessage is a contract','Origin + schema + correlation.'],
      ['Known wart','Two DOMs, focus/history seams, browser-held state.']
    ]),
    'outdoor-build-live':guide('Keep Outdoor its own job',[
      ['Don’t borrow Job 1','Own definition, own Store handoff.'],
      ['Keep source trail','Plan/source stays attached.'],
      ['Fail closed','Missing Store coverage stays missing.'],
      ['Known wart','Still iframe-hosted.']
    ]),
    'window-seat-live':guide('Same truth, two views',[
      ['Guided ≠ different data','One snapshot, different visibility.'],
      ['Continuous is audit mode','Not a second journey.'],
      ['View changes no authority','Only visibility changes.'],
      ['Known wart','Iframe complicates focus, print, routing, analytics.']
    ]),
    'proof-store':guide('Show the exact Store answer',[
      ['Keep the long IDs','They prove which answer this is.'],
      ['Reject stale results','Late/duplicate/wrong-correlation stays historical.'],
      ['Budgetary means budgetary','No commerce or machine authority.'],
      ['Full build','Timeouts, retries, expiry, signed receipts.']
    ]),
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

  function render(pageId){
    const p=PAGES[pageId] || guide('Keep it honest',[
      ['Don’t fake a contract','This page still needs a specific Dev Guide.'],
      ['Preserve the main','Developer notes stay in the rail.']
    ]);
    return [
      '<p class="hd">DEV GUIDE</p>',
      '<p class="goal">'+esc(p.goal)+'</p>',
      ...p.rows.map(row=>'<div class="row guide-row"><b>'+esc(row[0])+'</b><span>'+esc(row[1])+'</span></div>'),
      '<div class="guide-meta"><span>'+esc(pageId)+'</span><span>'+VERSION+'</span></div>'
    ].join('');
  }

  g.STBBuildGuideSpec=Object.freeze({
    version:VERSION,
    pages:PAGES,
    pageIds:Object.freeze(Object.keys(PAGES)),
    render
  });
})(window);
