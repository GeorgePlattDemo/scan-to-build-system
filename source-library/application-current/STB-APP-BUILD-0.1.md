# STB-APP-BUILD-0.1

## 1. Purpose

This document defines the first real Scan-to-Build application build.

The next phase is not architecture discovery.

**We are giving the build model an architecture and asking it to build the shortest coherent application through it.**

The build model shall not redesign Scan-to-Build from scratch, promote exploratory material into authority, invent missing semantics to make a demo work, or broaden the first build merely because additional possibilities are visible.

This file is the build contract for the application phase.

---

## 2. Build-model starting condition

The build model does **not** start cold.

`COLD.ORIENT` is a user-facing application entry state. It is not the build model's starting condition.

The build model starts with:

- this build contract;
- the pinned Governed Reference;
- the pinned Store;
- the pinned Cell spine;
- the recovered prior application ancestor;
- the public prototype as experience reference only.

The first responsibility is to establish that this contract is coherent with those sources.

Coherence is a prerequisite for the next bounded application-planning pass. Implementation requires a subsequent explicitly scoped instruction.

---

## 3. Pilot posture

The architecture is piloted before implementation.

The pilot responsibility is to:

- identify what the first application actually is;
- preserve existing authority boundaries;
- identify the smallest reusable application structure;
- distinguish current capability from future capability;
- keep unresolved engineering unresolved;
- preserve useful prior implementation work;
- prevent prototype shortcuts from becoming architecture.

The build model is a builder and reviewer against this contract.

It is not being asked to discover what Scan-to-Build is.

---

## 4. Pinned source stack

### 4.1 Governed Reference

Repository:

`GeorgePlattDemo/scan-to-build-governed-reference`

Branch:

`main`

Pinned reference:

`18949f163718a937f072f4be3a654bb303e53160`

Role:

The Governed Reference controls project meaning, gates, WorkPacket semantics, unresolved conditions, refusals, SimulationAuthorization, simulated outcomes, and authority boundaries.

Current v0.2.x production execution remains closed.

The application shall not create a production-authorization path that does not exist in the governed source.

---

### 4.2 Store

Repository:

`GeorgePlattDemo/scan-to-build-store`

Branch:

`main`

Pinned reference:

`3620b35369d70cf49733bbb0b62c0f3d9969b738`

Role:

The Store controls offerings, material and stock resolution, Store capability, Store Job 001, machine-neutral operation translation, fulfillment, and Store-level defer/refuse behavior.

The application may ask the Store for answers.

The application does not possess or recreate the Store.

**Ask for the answer, not the database.**

---

### 4.3 Cell spine

Repository:

`GeorgePlattDemo/grok-file`

Branch:

`wip/cell-spine-0.1`

Pinned reference:

`f0c3e08682810d7a3c03c211dc76f8ece756313e`

Primary file:

`docs/cell/STB-CELL-0.1.md`

Role:

The Cell spine is the current descriptive reference for the relationship between accepted jobs, machine configuration, local lowering, machine state, and physical execution.

It remains a working artifact.

Candidate objects remain candidate unless adopted by their proper owning layer.

The application shall not promote Cell candidates into Governed Reference or Store semantics merely because they are convenient.

Working principle:

**The job carries part truth. The machine carries cell truth.**

### 4.4 Verified baseline and current activation

The exact source register is [STB-APP-SOURCE-MAP-0.1.md](STB-APP-SOURCE-MAP-0.1.md). Pass-1 findings and unresolved decisions are recorded in [STB-APP-STABILIZATION-0.1.md](STB-APP-STABILIZATION-0.1.md).

At the pinned governed reference, the reference node may hand off only the unchanged bounded sheet fixture to M1. Its operation sequence is `simulate_crosscut` followed by `simulate_shelf_blank`; its request quantity is `3 ea`. Dimensional and mixed M1 execution remain inactive. Matching displayed dimensions alone does not establish authority.

`NodeEvaluationResult` reports evaluation; `NodePlan` describes a simulation-only plan; `NodeOutcomeRecord` records a simulation that actually occurred in that runtime. Acceptance or a plan does not establish execution. Inspectable JSON `SimulationAuthorization` is evidence, not reusable adapter-entry authority; the current authority mechanism is process-local and is not transported by an application export.

Source basis: governed `docs/reference-node/README.md`, `packages/reference-node/src/types.ts`, `fixtures/reference-node.v1/context.json`, and `docs/architecture/current-simulation-authority.md` at the pin above.

The broader project classes, entry contexts, Store interfaces and input methods in this contract describe application direction. They do not activate governed artifacts or widen the existing fixture. Governed activation remains subject to STB-REF §3.1.1 and STB-PLAN §§6.0–6.4. The Picnic Table is not the governed Project B window-seat class. Unsupported paths retain an explicit stop or deferred status.

---

## 5. Prior application work

The application phase does not begin by rebuilding earlier work from scratch.

### 5.1 Recovered guided-tour implementation ancestor

Repository:

`GeorgePlattDemo/grok-file`

Branch:

`prototype/sarah-alcove-tour`

File:

`prototypes/sarah-alcove-guided-tour.html`

Pinned reference:

`b52570fe48db3af09825b826b739aca72db32c22`

Role:

This is the recovered prior implementation ancestor for user orientation, bounded project flow, refusal visibility, provenance, record presentation, and inspection behavior.

Useful prior behavior includes:

- common landing entry;
- NEW USER orientation before entering the worked example;
- explanation of what the user provides;
- explanation of what the system does;
- visible reasons the system may stop;
- the rule that a stop must not be silently converted into a pass;
- RETURNING USER and PROFESSIONAL planned-state explanations;
- explicit separation of USER APPLICATION, GOVERNED CORE, and STORE / REFERENCE NODE responsibilities;
- candidate WorkPacket visibility;
- unresolved-condition visibility;
- negative material and machine cases;
- self-check behavior;
- persistent `NO BLOOD ON WOOD`.

This file is an implementation ancestor, not current semantic authority.

The new application shall preserve useful behavior where it remains consistent with the current Governed Reference, Store, Cell spine, and this build contract.

The historic `Sarah` persona shall not be carried into the new application.

The new worked persona is:

**User 1**

Historical artifacts may retain historical provenance where necessary, but new UI, filenames, fixtures, IDs, comments, tests, and exports shall use `User 1`.

---

### 5.2 Public prototype experience ancestor

Repository:

`GeorgePlattDemo/Scan-to-Build`

Branch:

`main`

Pinned reference:

`ea17feeac299fc359c6776f85019b242ffffc085`

Role:

The public prototype is an experience and storytelling reference.

Useful visual structure, sequencing, configuration ideas, and interaction may be reused where consistent with the current architecture.

It is not semantic authority.

If the public prototype conflicts with Governed Reference, Store, Cell, or this build contract, the prototype loses.

Known legacy concepts that shall not be propagated include:

- `Manufacturing Execution Packet`;
- patent correspondence treated as safety authority;
- patent correspondence treated as execution authority;
- gate pass treated as production authorization;
- WorkPacket described as controller-ready;
- direct app-to-machine execution implications;
- machine execution described as though Store translation and commissioned lowering do not exist;
- production eligibility inferred from successful simulation.

---

## 6. Application objective

The first application is **not an Alcove application**.

It is the first reusable Scan-to-Build **project-class application framework**.

A project class represents a bounded family of projects that can be configured within defined rules.

The application architecture shall allow additional bounded project classes to be added without rebuilding the application architecture for every new class.

The first build shall be tested against two deliberately different project classes.

---

## 7. Reference class A — User 1 Alcove Insert

The Alcove Insert is the first place-derived reference class.

It exercises:

- a real physical place;
- user declarations;
- observations and evidence;
- fit-critical dimensions;
- derived geometry;
- material requirements;
- Store resolution;
- governed stopping;
- WorkPacket formation;
- authorized simulation where currently allowed;
- outcome and owner record.

This class tests whether a project can begin with a physical condition and converge on a bounded definition.

---

## 8. Reference class B — Classic Picnic Table

The Classic Picnic Table is the first product-derived reference class.

It exists to test a different path through the same application architecture.

The user begins with a known bounded product class and changes permitted dimensions and options rather than designing an unrestricted object from scratch.

The class shall eventually support bounded variation in characteristics such as:

- overall length;
- overall width;
- table height;
- seat geometry;
- material offering;
- permitted configuration choices.

The class is expected to derive rather than independently expose every geometric variable.

Its geometry may include:

- repeated tabletop members;
- repeated seat members;
- mirrored/repeated legs;
- transverse supports;
- longitudinal members;
- braces;
- square cuts;
- angled or miter cuts;
- drilling;
- repeated fastener patterns.

The Picnic Table class exists to prove:

**parameter change  
→ derived geometry  
→ parts/BOM  
→ material demand  
→ Store resolution  
→ required operations  
→ price  
→ disposition**

Project requirements describe the operations needed to evaluate capability. In this consequence chain, the Store resolves those requirements against its declared material and capability, then supplies the bounded machine-neutral operation sequence. The application does not perform Store translation or machine-local lowering. This is consequence order, not a newly specified API or authorization sequence.

It also establishes the first explicit lifecycle example:

A retained project definition should eventually allow a damaged individual part, such as one table leg, to be identified and re-fulfilled without rediscovering the entire object.

---

## 9. Project-class principle

The application shall not primarily encode project meaning in bespoke screens such as:

`AlcovePage`

`PicnicTablePage`

`WindowSurroundPage`

A project class should eventually carry enough bounded definition for the common application framework to present and process it.

The exact project-class schema is **not frozen by this document**.

The first build shall derive only the minimum abstraction demonstrated to be necessary.

Conceptually, a project class may need to express things such as:

- identity;
- required inputs;
- configurable parameters;
- permitted ranges;
- derived relationships;
- part families;
- material requirements;
- required operations;
- Store questions;
- unresolved conditions;
- governed stopping conditions;
- price consequences;
- confirmation requirements;
- lifecycle identity;
- tests.

Do not create fields merely because they may someday be useful.

---

## 10. Common entry

The long-term application supports three starting conditions.

### Idea or need

`ActorContext COLD`

Opening state:

`COLD.ORIENT`

### Existing home or project

`ActorContext PLACE`

Opening state:

`PLACE.RESUME`

or:

`PLACE.SEED`

### Job, plan, or takeoff

`ActorContext CONTRACTOR`

Opening state:

`CONTRACTOR.ORIENT`

then:

`JOB.OPEN`

These are user-entry contexts.

They do not own project authority.

All valid entry paths converge on the same governed core.

---

## 11. Core application flow

The application shall preserve the following conceptual convergence:

**Evidence  
→ Observations  
→ Configuration  
→ Material / Capability Resolution  
→ Governed Gates  
→ INFORM / REFUSE / DEFER**

or, where permitted:

**Validate WorkPacket  
→ SimulationAuthorization  
→ Simulated Execution  
→ Outcome / Owner Record**

Entry context shall not:

- promote authority;
- promote verification;
- invent material identity;
- reimplement governed gates;
- omit unresolved conditions;
- issue physical execution authority.

---

## 12. Input and project-definition surface

The application needs its own basic project-definition and rendering capacity.

The first useful application should be capable of presenting and manipulating bounded project geometry without requiring an external CAD program for every ordinary project interaction.

This native application capacity may include, as appropriate to the first build:

- structured dimensions and parameters;
- basic 2D or 3D project visualization;
- selection and highlighting of project components;
- dimensional and configuration feedback;
- visible derived geometry;
- simple markup or annotation where justified;
- comparison of configured alternatives.

This native rendering capacity is not intended to become unrestricted general CAD.

The application shall also be designed to accept outside project evidence and imagery through bounded adapters.

Expected future input classes include:

- typed requirements;
- structured forms;
- manual dimensions;
- drawings and sketches;
- photographs;
- uploaded plans;
- PDF;
- SVG;
- DXF;
- builder drawings;
- takeoffs;
- phone scans;
- LiDAR or related spatial capture;
- meshes, point clouds, or other useful geometric evidence where justified.

The intended long-term behavior is:

**outside evidence or imagery  
→ parsed / identified observations  
→ provenance retained  
→ bounded project-class interpretation  
→ unresolved conditions preserved  
→ governed resolution  
→ makeable project-component specification where supported**

The phrase **makeable project-component specification** does not mean that imported imagery or geometry automatically becomes fabrication authority.

The application may translate evidence into candidate observations, candidate geometry, dimensions, features, or project-component definitions.

The governed process determines what may become controlling project truth.

The Store determines whether the resolved component requirements can actually be supplied or made.

The Cell and local controller remain downstream of that decision.

A successfully imported image, drawing, model, or scan is evidence.

It is not fabrication authorization.

---

## 13. Application responsibility

The application may:

- orient a user;
- collect declarations;
- collect measurements;
- accept evidence;
- display evidence provenance;
- present configurable project parameters;
- render bounded project geometry;
- calculate permitted project-class derivations;
- display governed state;
- request Store resolution;
- display Store answers;
- display material and capability consequences;
- display price information when an authoritative pricing source exists;
- compare configurations;
- present WorkPacket information;
- request authorized simulation;
- display simulated execution;
- display outcomes;
- preserve project and part identity;
- support owner record interactions.

The application may not:

- allocate physical stock itself;
- invent material availability;
- create machine capability;
- silently substitute machine capability;
- issue ProductionExecutionAuthorization;
- generate live-motion commands;
- remotely invoke Cycle Start;
- close machine interlocks;
- assert `POSITION_VALID`;
- treat WorkPacket as a controller program;
- treat successful simulation as physical-fabrication eligibility;
- treat a produced label as proof of a good part.

---

## 14. Truth boundaries

### Project / WorkPacket truth

Defines what the finished project and its parts are required to become.

### Store truth

Defines what a particular Store can currently offer, supply, make, simulate, defer, or refuse.

### Cell truth

Defines commissioned machine geometry, installed tooling, station relationships, controller modes, and local lowering behavior.

### Local controller truth

Defines real-time machine state, interlocks, motion, stopping, and local execution state.

### Physical outcome truth

Records what actually occurred.

These layers shall not be collapsed for application convenience.

---

## 15. Pricing

Real-time consequence visibility is a core product behavior.

The application should eventually allow a valid configuration change to show its consequences immediately, including price where authoritative pricing data exists.

The Picnic Table is the first reference case for this behavior.

The application should eventually be capable of comparing:

- a standardized available product;
- a bounded configured project;
- dimensional fit;
- Store capability;
- material requirements;
- resulting price.

The purpose is not to claim that configurable local production will always beat mass production on price.

A standard commodity product may be the correct answer.

The Scan-to-Build value becomes especially visible when the standard product does not fit the actual place or need.

No market price or Store price shall be invented merely to complete a demo.

Fixture-backed pricing, if used before a Store pricing service exists, must be explicitly identified as fixture-backed.

---

## 16. Owner and part lifecycle

A project does not disappear when initial fulfillment is complete.

The application architecture shall preserve enough identity to support future:

- repair;
- replacement;
- modification;
- reconfiguration;
- re-fulfillment.

At minimum, the architecture should preserve the possibility of durable:

- project identity;
- project-class identity;
- configuration version;
- part identity;
- derivation/provenance;
- material identity where resolved;
- outcome record.

The initial implementation does not need to build a complete replacement-parts commerce system.

It must avoid making such a system impossible without reconstructing the original project.

---

## 17. First deployable machine capability envelope

The first deployable Scan-to-Build machine is **not intended to be a universal furniture machine**.

It is expected to provide a useful but bounded set of repeatable functions within a defined material, geometry, tooling, motion, and work-envelope.

The anticipated first practical capability family includes some combination of:

- square crosscut;
- bounded angled or miter cutting;
- milling;
- drilling;
- routing or related material removal;
- limited curvilinear or contour capability within a stated envelope;
- indexing;
- labeling or part identification.

The exact commissioned capability belongs to the Store and Cell layers and must be declared rather than inferred.

The first deployable machine is **not expected to support the entire universe of woodworking operations**.

In particular, full compound-miter capability is not assumed for the first deployment.

A project class shall therefore not imply that it is buildable merely because its geometry can be rendered or mathematically derived.

The system must ask whether the required operations fit the actual commissioned capability envelope.

A valid project outcome may therefore be:

- accepted by the current Store/cell;
- accepted after bounded configuration change;
- routed to another future capability class or fulfillment path;
- deferred;
- refused.

This is intentional.

Product variety should come primarily from upstream project definition, geometry, and reusable machine functions rather than by pretending the first machine is mechanically universal.

---

## 18. Machine and controller horizon

Physical execution is a later horizon.

The long-term chain is:

**Application  
→ Governed Core  
→ Store  
→ Machine-neutral job  
→ Commissioned cell lowering  
→ Local machine program  
→ Local controller  
→ Drives / tooling / sensors / actuators**

The application is not the machine controller.

The network is not the real-time motion loop.

Loss of network communication shall not be treated as a reason for motion control, interlocks, stopping, or machine state to migrate into the application.

The current build remains simulation-only where required by the controlling Governed Reference.

The eventual local controller will be required to run real machine motion, local state, interlocks, stopping, and commissioned programs.

That future work must be approached as a separate controls/safety/commissioning phase, not hidden inside the application build.

---

## 19. First implementation objective

The first implementation shall prove the shortest coherent path through the existing architecture.

It shall not attempt to implement every future feature.

The first application should demonstrate:

1. a common entry;
2. a reusable project-class mechanism;
3. User 1 Alcove Insert as a functioning reference path;
4. Picnic Table as a second structural test of the same mechanism;
5. basic native rendering of bounded project geometry;
6. evidence/input adapter seams for future outside imagery and plans;
7. governed state rather than duplicated gate logic;
8. Store resolution rather than application-owned supply/capability logic;
9. clear current simulation limits;
10. project and part identity sufficient to support later lifecycle work.

The Picnic Table implementation may initially be thinner than the Alcove implementation.

However, the application architecture is not accepted as reusable merely because a second class name can be displayed.

The second class must exercise enough different structure to demonstrate that the framework is genuinely reusable.

---

## 20. Deferred capability

The first build does not need to complete:

- unrestricted project authoring;
- general CAD;
- production-quality phone scanning;
- every plan/CAD import format;
- generalized parametric-class authoring UI;
- automatic interpretation of every outside image or plan;
- network-wide Store routing;
- production authorization;
- live machine motion;
- remote Cycle Start;
- PLC/controller implementation;
- commissioned physical machine safety systems;
- the full final machine capability universe;
- compound-miter capability;
- full replacement-part commerce;
- every future project class.

These are deferred, not abandoned.

The first build must preserve a coherent path toward them.

---

## 21. Build acceptance

The first application architecture shall not be considered successful unless:

- the new application contains no new `Sarah` identity;
- useful behavior from the recovered guided-tour ancestor is preserved where still valid;
- the app can represent more than one bounded project class without duplicating its architecture;
- User 1 can move through the Alcove proof path coherently;
- the Picnic Table can demonstrate meaningful parameter-to-part consequences through the same framework;
- the app contains a basic native rendering/project-definition surface rather than requiring external CAD for every ordinary interaction;
- outside plans, images, drawings, or scans can be represented architecturally as evidence inputs without being promoted automatically to fabrication truth;
- user-supplied, derived, Store-supplied, machine-local, and unresolved facts remain distinguishable;
- unavailable or incompatible Store conditions remain visible and stop/defer appropriately;
- project geometry that exceeds the actual machine capability envelope does not silently pass;
- the first machine is represented as bounded capability rather than universal capability;
- changed configurations do not silently inherit authorization from a canonical fixture;
- WorkPacket is not treated as machine control;
- no application path creates a live-motion command;
- no application action expands Store or Cell capability;
- simulation is only requested where currently authorized;
- project and part identities survive the immediate configuration screen;
- prototype terminology does not override current authoritative terminology;
- unresolved engineering is displayed or deferred rather than invented.

---

## 22. Review and subsequent planning

Pass 1 is documentation and source stabilization only: verify the pins, commit the source map, make supported documentation corrections, commit the stabilization report, state readiness, and stop. It does not select a framework, rendering engine, adapter library, schema, or implementation sequence.

Before any later application code:

1. read this file completely;
2. read the pinned Governed Reference;
3. read the pinned Store sources;
4. read the pinned Cell spine;
5. inspect the recovered guided-tour implementation ancestor;
6. inspect the public prototype only after the controlling sources are understood;
7. compare this build contract against those sources.

Return first:

- any actual contradiction between this contract and the pinned sources;
- any app-blocking ambiguity;
- any missing ownership boundary;
- any legacy terminology that would contaminate the build;
- what prior implementation can be safely preserved;
- what prior implementation must be discarded;
- the smallest correction required and its proper owning layer.

The following belong to the next explicitly scoped application-planning pass:

- the minimum reusable project-class abstraction supported by the evidence;
- the minimum native rendering/input capability required for the first build;
- the minimum adapter boundary for outside plans, drawings, scans, and imagery;
- the shortest coherent implementation sequence;
- acceptance tests for that sequence.

Do not broaden the architecture.

Do not create new authority to close a gap.

Do not write production-motion capability.

Do not infer machine capability that has not been declared.

Once the build contract and source stack are coherent, report readiness for the next single bounded planning pass. Do not automatically proceed into planning or implementation.

---

## 23. Governing principles

**Do not compress engineering truth to simplify the application.**

Compress the interface to that truth.

**Simple, bounded machine functions should support broad product variety through upstream definition and geometry.**

Do not claim universal machine capability.

**Imported evidence is not automatically fabrication truth.**

Preserve provenance, unresolved conditions, and authority.

The first application succeeds when a user can experience Scan-to-Build simply while the underlying distinctions remain intact.

---

## 24. Safety invariant

**NO BLOOD ON WOOD**
