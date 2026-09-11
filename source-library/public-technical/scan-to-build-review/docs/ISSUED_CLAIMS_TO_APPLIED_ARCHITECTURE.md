# From Issued Claims to Applied Architecture

**A plain-language walkthrough of U.S. Patent Nos. 9,720,401 and 10,768,609 — and where the governed operating layer begins.**

**Document:** `docs/ISSUED_CLAIMS_TO_APPLIED_ARCHITECTURE.md`  
**Status:** Public technology demonstration · claims walkthrough · review artifact  
**Posture:** Not legal advice · not patent advice · no claim construction. Editorial labels are supplied for navigation and are not official claim titles or legal characterizations.  
**Read with:** [Machine Function & Kinematic Ontology](./MACHINE_FUNCTION_KINEMATIC_ONTOLOGY.md) ·
[Operational Roadmap](./OPERATIONAL_ROADMAP.md) ·
[Institutional Study Layer](./INSTITUTIONAL_STUDY_LAYER.md) ·
[Future Research & IP Review Areas](./FUTURE_RESEARCH_AND_IP_REVIEW_AREAS.md)

> The issued patent specifications, not this summary, remain the authoritative
> description of the patented machinery and methods. Where a claim is said to "cover" or
> "address" something below, that describes its plain subject matter for orientation,
> not its legal scope. The full review posture is collected under Review boundaries, below.

## Purpose and scope

The rest of this package runs in one direction: from the homeowner's intent forward,
through the owner-held record, the WorkPacket, the MachineEnvelope, and the bounded
fabrication cell. The two issued patents are cited throughout as the issued foundation for that chain. What has been missing is the walk in the other direction — starting from the issued
claim language of 2013–2020 and showing how the present architecture maps onto that
operating chain.

Two questions get answered here. First, what exactly was issued: the structure of the 33
claims, what each independent claim assembles, and what each dependent claim adds.
Second, how the present architecture relates to that foundation. The controlling relationship: **the present package maps onto
the issued consumer-to-fabrication chain, translates that chain into current operating
language, and adds a governance layer that the issued claims do not themselves recite.**
The claims and the package overlap substantially. They are not the same thing, and the
places where the package goes beyond the claims — custody, consent, refusal
preservation, material enforcement, versioned evidence, outcome return, export — are
marked as additions wherever they appear.

## Structure of the issued claims

Two U.S. patents issued to George Platt, both titled *Method and System for Consumer
Home Projects Ordering and Fabrication*, both prosecuted from a single priority
application filed December 2, 2013 (Ser. No. 14/094,074):

- **U.S. 9,720,401 B2** — issued August 1, 2017. 18 claims.
- **U.S. 10,768,609 B2** — issued September 8, 2020, as a continuation of the 2013
  application. 15 claims.

**33 issued claims in total**, organized as three claim trees growing from one
disclosure:

| Tree | Claims | Root |
|---|---|---|
| Integrated **system** | '401, claims 1–9 | Claim 1 (independent) |
| Integrated **method** | '401, claims 10–18 | Claim 10 (independent) |
| Continued, further-defined **method** | '609, claims 1–15 | Claim 1 (independent) |

Three independent claims, thirty dependent claims. The claim structure is:

- one independent claim expressly claims an *integrated system* ('401 claim 1);
- two independent claims expressly claim *methods* ('401 claim 10; '609 claim 1);
- two dependent claims expressly recite *machine-readable instructions tangibly
  embodied on a non-transitory storage medium* ('401 claim 17; '609 claim 11);
- and the hardware — the tandem machines, guide rails, yoke assemblies, servo
  actuators, sawing stations — appears as limitations *inside* the system and method
  claims rather than as freestanding apparatus claims.

The family is best understood as an integrated system-and-method claim family whose
limitations span software, commercial workflow, human operation, and physical
machinery. That span is what the present architecture makes explicit and
browser-models.

Collectively the claims address: the consumer interface; database and CAD interaction;
processor-calculated pricing and recalculation; order acceptance; material-list
determination; machining-instruction generation and transmission; tandem sheet and
dimensional-stock processing; machine structure and servo control; operator loading,
tooling changes, and displayed instructions; labeling; assembly instructions; finishing
and secondary operations; additional non-fabricated components; complete-project
packaging and local pickup; and the software embodiment. The dependent-claim groups section organizes the thirty dependent claims by function; Appendix A registers all 33 individually.

## Patent-to-architecture crosswalk

The patents were drafted in 2013 retail-computing vocabulary: *user input terminal,
retailer's computer, tool controller computer, tandem machine, special order merchant.*
The package speaks in current governance vocabulary: *intent capture, owner-held
record, WorkPacket, MachineEnvelope, refusal, Special Order Supplier, cell steward.*
The table below maps one to the other and marks the status of each element. Rows marked **Present-layer addition** are additions of the current architecture, not issued claim limitations.

| Issued basis | Plain function | Present-package expression | Status |
|---|---|---|---|
| Interface receiving customer interactions, inquiries, design choices ('401 cl. 1, 10; '609 cl. 1, 9) | Project intent enters the system | Intent capture; user-initiated spatial capture and constraint definition (demo Step 1) | Issued claim · browser-modeled |
| Database of previously-designed projects ('401 cl. 1, 10; '609 cl. 1) | Template library of buildable projects | Bounded project classes; SKU-linked template library | Issued claim · browser-modeled |
| CAD module; spec: rules "steering the user towards technically feasible product solutions" | Guided design inside feasibility limits | Constraint resolution inside a bounded rule set (demo Step 2) | Issued claim (module) · specification disclosure (rules) · browser-modeled |
| Spec feasibility check before order (the 30-foot-shelf example) | Reject infeasible definitions before commitment | Manufacturability gate; formal validation and refusal with preserved reasons | Specification disclosure · browser-modeled; refusal preservation is a present-layer addition |
| Processor-calculated **estimated price**, output through the interface; recalculation on variation; store-local pricing database ('401 cl. 10, 11, 18; '609 cl. 1, 3, 12) | Price computed by the system, recomputed when the project changes, from local store data | SKU-linked pricing that re-resolves on every parameter change; the architecture's further goal of confirmation-grade, inventory-validated pricing | Issued claim (estimated price, recalculation, store-local basis) · browser-modeled; inventory validation is a present-layer addition |
| Order acceptance → material list + machining instructions ('401 cl. 12; '609 cl. 4) | Confirmation produces the build definition | WorkPacket resolution at confirmation | Issued claim · browser-modeled |
| Instructions generated by the CAD/CAM portion and transmitted to the tandem machine ('401 cl. 10, 13; '609 cl. 8, 14) | The CAD/CAM portion generates and transmits the machine instructions; the cell operator executes from those commands rather than creating per-job CAM at the cell | Manufacturing Execution Packet; controller stream emitted by the definition layer (demo Step 4) | Issued claim · browser-modeled |
| Tandem machine: first machine for sheet stock including curvilinear shapes, second for dimensional stock with fore/aft either-end operations ('401 cl. 1; '609 cl. 1) | Two coordinated machines cover both material streams | Bounded dual-stream fabrication cell (demo Step 5; Kinematic Ontology §5–6) | Issued claim · browser-modeled · physically untested |
| Operator loads raw materials and changes tooling heads per generated commands; per-component instructions displayed, identifying which stock stream to load ('401 cl. 10; '609 cl. 5, 8, 15) | Instruction-directed loading, tooling, and supervisory role | Cell steward; bounded execution role in the workforce role map | Issued claim · browser-modeled |
| Identification label per component; assembly instructions keyed to labels ('401 cl. 9, 14; '609 cl. 6) | Every part identified; assembly follows the labels | Labeled assembly. The relationship-only rule ("A1 connects to A2," no field dimensions) is the package's extension of this foundation | Issued claim (labels + keyed instructions); relationship-only assembly is a present-layer addition |
| Additional non-fabricated components listed and collected into the package ('401 cl. 15, 16; '609 cl. 7, 10) | Parts the cell cannot make are identified and integrated | Special Order Supplier role in the packet | Issued claim (subject matter) · browser-modeled; the Special Order Supplier name is the package's mapping |
| Prefinishing/finishing station; secondary operations station ('401 cl. 7, 8) | Finishing and bounded manual processing | Optional finishing station; last-mile handling under role certification | Issued claim · browser-modeled |
| Complete pickup-ready project package at a staging location ('401 cl. 1, 16; '609 cl. 10) | The claimed endpoint: everything collected, ready locally | The execution result and outcome are additionally returned to the owner-held record | Issued claim (package) · browser-modeled; outcome return to the record is a present-layer addition |
| Machine-readable instructions on non-transitory media ('401 cl. 17; '609 cl. 11) | The claimed method embodied in machine-readable instructions | The proof layer models the software-facing workflow and controller-boundary logic associated with this embodiment without executing a physical machine | Issued claim · browser-modeled |
| — | Owner-held custody, packet-scoped consent, append-only events, versioning, outcome archive, export, AI authority boundaries | The governance layer (see Present governance layer) | **Present-layer addition — not claimed** |

## Integrated system — '401 claim 1

**Issued claim.** Independent. In brief excerpt: an "integrated system for fabricating
components for a customer's selected wood-based project," with at least one computer
providing the consumer interface, a tandem machine system in which a component "can be
fabricated, regardless whether the component is based on dimensional stock or on sheet
material stock," instructions provided "via the CAD module" upon final selection, and
the whole "thereby providing an end-to-end integrated system that is completely
integrated," with components "fabricated and ready to be picked up at a specific
location." The claim then recites the sheet machine's structure in detail: support
frame, backward-leaning backing plates, base rollers, clamping rollers, two rotating
yoke assemblies with servo-controlled manipulator rollers, upper and lower horizontal
guide rails, two interconnected vertical guide rails, and a moveable tooling platform
driven by servo-controlled actuators on both axes.

**Plain-language function.** One computer-fronted system takes a consumer from design
choice to fabricated, pickup-ready components, with both material streams handled by
two coordinated machines and the machine instructions produced by the system itself at
final selection.

**Specification context.** The specification frames the system as a retail profit
center that "build[s] upon existing infrastructure in home improvement stores, such as
computer networks and lumber aisles configured to accommodate legacy saw fixtures, so
that implementation costs per store would be relative minor," with "simple and less
expensive construction" and components "easily maintained and replaced." Staged
adoption is explicit: a store might first convert its conventional sheet machine to
servo control, then add labeling and finishing later. "Home improvement" is defined
broadly — "a term intended herein to include projects related to business, industry,
government, etc."

**Present-package expression.** The claim is the skeleton of the Scan-to-Build
demonstration: class selector as interface, SKU-linked configuration as database/CAD
interaction, Manufacturing Execution Packet as the instruction set, dual-stream cell as
the tandem machine, labeled pickup as the specific-location delivery. The Kinematic
Ontology's figure-mapping table ties the claim's machine structures to the patent
drawings.

**Status.** Issued claim; the machine detail is specification disclosure; the workflow is browser-modeled; physically untested.

**Commercial significance.** Claim 1 is directed to an integrated system rather than
only an isolated machine component. Its enforceable scope, application to any
implementation, and practical licensing significance are matters for qualified counsel.

## Integrated method — '401 claim 10

**Issued claim.** Independent. In brief excerpt: "A method, comprising: providing an
interface to receive customer interactions from a customer wishing to evaluate a
project," interaction with a project database or a CAD module, "calculating, using a
processor on a computer, an estimated price," and "outputting said estimated price as
an output of said interface" — with the tandem-machine structural limitations folded
in, the tandem system "located in a home improvement retail store," the CAD module
comprising "a CAM (computer aided manufacture) portion" that generates the instruction
set, and "an operator sequentially loads raw materials into the tandem machine and
changes tooling head attachments for the intended project, as based on commands from
the set of instructions generated by the CAD/CAM module."

**Plain-language function.** The same chain as claim 1, claimed as steps: evaluate,
price, output, select, generate instructions, fabricate. Two step-level features stand
out. Pricing is processor-calculated and delivered through the interface as part of the
claimed method — an estimated price in the claim language, recalculated whenever the
customer varies the requirements (claim 11) and drawn from a pricing database at the
store where the tandem system sits (claim 18). And the operator holds an
instruction-directed loading, tooling, and supervisory role: loading stock, changing
tooling heads, and executing per generated commands, without becoming the per-job
CAD/CAM author.

**Specification context.** The pricing machinery is spelled out: cost derives from
machine cycle time, material requirements, custom tooling, special-order merchandise,
and selected options, with "discrete changes in price and/or inflection points in the
price curve" when a dimension change forces a different stock size. The specification
walks the example of an 8'-6" shed that becomes meaningfully cheaper at 8'-0" because
nominal stock then fits.

**Present-package expression.** The Operational Roadmap's spine — record → packet →
validation/refusal → routing → consent → execution report → outcome → export — wraps
this method in the governance layer. Demo Step 2 exercises the recalculation subject
matter of claims 11 and 18; demo Step 4 exercises the instruction generation and
transmission of claims 12–13. The issued claims establish a store-local pricing basis;
the present architecture adds SKU availability and inventory validation on the way to
confirmation-grade pricing.

**Status.** Issued claim; browser-modeled with demonstration values; physically untested; no pricing shown is commercially validated.

**Commercial significance.** Claim 10 is directed to a sequence linking customer
interaction, pricing, CAD/CAM generation, operator action, and machine execution. The commercial value of that combination depends on implementation, claim scope, validity, remaining
term, and adoption.

## Continued method — '609 claim 1

**Issued claim.** Independent. It carries the '401 method forward and tightens the
machine definitions: the first machine is "configured to selectively implement
two-dimensional machining operations on a piece of sheet material stock, including
curvilinear shapes," and the second machine executes "machining operations at either
end of a piece of dimensional wood stock by selectively moving the piece of dimensional
wood stock in fore and aft directions along a longitudinal axis." It restates the
processor-determined price, the database-or-CAD interaction, and the consequence of
confirmation: upon final selection the system "provides a set of instructions via the
CAD module to selectively control the first machine and the second machine for cutting,
shaping, and forming of wooden components."

**Plain-language function.** The complete consumer-to-machine sequence, with the two
material streams' distinct machining behaviors written into the independent claim:
curvilinear 2-D work on sheet stock, end-of-board operations with fore/aft servo
positioning on dimensional stock. The demonstration's two browser-modeled streams — S-014 (sheet, nested curvilinear) and D-001 (dimensional, crosscut/taper/dado along one axis) — draw from these claimed machine behaviors.

**Specification context.** The disclosure is the same family specification. The three
sheet-machine operating modes (manual; stencil-type mode 2; fixed-workpiece x-y mode 3)
and the stenciling concept — cut the outline, leave attach points, sever in the
secondary station — are the specification's operative detail behind the "curvilinear
shapes" language. The specification describes the three modes; the claims expressly
recite manual or automated control and the machinery through which those modes may be
implemented.

**Present-package expression.** Project 3 (the Adirondack chair) is a browser-modeled capability demonstration based on the declared dimensional-machine envelope: compound miters, mirrored pairs, profile milling, sixteen operations along the fore/aft axis.
Project 1's dual-stream packet exercises both machine limitations in one workflow.
Dependent claim 2 makes retail implementation express, and claim 13 locates the tandem
system in a home improvement retail store; the independent claim itself carries no such
location, a scope observation reserved for counsel.

**Status.** Issued claim; browser-modeled; physically untested. The '609 face lists nineteen U.S. references cited during examination,
including CNC-woodworking and mass-customization filings — a descriptive fact about the
prosecution record, with no conclusion drawn from it here.

## Dependent claim groups

Thirty dependent claims refine the three roots. Grouped by function, with every claim
accounted for by number:

**Consumer intent and project definition.** '609 claims 2, 9, 13. Retail
implementation; the interface interaction restated with both the project database and
the CAD module available; the in-store location of the cell. Package expression: the
class selector, bounded project classes, and the store-or-institutional cell framing.

**Pricing, variation, and order acceptance.** '401 claims 11, 12, 18; '609 claims 3, 4,
12. Variation of requirements → recalculated price → output; acceptance input →
material list and machining instructions; price drawn from a pricing database at the
store. Package expression: deterministic re-pricing in demo Step 2 and the
inventory-validated bill of materials — the issued claims establish the store-local
pricing basis, and the present architecture adds SKU availability and inventory
validation.

**Instruction generation and transmission.** '401 claims 12, 13; '609 claim 4.
Determining the material list; developing and transmitting the machining instructions.
Package expression: the Manufacturing Execution Packet emitted at confirmation and
dispatched to the cell.

**Tandem sheet and dimensional processing.** '401 claims 4, 5, 6, plus the machine
limitations inside '609 claim 1. Dimensional-machine structure (frame, fence, clamping
roller, servo manipulating roller, servo circular-saw stations); fixed rigid vertical
and horizontal ways positioning tool heads under servo control; a pre-drilled rigid
metal base mounting every station for tolerance by construction. Package expression:
the dual-stream cell and the coordinate frames, datums, and machine inventory of the
Kinematic Ontology.

**Machine control and interchangeable tooling.** '401 claims 2, 3. Control panels on
each machine with manual or automated control; interchangeable tooling heads on the
tooling platform. Package expression: the demonstration's machine-mode selectors and
the determinate known tool set with pre-mapped positions.

**Operator role.** '401 claim 10's operator limitation; '609 claims 5, 8, 15. The
transmitted instructions include, per component, "at least one instruction displayed to
an operator" identifying whether to load sheet or dimensional stock "depending upon
which component of the intended project is currently to be machined," plus the
machining operations to implement; the operator sequentially loads raw materials and
changes tooling head attachments per the generated commands. The issued claims place a
human in the execution chain in an instruction-directed loading, tooling, and
supervisory role — a bounded execution role, without per-job CAD/CAM authorship. The
package's cell steward and its "the cell does not interpret; it executes" doctrine formalize the operating discipline of that role. The specification's stated reason for restricting manual operation to control-panel inputs is "safety of the operator." That stated safety rationale is consistent with the later No Blood on Wood principle.

**Labeling, assembly, finishing, packaging.** '401 claims 7, 8, 9, 14, 15, 16; '609
claims 6, 7, 10. The prefinishing/finishing station; the secondary operations station
for manual processing by a store employee; the labeling station affixing an
identification label to each component and printing assembly instructions keyed to the
labels; the listing of additional non-fabricated components; and the post-machining
sequence — remove, label, finish, deburr or sand, collect fabricated and non-fabricated
components alike into one pickup-ready package. Claimed foundation: component
identification and label-keyed assembly instructions, ending in a complete pickup-ready
project package. Present-package extensions: relationship-only assembly intended to
reduce field reinterpretation, and the return of the execution result and outcome to
the owner-held record.

**Software embodiment.** '401 claim 17; '609 claim 11. The method as machine-readable
instructions tangibly embodied on a non-transitory storage medium, alongside the
specification's kiosk, home-computer, remote-server, and mobile-app interface
embodiments. Package expression: the executable proof layer, which models the
software-facing workflow and controller-boundary logic associated with this embodiment without executing a physical machine.

## Mechanical embodiments

The demonstrations compress the machinery into animations. Reviewers with a
manufacturing background will want the embodiment itself, and the specifications supply
it in unusual detail for a systems patent. The summary below establishes the physical
shape of the claimed chain; the Kinematic Ontology carries the full figure-by-figure
specification, coordinate frames, and datum diagrams.

**The dimensional-stock machine** ('401/'609 Fig. 5). A central base carries a table
surface and a fixed fence along the longitudinal axis — the fence is datum A. The board
is driven along the fence by commonly-controlled, servo-driven manipulating rollers
descending under pneumatic pressure, riding on idler rollers embedded in the table so
the work moves on rolling contact with positive control. Sawing stations at each end
produce miter and compound miter cuts by a chopping action under servo control. Rigid
vertical and horizontal ways carry interchangeable tool heads (drill, router, mill) on
lead-screw positioning with servo-controlled depth plungers. At cycle start the machine
establishes its datums — fence, base, and an automatic centering or operator-jogged
longitudinal reference — then "sequentially executes tasks assigned by a program that
positions work to appropriate longitudinal positions for specified tooling." The
specification's worked example — drill one end, shift, cut, shift, drill, sever, reuse
the remainder — is reflected in the demonstration's browser-modeled D-001 stream, including the reclaiming
of warped stock for short components, where "the amount of deformation over shorter
spans would be negligible."

**The sheet machine** ('401/'609 Figs. 6–8). A backward-leaning welded frame carries
backing plates, bottom support rollers, and two rotating yoke assemblies whose
servo-controlled manipulator rollers drive the sheet along the x-axis. A moveable
tooling platform rides two interconnected vertical guide rails that themselves
translate along horizontal rails, rack-and-pinion under servo control on both axes. A
pressure-plate sensing assembly descends to contact and establishes the depth datum;
the tool head then plunges under servo control to commanded depth. The platform's
receiver accepts interchangeable heads stored at a docking station, including the
Fig. 8 collet attachment for edge-contour tools "that can be arbitrarily customized for
a consumer project" and machined locally — which allows some new capability to enter through tooling rather than wholesale machine replacement. The specification describes three operating
modes: control-panel manual; a stencil mode with the platform locked at centerline and
the sheet driven in x, cutting any 2-D outline while leaving attach points for later
severing; and a fixed-workpiece mode with the component pinned to carrier plates and
the platform moving in both axes for precision profiling. The claims expressly recite
manual or automated control and the machinery through which those modes may be
implemented.

Three properties of these embodiments matter to the claim-to-architecture relationship.
Deterministic sequencing is native: the specification compares the strategic sequential
positioning of stock to "the operational concepts utilized in conventional numerical
control (NC) and robotic systems," which is why a Manufacturing Execution Packet rather
than operator judgment is the natural unit of authority at the cell. The envelope is
physical and declared: stock sizes, tool sets, mode precision tiers, and station layout
are stated limits, and a MachineEnvelope is that disclosure given a schema. And
simplicity is a design commitment: the machines are "intentionally designed to keep
complexity to a minimum," with replaceable components, standard tool heads "well known
in the art," and legacy-fixture retrofit paths — the engineering premise behind the
package's claim that a bounded cell fits an existing shop footprint.

## Why the claimed chain is more than a product configurator or nesting workflow

A conventional nesting or CAM-optimization workflow generally begins after someone has
already interpreted the customer's need, created the design, chosen the material,
converted the design into manufacturable parts, and accepted responsibility for fit.
The software optimizes execution of a definition that a chain of people produced.

The issued chain begins earlier and ends later. It connects customer interaction,
project alternatives, CAD-guided feasibility, pricing, order acceptance, material
determination, machine-instruction generation, dimensional and sheet processing,
operator action, labeling, assembly information, and local project release — in one
claimed sequence, with the instruction set generated by the system's CAD/CAM portion at
confirmation and the operator holding a bounded execution role rather than an
authorship role. The role-compression comparison in the demonstration (drafter, modeler, CAM programmer, post-processor, setup → system) corresponds to this issued workflow: the claimed sequence does not require a separate per-job CAM-programming role at the fabrication cell.

None of this asserts that no similar commercial systems exist, or that the combination
is novel over any particular art — those are examination and counsel questions, and the
'609 prosecution record already reflects examiner-cited art in adjacent fields. The
point is narrower: the breadth of the claimed combination is the reason the package
treats the workflow, and not any single machine, as the thing being governed.

## Commercial logic stated in the patents — and the economics a pilot must test

The specifications state an economic thesis, element by element: build on existing
store computer networks and internet or mobile interfaces; fit into lumber aisles
already configured for legacy saw equipment, sized to conventional upright bays, at
implementation cost the specification calls minor; use simple, maintainable,
replaceable machine elements and standard tool heads; machine locally available stock, reducing or avoiding some raw-material and finished-component shipping by fabricating from locally held stock; reduce
job-site cutting, cleanup, waste, skill requirements, and equipment hauling for
contractors; add value to inventory the store already sells, converting floor space and
legacy service machinery into profit centers in stages; reclaim warped short stock for
short components; and extend beyond homeowners to business, industry, and government
users.

The proposal does not depend on replacing an existing shop with a new factory. It adds
bounded control, positioning, instruction, and coordination capabilities around
familiar stock, familiar tools, existing operators, and existing local footprints.

These are projected operational benefits stated in the specification; none, including any logistics reduction, has been measured. Whether the concept is economically viable remains untested. The pilot-measurable variables,
consistent with the Material & Labor Ontology's measurement notes: retrofit cost per
cell; reused-equipment share; floor-space requirement; software, integration,
safety-engineering, and cybersecurity cost; operator training time; setup and
changeover time; cycle time per packet; operator minutes per project; first-fit rate;
stock utilization and scrap fraction; maintenance burden; delivered project cost
against conventional quotes; reduction in field interpretation and rework; and revenue
per square foot of cell footprint. Software may replicate at near-zero marginal cost.
Safe, validated physical integration does not, and the low-capital argument is only
believable with that stated plainly.

## Present governance layer

The issued structure creates practical attachment points for governance:

- the material list ('401 cl. 12) is where material class, source, and emissions status
  can ride;
- price recalculation on variation ('401 cl. 11; '609 cl. 3) makes the cost of every
  changed choice visible;
- order acceptance ('401 cl. 12; '609 cl. 4) is a natural consent point;
- instruction generation and transmission ('401 cl. 13) is where instructions can be
  withheld when conditions are unsupported;
- operator-displayed instructions ('609 cl. 5) keep a human in the execution chain;
- labels ('401 cl. 9) give each component an identity a record can hold;
- assembly instructions keyed to labels preserve build relationships;
- the software embodiment ('401 cl. 17; '609 cl. 11) supports versioned, auditable
  execution; and
- the completed project package ('401 cl. 16; '609 cl. 10) is a natural place for an
  outcome record to form.

The controls themselves belong to the present architecture: owner-held custody;
packet-scoped consent; formal validation and refusal with preserved, classified refusal
reasons; material and emissions enforcement; append-only events and versioning; the
outcome archive; portable export; explicit AI authority boundaries; and the rule that
no actor stands above the homeowner in the custody chain. The patents do not claim
these rules, and the issued claims do not recite them in this later governance form. The issued structure makes
the governed implementation practical at the points listed above; the governance is the
work of this package.

On AI specifically: the claims place final machine-instruction generation in the
CAD/CAM portion of the system. The present architecture adds the rule that AI may
assist with capture, reconciliation, constraint analysis, and explanation, while final
instruction emission remains subject to validated deterministic logic. That is a
present governance rule, not an express AI limitation in the issued claims.

## Current technology context

Several technologies matured after the 2013 filing. Each attaches to the issued chain
at an identifiable point.

**Spatial capture.** The claims recite an interface receiving inquiries and design
choices; the specification describes kiosk, home-computer, remote-server, and
mobile-app input paths. Phone LiDAR, aerial measurement, and professional scanning
change the input modality — a scan is a richer way to state the same constraints —
while the claimed sequence downstream of input is unchanged. The package treats capture
tools as commodities it does not invent, and demo Step 1 locks geometry at scan and
hands it to the same resolution-and-gate chain.

**Digital twins and digital threads.** The claimed chain — design definition,
instruction generation, machine execution, labeled physical output — is a
manufacturing digital thread in the sense the standards community has since formalized
(Appendix B). The alignment stated here is modest: the issued chain is the kind of
workflow those frameworks govern; conformance would be a pilot-stage engineering
exercise.

**Bounded AI.** The specification already requires CAD rules "steering the user towards
technically feasible product solutions" and a feasibility check before any order.
Bounded AI matured into that slot: reconciling imperfect scans, enforcing envelopes,
maintaining packet integrity, under the authority rule stated in the governance section.

**Agentic systems and networked manufacturing.** The specification contemplates
automated material retrieval as an option and prefers manual loading for cost and
retail practicality. As agentic systems move toward physical execution, the relevant point is where control sits. The issued chain provides defined handoff points between project selection, CAD/CAM generation, operator instruction, and machine execution. The present architecture adds validation and refusal before instructions are released, together with an explicit human gate at the cell.

**Incremental automation.** The staged-retrofit path the specifications describe —
convert the sheet machine first, add labeling and finishing later — matches how smaller
manufacturers actually adopt automation, which is the adoption context manufacturing
extension programs work in (Appendix B).

## Review boundaries

- No claim construction. Excerpts are abbreviated for orientation; the issued claims
  control, and only counsel construes them.
- No validity, infringement, enforceability, or freedom-to-operate opinion, in any
  direction, as to anyone.
- This document addresses the two issued patents only. It makes no representation
  concerning pending family members, continuation availability, priority entitlement,
  maintenance status, enforceability, terminal-disclaimer effects, or remaining term.
  Those matters require counsel and the official prosecution record.
- No standards compliance, certification, adoption, agency interest, or institutional
  endorsement is asserted anywhere in this package; Appendix B lists candidate
  references only.
- No economic validation. The commercial-logic section lists what a pilot must measure; none of it has been
  measured.
- No production claim. Per the package posture throughout: simulation only, no live
  machine control, no commissioned equipment, no physical execution.

## Conclusion

The issued claims do not describe a machine standing alone. They assemble a chain: a
person defines a project, weighs alternatives inside CAD-guided feasibility, receives a
processor-calculated price and a recalculated price when the project changes,
authorizes the work, and the system generates the machine instructions; sheet and
dimensional stock move through a bounded tandem process; a person loads stock and
changes tooling on displayed instruction; components come off labeled, with assembly
information keyed to the labels; finishing and secondary operations complete them;
additional non-fabricated components join them; and the whole project releases locally
as one package.

The present architecture keeps that chain and adds what the claims do not recite:
governed translation into current operating language, owner-held custody, packet-scoped
consent, formal refusal with preserved reasons, material enforcement, versioned evidence, the outcome returned to the owner's record, export, and bounded AI authority.

The forward question is not whether each individual tool already exists. Most do, and
the specifications assumed as much, building on legacy fixtures and standard tool heads
from the first page. The question is whether the issued chain can now be implemented
incrementally, safely, and economically by connecting those tools around one governed
project definition. That question can be answered only through a properly designed
physical pilot, qualified legal review, and institutional or industry participation,
each informing the others.

---

## Appendix A — Individual claim register

> Editorial labels are supplied for navigation and are not official claim titles or
> legal claim constructions. "Ind." = independent; "Dep." = dependent (parent in
> parentheses).

### U.S. 9,720,401 B2 (issued Aug. 1, 2017 · 18 claims)

| Claim | Status | Editorial label | What it adds |
|---|---|---|---|
| 1 | Ind. system | Integrated consumer-to-fabrication system | Interface; database or CAD interaction; tandem machine (sheet + dimensional); instructions via CAD module at final selection; end-to-end integration; pickup at a specific location; detailed sheet-machine structure (frame, backing plates, rollers, yoke assemblies, guide rails, servo-driven tooling platform) |
| 2 | Dep. (1) | Manual or computer control | Control panel per machine; each machine operable under operator inputs or automated control signals |
| 3 | Dep. (1) | Interchangeable tooling heads | Tooling platform configured for selective installation of different heads |
| 4 | Dep. (1) | Dimensional-machine structure | Frame and surface; fence; clamping roller; servo-controlled manipulating roller; servo circular-saw sawing stations |
| 5 | Dep. (4) | Rigid tool-positioning ways | Fixed rigid vertical and horizontal ways positioning tooling heads along their lengths under servo control |
| 6 | Dep. (5) | Pre-drilled rigid base | Rigid metal base with pre-drilled holes mounting fence, rollers, saw stations, and ways — tolerance by construction |
| 7 | Dep. (1) | Prefinishing/finishing station | Selective application of a selected finishing material to project components |
| 8 | Dep. (1) | Secondary operations station | Manual further processing of components by a store employee |
| 9 | Dep. (1) | Traceable project release | Labeling station: identification label affixed to each component; assembly instruction set printed |
| 10 | Ind. method | End-to-end ordering-and-fabrication method | Interface; database or CAD; processor-calculated estimated price output through the interface; instructions at final selection; in-store tandem system; CAD/CAM generation; operator sequentially loads stock and changes tooling head attachments per generated commands; machine structural limitations |
| 11 | Dep. (10) | Variation re-pricing | Receive a variation of requirements; recalculate the estimated price; output the recalculated price |
| 12 | Dep. (10) | Order acceptance → definition | Acceptance input; determine list of materials; develop machining instructions for the two machines |
| 13 | Dep. (12) | Instruction transmission | Transmit the machining instructions to the tandem machine |
| 14 | Dep. (13) | Label-keyed assembly | Label per fabricated component; assembly instruction set prepared from the affixed labels |
| 15 | Dep. (14) | Additional non-fabricated components | Listing of additional project components not fabricated by either machine |
| 16 | Dep. (13) | Post-machining handling | Remove machined component; label; finishing operations; secondary operations (deburr/sand); collect fabricated and additional components into one pickup-ready package |
| 17 | Dep. (10) | Software embodiment | The method as machine-readable instructions tangibly embodied on a non-transitory storage medium |
| 18 | Dep. (10) | Store-local pricing basis | Estimated price based on prices from a pricing database at the store where the tandem system is located |

### U.S. 10,768,609 B2 (issued Sep. 8, 2020 · 15 claims · continuation of the 2013 application)

| Claim | Status | Editorial label | What it adds |
|---|---|---|---|
| 1 | Ind. method | Continued, further-defined consumer-to-machine method | Full sequence with processor-determined estimated price; first machine defined for two-dimensional sheet machining including curvilinear shapes; second machine defined for either-end dimensional operations with fore/aft servo positioning; instructions provided at final selection to control both machines; end-to-end integration; sheet-machine structural limitations |
| 2 | Dep. (1) | Retail implementation | The method as implemented by a retail business entity |
| 3 | Dep. (1) | Variation re-pricing | Variation received; estimated price recalculated; recalculated price output |
| 4 | Dep. (1) | Order acceptance → definition | Acceptance input; material list; machining-instruction development for both machines |
| 5 | Dep. (4) | Operator-directed execution | Transmitted instructions include, per component, an instruction displayed to an operator identifying whether to load sheet or dimensional stock, plus the machining operations to implement |
| 6 | Dep. (5) | Label-keyed assembly | Label per component, affixed appropriately; printed assembly instruction set based on the labels |
| 7 | Dep. (6) | Additional non-fabricated components | Listing of additional components not fabricated by either machine |
| 8 | Dep. (7) | CAD/CAM generation + operator tooling changes | CAM portion generates the instruction set; operator sequentially loads raw materials and changes tooling head attachments per generated commands |
| 9 | Dep. (8) | Further-defined interface | Interface interaction restated with both the project database and the CAD module available to the customer |
| 10 | Dep. (5) | Post-machining handling | Remove; label; finishing operations; secondary operations; collect fabricated plus additional non-fabricated components into one pickup-ready package |
| 11 | Dep. (1) | Software embodiment | The method as machine-readable instructions tangibly embodied on a non-transitory storage medium |
| 12 | Dep. (1) | Store-local pricing basis | Estimated price from a pricing database at a store where the tandem system is located |
| 13 | Dep. (1) | In-store cell location | Tandem machine system located in a home improvement retail store |
| 14 | Dep. (1) | CAM instruction generation | CAD module comprises a CAM portion; the tandem system's instruction set is generated by the CAD/CAM module |
| 15 | Dep. (14) | Operator loading per CAD/CAM commands | Operator sequentially loads raw materials and changes tooling heads for the intended project, per the generated instruction set |

## Appendix B — Candidate standards and application contexts — no compliance or endorsement asserted

Each row is a candidate validation reference or application context. No compliance,
certification, adoption, agency interest, partner interest, or funding eligibility is
asserted for any row. Sources and status last verified: July 23, 2026.

| # | Framework or program | Identifier / edition | What it governs | Connection to this package | Posture and boundary |
|---|---|---|---|---|---|
| 1 | ISO digital-twin framework for manufacturing | ISO 23247 series (Parts 1–4 first published 2021); ISO 23247-5:2026, digital thread for digital twin | Reference architecture connecting physical manufacturing elements to digital counterparts; life-cycle information flow | The record → WorkPacket → cell → outcome path is the kind of workflow this framework describes | Reference only; no conformance work performed; conformance would be a pilot-stage engineering exercise |
| 2 | NIST digital-twin security guidance | NIST IR 8356, *Security and Trust Considerations for Digital Twin Technology* (final, Feb. 2025) | Cybersecurity and trust considerations for digital-twin systems | Security baseline for owner-held records and packet transport | Reference only; no security assessment has been performed |
| 3 | NIST Cybersecurity Framework Manufacturing Profile | NIST IR 8183 Rev. 1 (Oct. 2020, aligned to CSF 1.1); Rev. 2 initial public draft (Sept. 2025, aligned to CSF 2.0) | Voluntary, risk-based cybersecurity for manufacturing systems | Frame for the cell's controller-authority and network-boundary rules (Kinematic Ontology §8) | Reference only; no assessment performed |
| 4 | OSHA machine guarding and woodworking machinery | 29 CFR 1910 Subpart O, incl. §1910.213 | Physical machine safety in U.S. workplaces | Validation reference any physical cell must be evaluated against; consistent with the No Blood on Wood principle | No equipment exists to evaluate; nothing is certified or evaluated |
| 5 | Machinery risk assessment | ISO 12100:2010 | General principles for machinery safety design, risk assessment, and risk reduction | Methodology a physical cell design review would follow | Reference only; no risk assessment exists |
| 6 | Composite-wood formaldehyde rules | EPA TSCA Title VI; 40 CFR Part 770 | Formaldehyde emission standards for composite wood products | External basis for preserving compliant panel classification as a material attribute ("SKU is not physical truth") | Reference only; no compliance determination is made or implied |
| 7 | Manufacturing extension | NIST Manufacturing Extension Partnership (MEP) | Technology adoption support for smaller U.S. manufacturers, including incremental automation | Programmatic context for the staged-retrofit path the specifications describe; institutional context is developed in the Institutional Study Layer | Contextual fit only; no program engagement is asserted; regional or institutional outreach material belongs in a separate brief |
| 8 | Defense logistics and distributed production | No single instrument cited | Supply-chain resilience and distributed-manufacturing study contexts | A governed, bounded, wood-domain fabrication chain may be relevant to the study of noncritical distributed fabrication — packaging, fixtures, facilities components, training aids, and similar sustainment support | Application context only; no DoD interest, engagement, program fit, funding eligibility, or validation is asserted or implied |

**Sources.**

1. ISO, *ISO 23247-5:2026 — Digital thread for digital twin*, iso.org/standard/87425.html (publication status confirmed at iso.org, July 23, 2026); series stewardship: ISO/TC 184/SC 4.
2. NIST, *IR 8356* (final), doi.org/10.6028/NIST.IR.8356; publication record at csrc.nist.gov/pubs/ir/8356/final (confirmed July 23, 2026).
3. NIST, *IR 8183 Rev. 1*, nvlpubs.nist.gov/nistpubs/ir/2020/NIST.IR.8183r1.pdf; Rev. 2 initial-public-draft announcement, nist.gov (Sept. 2025) (confirmed July 23, 2026).
4. eCFR, 29 CFR §1910.213, *Woodworking machinery requirements*, ecfr.gov (stable regulatory citation).
5. ISO, *ISO 12100:2010 — Safety of machinery — General principles for design — Risk assessment and risk reduction*, iso.org (stable catalog entry).
6. eCFR, 40 CFR Part 770, *Formaldehyde Standards for Composite Wood Products*, ecfr.gov (stable regulatory citation).
7. NIST, *Manufacturing Extension Partnership*, nist.gov/mep (program description).

*3D Solutions LLC · Greensboro, North Carolina*
