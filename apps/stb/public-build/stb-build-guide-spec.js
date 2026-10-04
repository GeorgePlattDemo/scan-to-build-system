(function(g){
  'use strict';

  const VERSION='STB-DEV-GUIDE-0.2';
  const guide=(goal,rows,later=[])=>Object.freeze({goal,rows:Object.freeze(rows.map(row=>Object.freeze(row))),later:Object.freeze(later.map(row=>Object.freeze(row)))});



  // Dev/Rev rails: a header, a flag line, then plain bullets and sections. Only the header is bold.
  // Owner-authorized editorial rails. Requirements, evidence and authority stay separate.
  const JOB1={
    "job1-idea": {
      "header": "DEV/REV GUIDE — JOB 1 · PAGE 1 · INTENT",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "This tile: one bounded board job. Intent supplies the permitted requirements; the bench derives its features.",
        "This page is the want. It does not become the bench.",
        "Knobs for this job are made here from bounded rules. No general intent-to-CAM compiler claimed.",
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
            "User owns the want. System keeps its controlling definition.",
            "Bench revises the permitted definition. Store owns stock; custody is separate.",
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
        "Board dimensions become identified cut and spot requirements. The output is demand, not just pixels.",
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
            "Bench revises the permitted definition. Store owns stock; custody is separate.",
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
        "Store answers the board and feature demand. No counter-side redraw or local Store replica.",
        "This page is one answer to one confirmed version.",
        "Viewing it creates no event.",
        "Store Zero is a declared reference lumberyard. Modeled stock and work; no live dealer commitment or binding quote.",
        "No payment, allocation, release, or Cycle Start authority.",
        "Same governing inputs, Store state and clocks: reproducible result. Pin alone is not enough."
      ],
      "sections": [
        {
          "title": "Version chain",
          "items": [
            "Sent, receipt, result. Three event roles with their own evidence. Do not collapse them.",
            "A sent hash is not a receipt.",
            "A receipt is not a result.",
            "A result is not acceptance."
          ]
        },
        {
          "title": "May not touch",
          "items": [
            "Geometry. Controlling dimensions. Board feature locations. User material choice. Version identity."
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
            "Catalog clock travels with the answer. Changed governing state needs fresh evaluation; the number may stay the same.",
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
            "Staged ≠ picked up. Custody closes this handoff, not every engineering or assembly question.",
            "Events stay separate. Missing events stay missing. Nothing is promoted by wording.",
            "ACCEPT creates the next event. It does not allocate, pay, or release.",
            "CHANGE DEFINITION mints a version. It does not edit this one."
          ]
        },
        {
          "title": "Machine",
          "items": [
            "Registered setup, loaded material, datum validation and local release are separate. Record each required check.",
            "Design aim: put recurring complexity in registered rules. Validation-only setup is not proved; Project 1 names the physical blockers.",
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
            "Project 1 digital trail: https://github.com/GeorgePlattDemo/scan-to-build-store/blob/main/docs/project-1-digital-trail/README.md",
            "Store Zero: https://github.com/GeorgePlattDemo/scan-to-build-store/blob/main/README.md",
            "Travel standard: https://github.com/GeorgePlattDemo/scan-to-build-store/blob/9c62d9d6f7775deef83d47196d32c9b5174a352c/DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md",
            "D-001 envelope, file 0.1, version string D001-STAGE2-ENVELOPE-0.3: https://github.com/GeorgePlattDemo/scan-to-build-store/blob/9c62d9d6f7775deef83d47196d32c9b5174a352c/D-001-STAGE2-ENVELOPE-0.1.md"
          ]
        }
      ]
    }
  };
  // Job 2 (Alcove): bounded fit requirements, with implementation gaps kept explicit.
  const JOB2={
    "alcove-idea": {
      "header": "DEV/REV GUIDE — JOB 2 · ALCOVE · PAGE 1 · INTENT",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Critical fit: controlling opening facts become part and feature requirements. A scan does not confirm them."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "No universal configurator.",
            "Every intent assembles its own tools.",
            "Only those tools go to the bench.",
            "The picture is context.",
            "The picture is not the definition.",
            "The scan is context.",
            "The scan is not measurement authority.",
            "Controlling facts own the cut.",
            "Everything else stays attached as context."
          ]
        },
        {
          "title": "INTENT MUST DEFINE",
          "items": [
            "What must be known.",
            "Who owns each fact.",
            "What the user enters.",
            "What System may derive.",
            "What may be omitted.",
            "What omission means.",
            "What choices create new required facts.",
            "What makes the definition complete.",
            "What must be routed elsewhere."
          ]
        },
        {
          "title": "ALCOVE FACTS",
          "items": [
            "Height.",
            "Width / span.",
            "Depth.",
            "Shelf count.",
            "Shelf elevations.",
            "Material.",
            "Door choice.",
            "Taste positions.",
            "Site condition.",
            "Slope.",
            "Bow.",
            "Plumb.",
            "Scan provenance."
          ]
        },
        {
          "title": "CONTROLLING VS OBSERVED",
          "items": [
            "Controlling means: cut to this.",
            "Observed does not automatically mean controlling.",
            "Scan does not outrank a controlling measurement.",
            "Bow stays bow.",
            "Slope stays slope.",
            "Plumb stays plumb.",
            "Taste stays taste.",
            "Do not silently convert context into geometry.",
            "Do not auto-correct a room nobody else stood in."
          ]
        },
        {
          "title": "TOOL MANIFEST",
          "items": [
            "Every intent exposes a tool manifest.",
            "Required inputs are named.",
            "Conditional inputs are named.",
            "Derivation rules are named.",
            "Completion rules are named.",
            "Downstream routing is named.",
            "Store-owned facts are marked Store-owned.",
            "Missing Store facts stay missing upstream.",
            "The manifest defines what may appear on the bench.",
            "The bench does not enlarge it."
          ]
        },
        {
          "title": "CONDITIONAL TOOLS",
          "items": [
            "Choices may create new required facts.",
            "Choices do not create hidden defaults.",
            "DOORS = NO → no door tools.",
            "DOORS = YES → door facts required.",
            "Door opening becomes required.",
            "Door quantity becomes required.",
            "Handing becomes required where applicable.",
            "Clearance becomes required where applicable.",
            "Construction / sourcing path must be declared.",
            "Missing required door facts = definition incomplete."
          ]
        },
        {
          "title": "SPECIAL ORDER · S/O",
          "items": [
            "S/O is a routing tag.",
            "S/O stays part of the identified definition.",
            "S/O routes the requirement outside local fabrication.",
            "Store or supplier authority must resolve it.",
            "S/O is not approval.",
            "S/O is not availability.",
            "S/O is not a quote.",
            "S/O is not permission to substitute.",
            "S/O does not erase the requirement.",
            "No resolution → UNRESOLVED or UNAVAILABLE.",
            "System does not redesign it to make local machinery happy."
          ]
        },
        {
          "title": "COMPLETION RULE",
          "items": [
            "Intent-complete means the job can be stated.",
            "Intent-complete does not mean Store can fulfill it.",
            "User/System-owned facts must be complete.",
            "Store-owned facts need not be invented.",
            "An explicit unresolved route is valid.",
            "A hidden missing fact is not."
          ]
        },
        {
          "title": "CURRENT GAP",
          "items": [
            "Current gap: door tools, S/O routing, and the formal tool manifest are governing rules here; the current Alcove intent page does not yet implement them."
          ]
        },
        {
          "title": "PLUMBING RULES",
          "items": [
            "Preserve the working artifact.",
            "Guide uses the rail.",
            "Iframe keeps its width.",
            "Parent routes.",
            "Child owns the bounded definition.",
            "New required fact → return to Intent.",
            "Extend the manifest there.",
            "Never invent a new knob on the bench."
          ],
          "quiet": true
        }
      ]
    },
    "alcove-bench": {
      "header": "DEV/REV GUIDE — JOB 2 · ALCOVE · PAGE 2 · THE BENCH",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Opening facts become this insert’s parts and features. Preserve their source and controlling revision."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "This page is the bench.",
            "Do not rename it configurator.",
            "Do not grow it into a universal configurator.",
            "Intent decided what may change.",
            "Bench applies those permitted changes.",
            "Bench produces the bounded job.",
            "Bench does not answer Store questions."
          ]
        },
        {
          "title": "BENCH RECEIVES",
          "items": [
            "Identified intent.",
            "Permitted toolset.",
            "Current values.",
            "Controlling facts.",
            "Declared derivation rules.",
            "Conditional requirements already exposed by Intent."
          ]
        },
        {
          "title": "BENCH PRODUCES",
          "items": [
            "One identified definition.",
            "Finished-part demand.",
            "Feature demand.",
            "Operation demand.",
            "Material demand.",
            "Store-facing physical demand."
          ]
        },
        {
          "title": "ALCOVE TRANSFORMATION",
          "items": [
            "Height → upright finished length.",
            "Span → shelf finished length.",
            "Depth → shelf strips.",
            "Depth → longitudinal mill demand when required.",
            "Shelf count → shelf quantity.",
            "Shelf elevations → defined shelf positions.",
            "Selected spotting → physical spot demand.",
            "Shelf elevations → spot locations.",
            "Material choice → material demand.",
            "Door choice → no door demand or defined door demand.",
            "S/O requirement → retained alternate fulfillment demand."
          ]
        },
        {
          "title": "PHYSICAL DEMAND RULE",
          "items": [
            "If it changes the cut, show it.",
            "If it changes a feature, show it.",
            "If it changes an operation, show it.",
            "If it changes material demand, show it.",
            "If it changes Store evaluation, send the changed demand.",
            "Do not hide physical consequences behind UI state."
          ]
        },
        {
          "title": "SPOTTING RULE",
          "items": [
            "A spot is physical work.",
            "Shelf-driven spots stay tied to shelf elevations.",
            "Spot demand stays bound to its target component.",
            "Tool demand stays explicit.",
            "Location stays explicit.",
            "Store may support it.",
            "Store may refuse it.",
            "Store may price it.",
            "Store may not move it."
          ]
        },
        {
          "title": "BENCH MAY DERIVE",
          "items": [
            "Finished component geometry.",
            "Required part count.",
            "Required feature count.",
            "Required operation demand.",
            "Declared transformations from the manifest."
          ]
        },
        {
          "title": "BENCH MAY NOT INVENT",
          "items": [
            "New user intent.",
            "New controlling dimensions.",
            "New material preference.",
            "New shelf locations.",
            "New door requirements.",
            "Store SKU.",
            "Store price.",
            "Store time.",
            "Store capability.",
            "Store machine envelope.",
            "Store economics."
          ]
        },
        {
          "title": "CHANGE RULE",
          "items": [
            "A controlling change creates a different definition.",
            "New definition → new version identity.",
            "New definition → invalidate prior Store answer.",
            "New definition → fresh Store ask.",
            "Old definition stays history.",
            "Old Store answer stays with the old definition.",
            "Never attach an old answer to changed work."
          ]
        },
        {
          "title": "FAILURE RULE",
          "items": [
            "Missing tool → return to Intent.",
            "Missing derivation rule → stop.",
            "Missing Store fact → ask Store.",
            "Missing authority → leave unresolved.",
            "Do not patch across an authority boundary."
          ]
        },
        {
          "title": "COMPLETENESS RULE",
          "items": [
            "Bench-defined does not mean Store-supportable.",
            "A valid job may still be UNRESOLVED.",
            "A valid job may still be REFUSED.",
            "A valid job may still be UNAVAILABLE.",
            "That is not a configurator failure.",
            "That is the boundary working."
          ]
        },
        {
          "title": "CURRENT GAP",
          "items": [
            "Current gap: the bench does not yet consume a formal tool manifest. Preserve the existing Alcove behavior; do not invent one in this pass."
          ]
        },
        {
          "title": "PLUMBING",
          "items": [
            "Preserve the working artifact.",
            "Do not squeeze it.",
            "Guide uses the rail.",
            "Iframe keeps its width.",
            "Mind the seam.",
            "postMessage is a contract.",
            "Origin matters.",
            "Schema matters.",
            "Correlation matters.",
            "Parent routes.",
            "Child owns the bounded definition.",
            "Known wart: two DOMs.",
            "Known wart: focus seams.",
            "Known wart: history seams.",
            "Known wart: browser-held state."
          ],
          "quiet": true
        }
      ]
    },
    "alcove-store": {
      "header": "DEV/REV GUIDE — JOB 2 · ALCOVE · PAGE 3 · STORE ANSWER",
      "flag": "Intent makes the knobs. The bench only turns them. Store answers Store questions.",
      "bullets": [
        "Answer the insert’s identified demand. Favorable material and machining facts do not establish site fit."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "This page is one Store answer.",
            "The answer belongs to one identified definition.",
            "The answer belongs to one identified Store authority.",
            "Viewing the page creates no domain event.",
            "Store answers the job.",
            "Store does not redefine the job."
          ]
        },
        {
          "title": "REFERENCE STATUS",
          "items": [
            "Store Zero is a declared reference lumberyard.",
            "It is not live inventory.",
            "It is not a live branch commitment.",
            "It is not a dealer quote.",
            "Its economics are declared reference economics.",
            "Its machine capability is declared reference capability.",
            "Its answer is meaningful only with its pins and authorities."
          ]
        },
        {
          "title": "FOUR STORE OUTCOMES",
          "items": [
            "SUPPORTABLE.",
            "UNRESOLVED.",
            "REFUSED.",
            "UNAVAILABLE.",
            "Every non-supportable answer carries reasons.",
            "No reason → incomplete audit trail."
          ]
        },
        {
          "title": "STORE MUST RESOLVE",
          "items": [
            "Material identity.",
            "Parent stock.",
            "Required quantity.",
            "Catalog availability.",
            "Required Store services.",
            "Supported operations.",
            "Machine-envelope fit.",
            "Crosscut demand.",
            "Mill demand.",
            "Spot demand.",
            "Other declared operation demand.",
            "Modeled machine work.",
            "Modeled machine time.",
            "Hardware demand where Store-owned.",
            "Store economics.",
            "Pricing basis.",
            "Completeness.",
            "Reason records.",
            "Calculation identity."
          ]
        },
        {
          "title": "STORE MAY SELECT",
          "items": [
            "Compliant Store stock.",
            "Compliant parent length.",
            "Compliant Store SKU.",
            "Store-owned service path.",
            "Store-owned fulfillment path."
          ]
        },
        {
          "title": "STORE MAY NOT CHANGE",
          "items": [
            "Controlling site dimensions.",
            "Unit height.",
            "Finished span.",
            "Finished depth.",
            "Shelf count.",
            "Shelf elevations.",
            "Requested material demand.",
            "Requested feature locations.",
            "Door intent.",
            "S/O intent.",
            "Identified definition version."
          ]
        },
        {
          "title": "NO SILENT SUBSTITUTION",
          "items": [
            "Shortage is not preference.",
            "Different stock is not automatically equivalent.",
            "Different material is not automatically equivalent.",
            "Easier geometry is not equivalent geometry.",
            "Unsupported work stays unsupported.",
            "Unavailable work stays unavailable.",
            "Store does not alter the job to make the answer green."
          ]
        },
        {
          "title": "NO LOCAL STORE REPLICA",
          "items": [
            "System does not pre-compute Store price.",
            "System does not pre-compute Store time.",
            "System does not pre-compute Store SKU choice.",
            "System does not pre-compute Store capability.",
            "System does not pre-compute Store envelope fit.",
            "System does not recreate Store economics.",
            "Ask Store.",
            "No answer → preserve the gap.",
            "No local fallback."
          ]
        },
        {
          "title": "COMPLETE PRICE RULE",
          "items": [
            "Material must resolve.",
            "Required operations must resolve.",
            "Modeled work must resolve.",
            "Declared economics must resolve.",
            "Required extras must resolve.",
            "Missing required component → no complete budgetary estimate.",
            "Do not price around an unresolved requirement."
          ]
        },
        {
          "title": "ANSWER IDENTITY",
          "items": [
            "Bind answer to project.",
            "Bind answer to definition version.",
            "Bind answer to request identity.",
            "Bind answer to Store revision.",
            "Bind answer to machine-envelope authority.",
            "Bind answer to economics authority.",
            "Bind answer to calculation identity.",
            "Bind answer to completeness.",
            "Bind answer to reasons.",
            "Pins travel with the answer.",
            "Reasons travel with the answer."
          ]
        },
        {
          "title": "REPRODUCIBILITY RULE",
          "items": [
            "Same identified demand.",
            "Same pinned Store authority.",
            "Same declared rules.",
            "Same calculation.",
            "Change the definition → fresh evaluation for that version. Price or status may match.",
            "Change governing Store authority → separately identified evaluation. Outcome may match.",
            "Keep both records.",
            "Never overwrite history."
          ]
        },
        {
          "title": "FIRST THREE IDENTITIES",
          "items": [
            "SENT = what System sent.",
            "ARRIVED = what Store received.",
            "ANSWERED = what Store calculated.",
            "Sent record is not receipt evidence. The payload digest may match.",
            "Receipt evidence is not calculation evidence. Preserve both roles.",
            "Calculation evidence is not customer acceptance.",
            "Do not collapse them into one receipt."
          ]
        },
        {
          "title": "STORE ANSWER ≠ OFFER",
          "items": [
            "Store answer is a Store result.",
            "Store answer is not a commercial offer.",
            "Only a fresh SUPPORTABLE answer may feed the simulated offer.",
            "UNRESOLVED stops with reasons.",
            "REFUSED stops with reasons.",
            "UNAVAILABLE stops with reasons.",
            "No green answer → no simulated offer."
          ]
        },
        {
          "title": "OFFER ≠ USER DECISION",
          "items": [
            "Simulated offer is a new event.",
            "It is based on the exact Store answer.",
            "User may accept.",
            "User may decline.",
            "Decision belongs to that version.",
            "Decision does not rewrite the Store result."
          ]
        },
        {
          "title": "ACCEPT",
          "items": [
            "ACCEPT creates the next event.",
            "ACCEPT does not move money.",
            "ACCEPT does not allocate material.",
            "ACCEPT does not release production.",
            "ACCEPT does not start a machine.",
            "ACCEPT does not claim physical work."
          ]
        },
        {
          "title": "CHANGE DEFINITION",
          "items": [
            "CHANGE DEFINITION creates a new version.",
            "It does not edit the confirmed version.",
            "It invalidates downstream use of the old answer.",
            "Old version stays immutable history.",
            "New version requires a fresh Store answer."
          ]
        },
        {
          "title": "THIRTEEN AUDIT EVENTS · SIX CUSTOMER STEPS",
          "items": [
            "SENT — identified definition sent.",
            "ARRIVED — Store receipt.",
            "ANSWERED — Store budgetary answer or refusal.",
            "OFFERED — simulated commercial offer.",
            "YOUR CALL — accept or decline.",
            "PAID — simulated.",
            "QUEUED — sent to Store / yard queue.",
            "MATERIAL ALLOCATED.",
            "PRODUCTION RELEASED.",
            "CUT · MILL · DRILL · LABEL.",
            "STAGED.",
            "READY NOTICE.",
            "PICKED UP · CUSTODY."
          ]
        },
        {
          "title": "KEEP THE SEPARATIONS",
          "items": [
            "Request ≠ answer.",
            "Answer ≠ offer.",
            "Offer ≠ acceptance.",
            "Acceptance ≠ payment.",
            "Payment ≠ queue.",
            "Queue ≠ allocation.",
            "Allocation ≠ release.",
            "Release ≠ Cycle Start.",
            "Cycle Start ≠ completed work.",
            "Completed work ≠ staged.",
            "Staged ≠ ready.",
            "Ready ≠ custody.",
            "Custody closes the handoff."
          ]
        },
        {
          "title": "POST-ANSWER AUDIT CHAIN",
          "items": [
            "Post-answer events are hash-linked.",
            "Each event carries its predecessor.",
            "New version starts a new chain.",
            "Old chain stays history.",
            "Never splice two versions together.",
            "Never resurrect a stale answer downstream."
          ]
        },
        {
          "title": "MACHINE BOUNDARY",
          "items": [
            "Capability answer is not machine control.",
            "Production release is not Cycle Start.",
            "A hash is not Cycle Start.",
            "A Store result is not Cycle Start.",
            "The declared envelope answers modeled fit.",
            "The declared envelope supports modeled time.",
            "It does not claim commissioned execution.",
            "Local safety controls remain local.",
            "Operator boundary remains local.",
            "The person at the cell owns Cycle Start."
          ]
        },
        {
          "title": "WHAT THIS PAGE DOES NOT CLAIM",
          "items": [
            "Live inventory.",
            "Live dealer commitment.",
            "Final commercial quote.",
            "Real payment.",
            "Material allocation.",
            "Production release.",
            "Physical Cycle Start.",
            "Completed fabrication.",
            "Inspection.",
            "Staging.",
            "Readiness.",
            "Custody."
          ]
        },
        {
          "title": "AUDIT QUESTION",
          "items": [
            "What definition was sent?",
            "What did Store receive?",
            "What authority answered?",
            "What did Store answer?",
            "Why?",
            "Under which pins?",
            "What changed afterward?",
            "Who owned each event?",
            "Did anyone rewrite the job?",
            "Can the chain prove they did not?"
          ]
        },
        {
          "title": "CURRENT GAP",
          "items": [
            "Current gap: S/O requirements are not yet carried through this Alcove Store path. Do not simulate a Store answer for them."
          ]
        },
        {
          "title": "AUTHORITY LINKS",
          "items": [
            "Store Zero README",
            "https://github.com/GeorgePlattDemo/scan-to-build-store/blob/main/README.md",
            "Dimensional Store Travel Standard",
            "https://github.com/GeorgePlattDemo/scan-to-build-store/blob/9c62d9d6f7775deef83d47196d32c9b5174a352c/DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md",
            "D-001 Stage-2 Envelope",
            "File: D-001-STAGE2-ENVELOPE-0.1.md",
            "Internal version: D001-STAGE2-ENVELOPE-0.3",
            "https://github.com/GeorgePlattDemo/scan-to-build-store/blob/9c62d9d6f7775deef83d47196d32c9b5174a352c/D-001-STAGE2-ENVELOPE-0.1.md"
          ]
        },
        {
          "title": "AUTHORITY SUMMARY",
          "items": [
            "Intent defines the tools.",
            "Bench defines the job.",
            "Store answers the job.",
            "The trail records what happened next.",
            "None may silently rewrite another’s facts."
          ]
        }
      ]
    }
  };
  // Job 3 (Window Seat) rails: one per page of stb-window-seat-0.9.html, rendered inside that page.
  const JOB3={
    "ws-hero": {
      "header": "DEV/REV GUIDE — JOB 3 · WINDOW SEAT · PAGE 1 · WHAT SHE WANTS",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Space utilization: one assembly decomposed into named parts and features, through the same Store boundary."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "The picture is the want.",
            "The picture is not the definition.",
            "Her words carry weight. They are not measurements.",
            "Nobody cuts to a picture."
          ]
        },
        {
          "title": "TWO ROUTES, ONE JOB",
          "items": [
            "The regular path: one page at a time, on the six trail steps.",
            "One long scroll: every page in order, on one screen, for audit.",
            "One state. One definition. One Store request. Whichever route.",
            "Switching route keeps the version and the terms stage.",
            "Page 1 sits behind the trail. Step 1, Intent, is page 2."
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "Both routes send the same definition and get the same result hash. Test: window-seat-journey.test.mjs.",
            "Switching route keeps the state. Tests: window-seat.test.mjs, window-seat-journey.test.mjs.",
            "No nav step is current on page 1. Step 1, Intent, starts on page 2. Tests: window-seat.test.mjs, window-seat-journey.test.mjs."
          ]
        },
        {
          "title": "STATED ONLY",
          "items": [
            "The picture is context, not the definition.",
            "The hex trim in the picture stays context."
          ]
        },
        {
          "title": "PLUMBING",
          "items": [
            "Preserve the working artifact.",
            "Guide text comes from the shared guide file. One guide, not two.",
            "Parent routes. Child owns the bounded definition.",
            "postMessage is a contract. Origin, schema, correlation.",
            "Known wart. Two DOMs, focus and history seams, browser-held state."
          ],
          "quiet": true
        }
      ]
    },
    "ws-intent": {
      "header": "DEV/REV GUIDE — JOB 3 · WINDOW SEAT · PAGE 2 · YOUR INTENT",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Define assembly requirements upstream. Do not make the dealer reconstruct the design at the counter."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "No universal configurator.",
            "This page builds Window Seat’s configurator: the knobs this job needs, and only this job.",
            "Every knob is made here.",
            "The bench only turns them.",
            "A missing knob sends you back here. Never invent one on the bench."
          ]
        },
        {
          "title": "WHY CONFIGURATOR HELL HAPPENS",
          "items": [
            "A universal configurator tries to anticipate every job.",
            "Every new job adds knobs. Knobs never leave.",
            "Soon no knob can change without breaking another job.",
            "The fix: make the knobs from the job, at intent, then stop.",
            "The bench stays small because intent did the work.",
            "A new job gets its own knobs on its own intent page. Other jobs are untouched."
          ]
        },
        {
          "title": "HOW A KNOB IS MADE",
          "items": [
            "From the sketch: the number is read off the drawing.",
            "By hand: not on the sketch; you enter it.",
            "Derived: from a stated rule. No rule, no derivation.",
            "An added knob brings its required facts empty. No hidden defaults.",
            "The Store is not asked until the required facts are filled."
          ]
        },
        {
          "title": "THE 14 KNOBS",
          "items": [
            "From the sketch: overall height · left tower width · center width · right tower width · depth · upper bays · cubbies under the seat · left tower shelves · right tower shelves.",
            "By hand: clearance each side · seat height · upper storage, clear · wood.",
            "Derived: boards across the depth by this System composition rule over dimensional conventions. Can be set by hand. Store still chooses available stock."
          ]
        },
        {
          "title": "KNOBS ADDED BY HAND, HERE ONLY",
          "items": [
            "Front board below the seat.",
            "Shelf-pin spot facing. Needs a placement.",
            "One more spot. Needs a part, a distance and a placement.",
            "Wood screws. Need a gauge, a length, a finish and a count."
          ]
        },
        {
          "title": "CONTROLLING VS OBSERVED",
          "items": [
            "Where a number came from is kept apart from whether it controls.",
            "Only controlling numbers are cut to.",
            "Observed numbers stay attached as context.",
            "Taste and what’s off travel with the job. They cut nothing.",
            "Do not auto-correct a room nobody else stood in."
          ]
        },
        {
          "title": "OPEN QUESTIONS",
          "items": [
            "“A seat you can sit on” is carried as UNRESOLVED, for a qualified person.",
            "How it goes together on site is DEFERRED, to you or a qualified person.",
            "These load and site-assembly questions travel separately. Missing required manufacturing facts still block the ask."
          ]
        },
        {
          "title": "KEPT, NOT SENT",
          "items": [
            "Asked for, but the Store has no line: label every part · inspect the finished sizes · bundle by module · pack and protect · something else.",
            "Kept on the job, excluded from this Store ask. Show that exclusion at the decision; never claim the work done."
          ]
        },
        {
          "title": "COMPLETION RULE",
          "items": [
            "Intent-complete means the job can be stated.",
            "Intent-complete does not mean the Store can make it."
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "Knobs, including knobs added by hand, exist only on this page. Tests: window-seat.test.mjs, window-seat-journey.test.mjs.",
            "An added knob’s facts start empty, and the Store waits for them. Test: window-seat-journey.test.mjs."
          ]
        },
        {
          "title": "ENFORCED BY CODE ONLY",
          "items": [
            "Source kept apart from controlling status: measure(), conditions().",
            "Taste and what’s off cut nothing: identified().",
            "Separated load/site-assembly questions do not block the ask: conditions(). Not a waiver of required manufacturing facts.",
            "Kept-not-sent is never sent: buildRequest()."
          ]
        },
        {
          "title": "CURRENT GAP",
          "items": [
            "The seat question has nowhere to record a qualified person’s answer.",
            "Wood choices are listed on the page, not read from the Store catalog. The Store still refuses what it does not carry."
          ]
        },
        {
          "title": "PLUMBING",
          "items": [
            "Preserve the working artifact.",
            "Parent routes. Child owns the bounded definition."
          ],
          "quiet": true
        }
      ]
    },
    "ws-bench": {
      "header": "DEV/REV GUIDE — JOB 3 · WINDOW SEAT · PAGE 3 · THE BENCH",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Assembly → modules → parts → features. Keep each requirement and parent relationship traceable."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "This page is always the bench. Do not rename it configurator.",
            "The bench turns the knobs made at intent. It never adds one.",
            "A missing knob → back to intent.",
            "The bench defines the job. It does not answer Store questions."
          ]
        },
        {
          "title": "BENCH RECEIVES",
          "items": [
            "The identified intent · the 14 knobs · any knobs added by hand · current values · controlling facts · derivation rules."
          ]
        },
        {
          "title": "BENCH PRODUCES",
          "items": [
            "One identified definition · finished parts · features · operations · material demand · what will be asked of the Store."
          ]
        },
        {
          "title": "WINDOW SEAT TRANSFORMATION",
          "items": [
            "Tower and center widths → tops, bottoms, shelves and seat lengths.",
            "Depth → the width of every part.",
            "Boards across the depth → boards per part, and each board’s finished width.",
            "Seat height → where the seat sits; cubby divider length.",
            "Upper storage, clear → upper shelf position; upper divider length.",
            "Upper bays and cubbies → dividers.",
            "Tower shelves → shelves and their positions.",
            "Spot facing → spots at shelf positions, on tower sides only.",
            "Wood → the material of every board."
          ]
        },
        {
          "title": "EDGE MILL",
          "items": [
            "Depth is the customer’s number, in ¼ in steps.",
            "Boards are milled to width to match. 14 in → two 1×8s milled to 7 in.",
            "A depth that lands on a board sends no milling.",
            "The mill’s limit is Store capability. The page holds no copy.",
            "Too much to mill → the Store refuses, with its reason. Turn the knob. Ask again."
          ]
        },
        {
          "title": "CHANGE RULE",
          "items": [
            "Any change is a new version identity.",
            "The old answer becomes history. Downstream steps close. The Store is asked again.",
            "Never attach an old answer to changed work."
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "No control on the bench adds a knob. Tests: window-seat.test.mjs, window-seat-journey.test.mjs.",
            "Edge mill, ¼ in steps, and spots, (4+4) × 2 × 2 on tower sides. Tests: window-seat.test.mjs, shelf-pilot-demand.test.mjs.",
            "No mill limit, SKU, price or stock in the page. Tests: window-seat-journey.test.mjs, shelf-pilot-demand.test.mjs.",
            "Each change is a new version identity. Tests: window-seat.test.mjs, trail-stale-version.test.mjs."
          ]
        },
        {
          "title": "CURRENT GAP",
          "items": [
            "Reported gap: a no-change bench click re-asks the Store. Reproduce before fixing; owner is shared terms flow."
          ]
        },
        {
          "title": "HARDWARE SCOPE",
          "items": [
            "Wood screws travel as a requirement when that knob is on. Store picks its own item or refuses. Incomplete gauge, length, finish, or count blocks the ask. #8 may be refused if it is not stocked."
          ]
        },
        {
          "title": "PLUMBING",
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
    "ws-store": {
      "header": "DEV/REV GUIDE — JOB 3 · WINDOW SEAT · PAGE 4 · STORE ANSWER",
      "flag": "Intent makes the knobs. The bench only turns them. Store answers Store questions.",
      "bullets": [
        "Answer the assembly’s part demand. A machining answer does not settle the unresolved seating use."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "One fresh Store answer to this exact version.",
            "Viewing it creates no event.",
            "Store answers the job. Store does not redefine the job.",
            "Store owns capability, time, economics, and retained-control truth."
          ]
        },
        {
          "title": "REFERENCE STATUS",
          "items": [
            "Store Zero is a declared reference lumberyard.",
            "Not live inventory. Not a dealer commitment. Not a quote."
          ]
        },
        {
          "title": "FOUR STORE OUTCOMES",
          "items": [
            "SUPPORTABLE · UNRESOLVED · REFUSED · UNAVAILABLE.",
            "Every non-supportable answer carries reasons.",
            "A refusal is the result. Steps 4–6 stay inert.",
            "A failed ask stays failed, with nothing in its place."
          ]
        },
        {
          "title": "NO LOCAL STORE REPLICA",
          "items": [
            "No SKU, price, stock, capability or mill limit in the page.",
            "Ask the Store."
          ]
        },
        {
          "title": "FIRST THREE IDENTITIES",
          "items": [
            "SENT · ARRIVED · ANSWERED.",
            "Three event roles. Keep their evidence separate; digests need not be unequal."
          ]
        },
        {
          "title": "COMPLETE PRICE RULE",
          "items": [
            "The Store budgetary answer is the whole Store result.",
            "The complete budgetary estimate is the number inside it, only when every line is supportable.",
            "Missing required component → no complete budgetary estimate."
          ]
        },
        {
          "title": "TWO LISTS",
          "items": [
            "“What happens next” is the Store Zero text’s 12-step walk.",
            "The shared terms flow records 13 events.",
            "They are different lists. Events stay separate."
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "A fresh live answer; a failed ask stays failed. Tests: window-seat.test.mjs, trail-terms.test.mjs.",
            "15 in over 2 boards: refused by the Store (EDGE_MILL_REMOVAL_EXCEEDS_D001_MAX_CUT_WIDTH), no complete budgetary estimate. Test: window-seat-journey.test.mjs.",
            "The Store Zero text is the shared file, never a copy. Tests: window-seat-journey.test.mjs, bounded-project-conformance.test.mjs."
          ]
        },
        {
          "title": "AUTHORITY LINKS",
          "items": [
            "Store Zero: https://github.com/GeorgePlattDemo/scan-to-build-store/blob/main/README.md",
            "Travel standard: https://github.com/GeorgePlattDemo/scan-to-build-store/blob/9c62d9d6f7775deef83d47196d32c9b5174a352c/DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md",
            "D-001 envelope, file 0.1, version string D001-STAGE2-ENVELOPE-0.3: https://github.com/GeorgePlattDemo/scan-to-build-store/blob/9c62d9d6f7775deef83d47196d32c9b5174a352c/D-001-STAGE2-ENVELOPE-0.1.md"
          ]
        }
      ]
    },
    "ws-request": {
      "header": "DEV/REV GUIDE — JOB 3 · WINDOW SEAT · PAGE 5 · YOUR CALL",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Decision covers the offered work and its exclusions. Do not quietly sell a finished seat."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "The complete budgetary estimate, what is still open, and your call.",
            "Only a fresh SUPPORTABLE answer can be accepted.",
            "ACCEPT creates the next event.",
            "ACCEPT does not move money, allocate material, release production or start a machine.",
            "DECLINE is a result too."
          ]
        },
        {
          "title": "SHARED TERMS FLOW",
          "items": [
            "One shared 13-event terms flow, hash-linked.",
            "No Window Seat commerce of its own."
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "The shared flow’s chain verifies. Tests: window-seat-journey.test.mjs, trail-terms.test.mjs."
          ]
        },
        {
          "title": "STATED ONLY",
          "items": [
            "Commerce is simulated. No money moves."
          ]
        }
      ]
    },
    "ws-yard": {
      "header": "DEV/REV GUIDE — JOB 3 · WINDOW SEAT · PAGE 6 · WE CUT IT",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Follow the evaluated part plan. Preserve module, part, parent board and revision identity."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "The cut plan is the Store’s, board by board.",
            "The yard run is simulated.",
            "Allocation ≠ release ≠ Cycle Start.",
            "Cycle Start belongs to the person at the cell."
          ]
        },
        {
          "title": "STATED ONLY",
          "items": [
            "The yard is simulated.",
            "Cycle Start stays with the person at the cell."
          ]
        }
      ]
    },
    "ws-record": {
      "header": "DEV/REV GUIDE — JOB 3 · WINDOW SEAT · PAGE 7 · PICK UP & BUILD",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Record the parts handed over and the work still left. Handoff does not prove assembly or load capacity."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "Defined cut/mill/spot parts, their record, and each parent board. Not a complete engineered assembly.",
            "Staged ≠ picked up.",
            "Custody closes the handoff.",
            "The record appends. It is never rewritten.",
            "How it goes together on site stays DEFERRED, to you or a qualified person."
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "The 13 events stay separate and hash-linked. Tests: window-seat-journey.test.mjs, trail-terms.test.mjs."
          ]
        }
      ]
    },
    "ws-audit": {
      "header": "DEV/REV GUIDE — JOB 3 · WINDOW SEAT · AUDIT COPY",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Same job, read as an audit. Each claim must land on its actual requirement, answer or event."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "The whole job as plain text you can copy.",
            "Only in the long scroll.",
            "Same state as the regular path. Nothing is recomputed for the copy.",
            "Opened outside the published site, a copy cannot reach the live Store. It fails closed."
          ]
        },
        {
          "title": "WHAT IT CARRIES",
          "items": [
            "The identified definition · the request exactly as sent · the Store answer and its identities · the terms events · how to check it yourself."
          ]
        },
        {
          "title": "AUDIT QUESTION",
          "items": [
            "What definition was sent?",
            "What did the Store receive?",
            "What did it answer, and why?",
            "Under which pins?",
            "What changed afterward?",
            "Did anyone rewrite the job?"
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "It carries the full definition, the request as sent, and the answer with its identities. Tests: window-seat.test.mjs, window-seat-journey.test.mjs.",
            "The same audit copy from either route. Test: window-seat-journey.test.mjs."
          ]
        },
        {
          "title": "STATED ONLY",
          "items": [
            "Reproducing the result hash from the copy alone was checked by hand once. Without the exact specimen identity, do not cite it as reproducible proof."
          ]
        }
      ]
    }
  };
  // Job 4 (Outdoor build) rails: one per page of stb-outdoor-picnic-0.4.html, rendered inside that page.
  const JOB4={
    "od-plan": {
      "header": "DEV/REV GUIDE — JOB 4 · OUTDOOR BUILD · PAGE 1 · PICK A PLAN",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Outdoor build: published plan → bounded requirements. Keep hand interpretation separate from source facts."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "This app turns bounded plan requirements into Store-evaluable demand and modeled work.",
            "A plan may carry parts, features, joints and constraints. This tile uses a bounded reading of two plans.",
            "Picking a plan is your intent. This job’s configurator is made from it.",
            "The photos are context. Nobody cuts to a photo.",
            "The plan’s source stays attached."
          ]
        },
        {
          "title": "WHERE THIS APP STARTS",
          "items": [
            "It starts at a defined plan.",
            "Both plans here were read by a person and entered by hand, then checked against the published pages.",
            "Source interpretation comes first. Bounded CAM can then be generated from controlling requirements plus declared machine rules; reading a plan alone is not CAM.",
            "Hand this app a defined plan, and the job starts here."
          ]
        },
        {
          "title": "THE FROM PRICE",
          "items": [
            "A live Store answer for the plan as published: 6 ft, the cheapest wood the Store has, your own hardware.",
            "Not cached. If the Store cannot answer, the card says so."
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "Two plan cards, photos named as photos, each From price answered by the Store. Test: outdoor-picnic.test.mjs.",
            "The page’s plan values equal picnic-rule.mjs. Test: outdoor-picnic-rule-sync.test.mjs."
          ]
        },
        {
          "title": "CURRENT GAP",
          "items": [
            "The A-frame plan’s source is not yet in the rule book’s authority register.",
            "Wood defaults and the benches plan’s hardware counts are this project’s reading, not the plans’."
          ]
        },
        {
          "title": "PLUMBING",
          "items": [
            "Preserve the working artifact.",
            "Guide text comes from the shared guide file. One guide, not two.",
            "Parent routes. Child owns the bounded definition.",
            "postMessage is a contract. Origin, schema, correlation.",
            "Known wart. Two DOMs, focus and history seams, browser-held state."
          ],
          "quiet": true
        }
      ]
    },
    "od-bench": {
      "header": "DEV/REV GUIDE — JOB 4 · OUTDOOR BUILD · PAGE 2 · THE BENCH",
      "flag": "Intent makes the knobs. The bench only turns them. Store answers Store questions.",
      "bullets": [
        "Plan requirements become named parts and features. Missing facts do not become defaults."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "This page is always the bench. Do not rename it configurator.",
            "The plan as published: resize it, pick the wood and hardware, get the Store’s price. Kept compact on purpose: the quick road stays quick.",
            "The bench turns the knobs made from the plan. It never adds one.",
            "Nothing is added to the plan here: no holes, no extra cuts."
          ]
        },
        {
          "title": "THE CONFIGURATOR FOR THIS JOB",
          "items": [
            "Made from the plan you pick. No universal configurator.",
            "Every plan gets: size · wood · hardware pack · spot holes for each kind of board · a decorative cut for each kind of square-cut board.",
            "Boards with the plan’s own angle get no decorative-cut knob. The plan’s angles are the plan’s.",
            "This page turns size, wood and hardware. The rest are turned on the bigger bench."
          ]
        },
        {
          "title": "WHAT RESIZING CHANGES",
          "items": [
            "Only the slats follow the table length.",
            "Every other part and every angle stays as the plan gives it.",
            "60 to 216 in, to the inch, inside the plan rule.",
            "The A-frame’s 25° legs and cross supports never change."
          ]
        },
        {
          "title": "THE STORE ANSWERS ON THIS PAGE",
          "items": [
            "Trail step 3 lives here: the Store’s live total for this exact version.",
            "Every price is a live Store answer. None is cached.",
            "Change anything, and the Store is asked again.",
            "Hardware travels as requirements. The Store picks the item and the number of boxes. Bring your own sends none."
          ]
        },
        {
          "title": "NOTES THE PAGE LEAVES TO THE RAIL",
          "items": [
            "Neither plan names a species or treatment. This project starts each plan on one wood; the Store prices every choice.",
            "The A-frame plan lists 100 2½ in exterior screws, with no gauge. The benches plan names 2½ in and 4½ in screws and 5 in carriage bolts, with no totals. The packs ask the Store for #10; counts are this project’s reading.",
            "The size range is the plan rule’s, not a strength rule. The Store says if a size can’t be cut.",
            "Legs and cross supports: both ends 25° off square, ends parallel, measured long point to short point, as the plan publishes. The Store is sent the 25°; the plan’s wording travels with the job.",
            "One small button, “Bring this to a bigger bench for more work”, leads to the deeper page. Fast readers can pass it by."
          ]
        },
        {
          "title": "THE STORE",
          "items": [
            "Store owns capability, time, economics, and retained-control truth.",
            "Store Zero is a declared reference lumberyard. Not live inventory. Not a dealer commitment. Not a quote.",
            "The Store budgetary answer is the whole Store result.",
            "The complete budgetary estimate is the number inside it, only when every line is supportable.",
            "Missing required component → no complete budgetary estimate."
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "This page adds no work: no holes, no extra cuts. Only the plan is sent. Test: outdoor-picnic.test.mjs.",
            "The 25° never changes, and no other part is angled. Test: outdoor-picnic-rule-sync.test.mjs.",
            "Sizes stay inside the plan rule, to the inch. Tests: outdoor-picnic-rule-sync.test.mjs, outdoor-picnic.test.mjs.",
            "No Store item numbers, prices, stock or angle limit in the page; no automatic holes. Test: outdoor-picnic-rule-sync.test.mjs.",
            "Every change is a new exact request with a new version. Tests: outdoor-picnic.test.mjs, trail-stale-version.test.mjs.",
            "Past the envelope, the Store refuses and steps 4–6 stay inert (216 in). Test: trail-terms.test.mjs."
          ]
        },
        {
          "title": "PLUMBING",
          "items": [
            "Preserve the working artifact.",
            "Guide text comes from the shared guide file. One guide, not two.",
            "Parent routes. Child owns the bounded definition.",
            "postMessage is a contract. Origin, schema, correlation.",
            "Known wart. Two DOMs, focus and history seams, browser-held state."
          ],
          "quiet": true
        }
      ]
    },
    "od-edge": {
      "header": "DEV/REV GUIDE — JOB 4 · OUTDOOR BUILD · PAGE 3 · A BIGGER BENCH",
      "flag": "Intent makes the knobs. The bench only turns them. Store answers Store questions.",
      "bullets": [
        "Extra work needs explicit feature facts and a Store answer. A bigger bench does not enlarge capability."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "Say where the app stops.",
            "A bigger bench, for more work: holes and decorative cuts. Here the reader meets the disclaimers and the limits.",
            "The knobs here were made from the plan, one per kind of board. The bench turns them on. It never adds one.",
            "Each thing tried gets one answer: the Store can do it · waiting on a detail from you · past the edge.",
            "Past the edge is a result, not an error. It comes with the Store’s reason, and who could move the edge.",
            "“← Back to the plan as is” drops the work. The Store answers the plan again, the same version as before.",
            "“Send it with this work” opens only when everything tried is inside the edge."
          ]
        },
        {
          "title": "THE TWO CLEAR UNCERTAINTIES",
          "items": [
            "Hole locations. Published plans aren’t detailed enough to drill from. Any spot is yours, never the plan’s. That may change, or come from other software that produces a valid definition.",
            "Decorative cuts. The Store decides which angles its cell cuts. The page holds no copy of that limit."
          ]
        },
        {
          "title": "INFORMATION TRAVELS BEFORE ATOMS",
          "items": [
            "Name the missing thing: a requirement, a declared service, or supported capability. Not every gap is information.",
            "Publish hole centers upstream; declare capability at its owner. An expanded edge still needs implementation and evidence.",
            "No hidden redesign. Defined intent becomes identified manufacturing demand; physical execution is still gated."
          ]
        },
        {
          "title": "THE EDGE TODAY, AND WHO COULD MOVE IT",
          "items": [
            "Getting to a defined plan: design and CAD/CAM tools, and plan publishers.",
            "Hole locations: the plan’s author, or other software that produces a valid definition.",
            "Hole size and depth: the plan or the hardware maker.",
            "A different angle on each end, compound cuts, clipped corners: the Store and its machine.",
            "Angles past the envelope: the Store.",
            "Strength and engineering: a qualified person.",
            "Hardware suitability: the hardware maker, for the wood and weather."
          ]
        },
        {
          "title": "THE STORE",
          "items": [
            "Store owns capability, time, economics, and retained-control truth.",
            "Store Zero is a declared reference lumberyard. Not live inventory. Not a dealer commitment. Not a quote.",
            "The Store budgetary answer is the whole Store result.",
            "The complete budgetary estimate is the number inside it, only when every line is supportable.",
            "Missing required component → no complete budgetary estimate."
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "The page shows exactly the knobs made from the plan; no decorative cut on the plan’s 25° boards. Test: outdoor-picnic.test.mjs.",
            "No hole is drawn or sent until you place it. Test: outdoor-picnic.test.mjs.",
            "Back to the plan as is: the work is dropped and the same plan is asked again. Test: outdoor-picnic.test.mjs.",
            "The limits list and “Information travels before atoms” are on the page. Test: outdoor-picnic.test.mjs."
          ]
        },
        {
          "title": "HISTORICAL HAND CHECK · NOT A CURRENT PASS",
          "items": [
            "Historical hand check: spot holes and a 45° cut on the under-seat supports were supportable. Exact specimen identity is not recorded here; not current proof.",
            "A 50° cut on 85 in tabletop boards is refused, with three Store reasons: MITER_ANGLE_OUTSIDE_D001_STAGE2_ENVELOPE, ANGLED_PART_LEAVES_LESS_THAN_CONTROL_LENGTH, PART_NOT_HALF_INCH_UNDER_BOARD."
          ]
        },
        {
          "title": "CURRENT GAP",
          "items": [
            "One angle per set of boards, both ends, one plane.",
            "Whether an angle is measured to the long point or the short point is not defined. The Store answers the number it is sent.",
            "Finished fastener-hole diameter and depth are not defined here. Store spot tooling and depth are defined; a spot is not the finished hole."
          ]
        },
        {
          "title": "AUTHORITY LINKS",
          "items": [
            "Store Zero: https://github.com/GeorgePlattDemo/scan-to-build-store/blob/main/README.md",
            "D-001 envelope, file 0.1, version string D001-STAGE2-ENVELOPE-0.3: https://github.com/GeorgePlattDemo/scan-to-build-store/blob/9c62d9d6f7775deef83d47196d32c9b5174a352c/D-001-STAGE2-ENVELOPE-0.1.md"
          ]
        },
        {
          "title": "PLUMBING",
          "items": [
            "Preserve the working artifact.",
            "Guide text comes from the shared guide file. One guide, not two.",
            "Parent routes. Child owns the bounded definition."
          ],
          "quiet": true
        }
      ]
    },
    "od-call": {
      "header": "DEV/REV GUIDE — JOB 4 · OUTDOOR BUILD · PAGE 4 · YOUR CALL",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Choose this offered scope, with omissions visible. Accept and decline both leave a record."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "The complete budgetary estimate, and your call.",
            "Only a fresh SUPPORTABLE answer can be accepted.",
            "ACCEPT creates the next event.",
            "ACCEPT does not move money, allocate material, release production or start a machine.",
            "DECLINE is a result too."
          ]
        },
        {
          "title": "SHARED TERMS FLOW",
          "items": [
            "One shared 13-event terms flow, hash-linked.",
            "No Outdoor commerce of its own."
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "The shared flow runs through custody. Tests: outdoor-picnic.test.mjs, trail-terms.test.mjs."
          ]
        },
        {
          "title": "STATED ONLY",
          "items": [
            "Commerce is simulated. No money moves."
          ]
        }
      ]
    },
    "od-yard": {
      "header": "DEV/REV GUIDE — JOB 4 · OUTDOOR BUILD · PAGE 5 · WE CUT IT",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Each modeled cut or spot traces to a named requirement and the exact Store answer."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "The cut plan is the Store’s, board by board.",
            "The yard run is simulated.",
            "Allocation ≠ release ≠ Cycle Start.",
            "Cycle Start belongs to the person at the cell."
          ]
        },
        {
          "title": "STATED ONLY",
          "items": [
            "The yard is simulated.",
            "Cycle Start stays with the person at the cell."
          ]
        }
      ]
    },
    "od-record": {
      "header": "DEV/REV GUIDE — JOB 4 · OUTDOOR BUILD · PAGE 6 · PICK UP & BUILD",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Record cut parts, remnants and remaining work. No implied complete table or verified assembly."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "Your project: the record, every part and its board. Parts to get you closer, not a finished package.",
            "Staged ≠ picked up.",
            "Custody closes the handoff.",
            "The record appends. It is never rewritten."
          ]
        },
        {
          "title": "STILL NOT EVALUATED",
          "items": [
            "Strength, engineering and hardware suitability.",
            "Finish and assembly are left to you."
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "The 13 events stay separate and hash-linked. Tests: outdoor-picnic.test.mjs, trail-terms.test.mjs."
          ]
        }
      ]
    }
  };
  // Job 5 (Playhouse) rails: one per Playhouse page in the shell.
  const JOB5={
    "ph-idea": {
      "header": "DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 1 · INTENT",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Sheet path: opening, center split, tabs and returned remnants are distinct requirements."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "The sheet is the input. The outcome is the parts.",
            "User 1 wants an arched opening in a playhouse wall, the center kept for shutters, and every remnant returned.",
            "This page keeps the human reason. It creates no machine motion.",
            "Intent defines the features: the opening, a center split, two straight cuts, keep the center on tabs, return the rest.",
            "Those features make this job’s knobs. The bench only turns them."
          ]
        },
        {
          "title": "WHY SHEET WORK IS HERE",
          "items": [
            "A second material stream, on the same trail and the same rules.",
            "Kept small on purpose: enough to start the conversation.",
            "Later integration may use existing sheet machines. Compatible interfaces, tooling and capability need their own evidence; interchangeable heads are not proved here."
          ]
        },
        {
          "title": "LEFT TO USER 1",
          "items": [
            "Hinges and hardware: not in this order.",
            "Trimming the retained tabs: User 1, after pickup."
          ]
        },
        {
          "title": "PLUMBING",
          "items": [
            "Preserve the working artifact.",
            "Parent routes. Child owns the bounded definition."
          ],
          "quiet": true
        }
      ]
    },
    "ph-bench": {
      "header": "DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 2 · THE BENCH",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Sheet features become identified operations. Keep retained outputs in the demand, not just the picture."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "This page is always the bench. Do not rename it configurator.",
            "Keep the story and source attached. Only controlling material, geometry and operations drive the Store ask.",
            "Three knobs, made from User 1’s intent: opening width, straight side height, arch rise.",
            "Reset returns to User 1’s 36 / 24 / 12.",
            "The bench turns the knobs. It never adds one.",
            "Every turn is a new version. The Store is asked again."
          ]
        },
        {
          "title": "WHAT THE BENCH PRODUCES",
          "items": [
            "One sheet definition: 48 × 96 in, ½ in plywood.",
            "Four operations: route the arched opening, route the center split, and two straight cuts 18 in from each end.",
            "The center retained by tabs. Every remnant returned."
          ]
        },
        {
          "title": "THE STORE DECIDES",
          "items": [
            "The drawing shows the Store’s current routed field. The page does not decide fit.",
            "An opening past the working field comes back REFUSED, with the Store’s reason.",
            "An arch too tall for its width comes back REFUSED. The page does not correct it."
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "A changed opening is a new calculation; returning to it asks fresh again. Test: playhouse-live-store.test.mjs.",
            "Past the working field: REFUSED with its reason, steps 4–6 closed. Test: playhouse-live-store.test.mjs.",
            "Too tall for its width: REFUSED; the page does not correct it. Test: playhouse-live-store.test.mjs.",
            "An accepted version cannot authorize a changed one. Test: trail-stale-version.test.mjs."
          ]
        },
        {
          "title": "PLUMBING",
          "items": [
            "Preserve the working artifact.",
            "Parent routes. Child owns the bounded definition.",
            "The shell holds the live Store answer and the shared terms flow for Playhouse.",
            "Known wart. Injected pages in the shell, not their own file yet."
          ],
          "quiet": true
        }
      ]
    },
    "ph-store": {
      "header": "DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 3 · STORE ANSWER",
      "flag": "Intent makes the knobs. The bench only turns them. Store answers Store questions.",
      "bullets": [
        "Different material and operations; same authority sequence. Store answers S-001 demand."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "One fresh Store answer to this exact version, on its own request type: SHEET_PACKAGE_V1.",
            "Viewing it creates no event.",
            "The Store answers the job. It does not redefine the job."
          ]
        },
        {
          "title": "THE STORE’S ANSWER TODAY",
          "items": [
            "Historical checked 36 / 24 / 12 specimen: SUPPORTABLE and complete under the cited Store evaluation. Live status comes from the fresh answer.",
            "Every operation answered: arched opening, center split, both straight cuts.",
            "No refused or unresolved Store lines in that specimen. Physical prerequisites remain unproved.",
            "The opening sits inside the S-001 work field (envelope S001-STAGE2-ENVELOPE-0.1).",
            "Routing on the S-001 router; straight cuts on the yard panel saw."
          ]
        },
        {
          "title": "WHAT THE ANSWER DOES NOT CLAIM",
          "items": [
            "The tab plan is a reference plan. Physical retention is not measured.",
            "Machine time is the declared Stage-2 model, not measured.",
            "Stock is fixture-declared, not live inventory."
          ]
        },
        {
          "title": "THE STORE",
          "items": [
            "Store owns capability, time, economics, and retained-control truth.",
            "Store Zero is a declared reference lumberyard. Not live inventory. Not a dealer commitment. Not a quote.",
            "The Store budgetary answer is the whole Store result.",
            "The complete budgetary estimate is the number inside it, only when every line is supportable.",
            "Missing required component → no complete budgetary estimate."
          ]
        },
        {
          "title": "FIRST THREE IDENTITIES",
          "items": [
            "SENT · ARRIVED · ANSWERED.",
            "Three event roles. Keep their evidence separate; digests need not be unequal."
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "Playhouse asks the live Store for its own definition and shows that fresh answer. Test: playhouse-live-store.test.mjs.",
            "It will not show an answer meant for another project or another version. Test: playhouse-live-store.test.mjs.",
            "A Store that cannot answer leaves no answer and closed steps, never a reference answer. Test: playhouse-live-store.test.mjs."
          ]
        },
        {
          "title": "HISTORICAL HAND CHECK · NOT A CURRENT PASS",
          "items": [
            "Historical 36 / 24 / 12 hand check at Store 9c62d9d6f7775deef83d47196d32c9b5174a352c: SUPPORTABLE, four operations, Q $65.04. Full request/answer identity is not supplied here; use the live answer for current decisions."
          ]
        },
        {
          "title": "AUTHORITY LINKS",
          "items": [
            "Store Zero: https://github.com/GeorgePlattDemo/scan-to-build-store/blob/main/README.md",
            "S-001 envelope: https://github.com/GeorgePlattDemo/scan-to-build-store/blob/9c62d9d6f7775deef83d47196d32c9b5174a352c/S-001-STAGE2-ENVELOPE-0.1.md"
          ]
        }
      ]
    },
    "ph-review": {
      "header": "DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 4 · REVIEW",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Keep this sheet revision and its requested scope. Confirmation is not commercial acceptance."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "Freeze the whole ask: every requested operation, supported or not.",
            "Confirming keeps the definition. It is not payment, reservation, release, readiness or execution.",
            "This UI opens Confirm only after SUPPORTABLE for this version. Keeping a definition is distinct from accepting an offer.",
            "Nothing unresolved is turned into capability."
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "Confirm stays closed until the Store answers SUPPORTABLE for this version. Test: playhouse-live-store.test.mjs."
          ]
        }
      ]
    },
    "ph-call": {
      "header": "DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 5 · YOUR CALL",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Choose the exact sheet offer. Retained center and remnants stay in scope."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "Your call on exactly this version: accept and send it, or decline.",
            "ACCEPT creates the next event. It does not move money, allocate material, release production or start a machine.",
            "Request ≠ order.",
            "DECLINE is a result too."
          ]
        },
        {
          "title": "SHARED TERMS FLOW",
          "items": [
            "One shared 13-event terms flow, hash-linked.",
            "No Playhouse commerce of its own."
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "Fresh answer → simulated offer → accept & send → yard → pickup → receipt. Test: trail-terms.test.mjs.",
            "Declining ends the chain at your call. Test: trail-terms.test.mjs.",
            "An invalid choice is declined with its reason; steps 4–6 stay inert. Test: trail-terms.test.mjs."
          ]
        },
        {
          "title": "STATED ONLY",
          "items": [
            "Commerce is simulated. No money moves."
          ]
        }
      ]
    },
    "ph-yard": {
      "header": "DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 6 · WE CUT IT",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Model the evaluated sheet work. Tabs in a plan are not measured physical retention."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "The yard works from the Store answer for this exact version.",
            "Only an accepted, SUPPORTABLE answer reaches the yard.",
            "The yard is simulated. No machine runs.",
            "Allocation ≠ release ≠ Cycle Start.",
            "Cycle Start belongs to the person at the cell."
          ]
        },
        {
          "title": "STATED ONLY",
          "items": [
            "This page emits no released machine program. Candidate controller work can precede commissioning; physical use needs local release and validation."
          ]
        }
      ]
    },
    "ph-terms": {
      "header": "DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 7 · THE EVENTS",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Thirteen audit events inside six customer steps. This view adds no seventh step."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "Every event for this version, in order, each with its hash.",
            "Open events stay open until they happen.",
            "Missing events stay missing. Nothing is filled in by assumption.",
            "Events stay separate. A changed definition starts a new chain."
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "The shared chain verifies, hash by hash. Test: trail-terms.test.mjs."
          ]
        }
      ]
    },
    "ph-recap": {
      "header": "DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 8 · RECAP",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Summarize the sheet proof at its actual depth. Missing physical evidence stays missing."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "Read forward, it is the chronology. Read backward, it is the audit.",
            "Say what this proved: a sheet definition the Store can answer, carried through the shared trail.",
            "Physical status: not claimed, not authorized."
          ]
        },
        {
          "title": "NEXT PROOF",
          "items": [
            "Next digital evidence: identified path/controller artifacts and checks. Later physical evidence: commissioned retention, yield and inspection. Neither claimed here."
          ]
        }
      ]
    },
    "ph-record": {
      "header": "DEV/REV GUIDE — JOB 5 · PLAYHOUSE · PAGE 9 · PICK UP & BUILD",
      "flag": "Intent makes the knobs. The bench only turns them.",
      "bullets": [
        "Record required sheet outputs and simulated handoff. No complete playhouse or installed window implied."
      ],
      "sections": [
        {
          "title": "CORE RULE",
          "items": [
            "Only the facts this journey established.",
            "The record appends. It is never rewritten.",
            "Staged ≠ picked up. Custody closes the handoff.",
            "Center and every remnant are required returned outputs. This custody narrative is simulated."
          ]
        },
        {
          "title": "ENFORCED",
          "items": [
            "The record carries the Store pin of the answer it used. Test: playhouse-live-store.test.mjs."
          ]
        },
        {
          "title": "CURRENT GAP",
          "items": [
            "Physical execution: false. Simulated yard events only.",
            "Hardware: not in this order."
          ]
        }
      ]
    }
  };
  const asRail=r=>Object.freeze(Object.assign({},r,{rows:Object.freeze(r.bullets.map(b=>Object.freeze([b,'']))),later:Object.freeze([])}));
  const RAILS=Object.freeze({
    'job1-idea':asRail(JOB1['job1-idea']),
    'job1-bench':asRail(JOB1['job1-bench']),
    'job1-store':asRail(JOB1['job1-store']),
    'job1-intake':asRail({
      header:'DEV/REV GUIDE — JOB 1 · IDEA',
      flag:'Intake, not a step.',
      bullets:[
        'What User 1 brings lands here and ends at Intent.',
        'No step bar. The Idea line shows Intent as its one way on.',
        'Known values go to Intent. Nobody types them again.',
        'Source information carries forward. Store material is separately chosen on the bench; no timber custody claimed.'
      ],
      sections:[]
    }),
    'alcove-idea':asRail(JOB2['alcove-idea']),
    'alcove-bench':asRail(JOB2['alcove-bench']),
    'alcove-store':asRail(JOB2['alcove-store']),
    'ws-hero':asRail(JOB3['ws-hero']),
    'ws-intent':asRail(JOB3['ws-intent']),
    'ws-bench':asRail(JOB3['ws-bench']),
    'ws-store':asRail(JOB3['ws-store']),
    'ws-request':asRail(JOB3['ws-request']),
    'ws-yard':asRail(JOB3['ws-yard']),
    'ws-record':asRail(JOB3['ws-record']),
    'ws-audit':asRail(JOB3['ws-audit']),
    'od-plan':asRail(JOB4['od-plan']),
    'od-bench':asRail(JOB4['od-bench']),
    'od-edge':asRail(JOB4['od-edge']),
    'od-call':asRail(JOB4['od-call']),
    'od-yard':asRail(JOB4['od-yard']),
    'od-record':asRail(JOB4['od-record']),
    'ph-idea':asRail(JOB5['ph-idea']),
    'ph-bench':asRail(JOB5['ph-bench']),
    'ph-store':asRail(JOB5['ph-store']),
    'ph-review':asRail(JOB5['ph-review']),
    'ph-call':asRail(JOB5['ph-call']),
    'ph-yard':asRail(JOB5['ph-yard']),
    'ph-terms':asRail(JOB5['ph-terms']),
    'ph-recap':asRail(JOB5['ph-recap']),
    'ph-record':asRail(JOB5['ph-record'])
  });

  const PAGES=Object.freeze({
    landing:guide('Goal',[
      ['Say what this is','One screen, no scrolling to understand it. Put requirements and declared capability upstream of the demand.'],
      ['Show who does what','User defines. System keeps meaning. Store answers. Local release governs physical work.'],
      ['Make the seam visible','Carry confirmed requirements into modeled commands without redefining them. Physical conformance is not proved here.'],
      ['Offer three ways in','Same road after. Different opening.']
    ]),
    'new-user':guide('Orient once',[
      ['Keep it short','One pass, then into the work. No CAD/CAM skill required merely to state a bounded need.'],
      ['Don’t trap people','Back and skip still work.'],
      ['No hidden authority','Orientation changes no project fact.'],
      ['Play without an account','LATER explores the demo. Account/save choices are disabled; no authenticated purchase flow.'],
      ['Known copy gap','Main says “No returns.” No return policy is established here. Defined scope does not excuse nonconforming work.']
    ],[
      ['THIS DEVICE','Device-held project. No server custody implied.'],
      ['EMAIL / SIGN IN','Later · same project file, kept on a server.']
    ]),
    'my-projects':guide('Resume the identified job',[
      ['Version first','Show the saved revision and its actual last event. No generic done badge.'],
      ['History is history','Refresh Store facts for current demand; never reuse an old answer as current.'],
      ['Fork changes','Keep the source record. New work gets a new version.'],
      ['Known limit','Device/demo custody is not authenticated server tenancy.']
    ]),
    archive:guide('Read the handoff record',[
      ['Show what happened','Actual recorded events, including simulated status and missing events.'],
      ['Name the outputs','Parts, included work and exclusions. Avoid kit/furniture promises of completeness.'],
      ['No authority by reopening','Archived answers and releases are history. Current work needs current gates.'],
      ['Keep responsibilities visible','Custody does not prove site assembly or fitness. Clear scope does not excuse nonconforming work.']
    ]),
    returning:guide('Resume cleanly',[
      ['Don’t start over','Saved project stays saved.'],
      ['Refresh outside facts','Old Store answers are history.'],
      ['Fork changes','New work gets a new version.'],
      ['Still demo-only','Named users are not real auth.']
    ],[
      ['MY PROJECTS ON THIS DEVICE','Device-held history. Resume or fork an identified version.'],
      ['OPEN A SAVED PROJECT FILE','Imported history. Check the digest; never promote an old answer to current.']
    ]),
    saved:guide('Find the right record',[
      ['Show the version','Don’t flatten history into one card.'],
      ['Keep status useful','Last real event, not generic “done.”'],
      ['No fake account model','Demo records are not secure tenancy.']
    ]),
    professional:guide('Bring work in',[
      ['Import, don’t bless','A plan is evidence, not truth.'],
      ['Keep provenance','Know what came from where.'],
      ['Same gates','Professional brings defined work; the dealer does not redraw it. Store and machine limits still apply.']
    ],[
      ['BRING A DRAWING, PDF OR PHOTO','Configured later with contractor adapters.'],
      ['PASTE A CUT LIST','Configured later with contractor adapters.']
    ]),
    projects:guide('Library',[
      ['Don’t overcrowd','Live, bounded or deferred. Say which.'],
      ['Tiles = bounded demonstrations','Board-to-command · critical fit · assembly-to-parts · plan-to-demand · sheet with retained outputs.'],
      ['Start your own','First. Never moves.'],
      ['One project at a time','Switch tile → clear route + state.'],
      ['No cross-talk','Job 1 facts stay in Job 1.'],
      ['Same six steps','Every tile, every door. Scoreboard enforces.'],
      ['Opening ≠ owning','Read-only copy until Make changes / Save.'],
      ['Gap','Read-only copy: Playhouse only. Rest open live.'],
      ['Gap','Accounts are demo. User 1 only. No auth.'],
      ['Still patched','Legacy routes intercepted, not retired.'],
      ['Known gaps','Name the missing fact or skipped handoff, its owner and what stays blocked. A short rail can be complete.'],
      ['Name the actual scope','Prefer defined parts and included work over kit/furniture shorthand. No implied complete product; no universal configurator.']
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
    'alcove-idea':guide('Intake, not a step',[
      ['Where it lands','User 1’s scan and story land here and end at Intent.'],
      ['No step bar','The Idea line shows Intent as its one way on.'],
      ['Carry forward','Known values go to Intent. Nobody types them again.']
    ]),
    'alcove-capture':RAILS['alcove-idea'],
    'alcove-config':RAILS['alcove-bench'],
    'alcove-review':guide('Freeze the exact version',[
      ['Show what changed','A real build needs a proper revision diff.'],
      ['Confirm ≠ order','No payment or production authority here.'],
      ['Fork after edit','Never rewrite the confirmed version.']
    ]),
    store:RAILS['alcove-store'],
    request:guide('Scope the services',[
      ['Don’t redesign here','Geometry is already defined.'],
      ['Keep yes/no explicit','Declined work matters downstream.'],
      ['Request ≠ order','Name included and excluded work. No complete-product shorthand, hidden defaults or silent add-ons.']
    ]),
    yard:guide('Return facts, not surprises',[
      ['No silent substitution','Work follows the identified requirements. Changes come back as changes.'],
      ['Keep reasons','Shortage ≠ preference.'],
      ['Response binds to request','No floating Yard answer.'],
      ['Still modeled','No real staff queue or inventory custody.']
    ]),
    terms:guide('Keep the verbs apart',[
      ['Offer ≠ accept','Accept ≠ pay. Pay ≠ allocate.'],
      ['Scroll does nothing','Audit view inside the six steps. Viewing never creates an event.'],
      ['No machine leap','Commerce cannot create Cycle Start.']
    ]),
    recap:guide('Summarize, don’t backfill',[
      ['Read the record','Do not create state here.'],
      ['Keep gaps visible','Missing stays missing.'],
      ['Link the receipts','Summary is not the audit trail.']
    ]),
    record:guide('Close with evidence',[
      ['Keep the chain','Definition → Store → simulated fulfillment → custody. Record parts and included work; no implied finished product.'],
      ['No rewrite','Corrections append; history stays.'],
      ['Still not durable','This surface needs verified attribution, durable retention and recovery. A signature alone does not establish custody.']
    ]),
    'start-own-live':RAILS['job1-bench'],
    'outdoor-idea':guide('Intake, not a step',[
      ['Where it lands','The two published plans land here and end at Intent.'],
      ['No step bar','The Idea line shows Intent as its one way on.'],
      ['Carry forward','Known values go to Intent. Nobody types them again.']
    ]),
    'outdoor-plan':RAILS['od-plan'],
    'outdoor-bench':RAILS['od-bench'],
    'outdoor-edge':RAILS['od-edge'],
    'outdoor-call':RAILS['od-call'],
    'outdoor-yard':RAILS['od-yard'],
    'outdoor-record':RAILS['od-record'],
    'outdoor-build-live':guide('Keep Outdoor its own job',[
      ['Plan-to-demand','Own plan-derived requirements, own Store handoff. Do not borrow Job 1 facts.'],
      ['Keep source trail','Plan/source stays attached.'],
      ['Fail closed','Missing Store coverage stays missing.'],
      ['Known wart','Still iframe-hosted.']
    ]),
    'window-seat-hero':RAILS['ws-hero'],
    'window-seat-intent':RAILS['ws-intent'],
    'window-seat-bench':RAILS['ws-bench'],
    'window-seat-store':RAILS['ws-store'],
    'window-seat-request':RAILS['ws-request'],
    'window-seat-yard':RAILS['ws-yard'],
    'window-seat-record':RAILS['ws-record'],
    'window-seat-audit':RAILS['ws-audit'],
    'window-seat-live':guide('One job, two views',[
      ['Assembly-to-parts','Six steps, live Store. Parts and features stay traceable to the assembly requirements.'],
      ['Whole job = audit view','Same state, every step shown.'],
      ['Fork on Idea','Intent | One full scroll. Same job, same gates.'],
      ['Edge mill','Permitted depth becomes part demand. Store evaluates milling and may refuse.'],
      ['Known wart','Iframe complicates focus, print, routing.']
    ]),
    'proof-store':RAILS['job1-store'],
    'proof-accept':guide('Two customer choices',[
      ['Accept or decline','Simulated decision on this exact offered scope.'],
      ['Separate the receipts','Offer · decision · simulated payment stay separate. No purchase by viewing.'],
      ['Make it idempotent','Double-click/retry must not duplicate decision or simulated payment events. Live charging is not implemented.'],
      ['Still simulated','No PSP, webhook, refund, tax, settlement.']
    ]),
    'proof-yard':guide('Show the whole middle',[
      ['One long scroll','No internal Yard buttons.'],
      ['Scroll is inert','Events come from the explicit simulation.'],
      ['READY ≠ custody','Handoff closes it.'],
      ['No magic controller','Project 1 preserves reference commands and uncompiled controller source. This page does not emit a released program or run a commissioned cell.'],
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
      ['Still browser-held','This browser-held surface is not durable owner custody. Attribution, retention and recovery need separate proof.']
    ]),
    'playhouse-idea':guide('Intake, not a step',[
      ['Where it lands','User 1’s picture and story land here and end at Intent.'],
      ['No step bar','The Idea line shows Intent as its one way on.'],
      ['Carry forward','Known values go to Intent. Nobody types them again.']
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
    'alcove-store-order-surface':guide('Store seam',[
      ['Store facts only','No customer geometry rewrite.'],
      ['Bind to the request','No floating answer.'],
      ['Recovery wart','Injected surface; consolidate only after parity.']
    ]),
    'alcove-store-service-choices':guide('Service scope',[
      ['Yes/no/unavailable differ','Keep all three.'],
      ['No hidden defaults','Selected work must be explicit.'],
      ['Store decides its offer','Each Store declares its stock, supported operations, services and economics. The future term sheet is not implemented.']
    ]),
    'alcove-store-yard-answer':guide('Yard answer',[
      ['Reason changes','No silent substitution.'],
      ['Bind to request','Same job, same version.'],
      ['Recovery wart','Injected surface, not final component architecture.']
    ]),
    'alcove-store-commercial-sequence':guide('Keep events separate',[
      ['No scroll events','Viewing changes nothing.'],
      ['Commerce ≠ machine','Never jump authority layers.'],
      ['Still reference-only','Live service adapters are not implemented. Each Store must answer from its own declared services.']
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
