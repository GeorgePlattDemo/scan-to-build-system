# Complete configurator / Store integration acceptance — 2026-09-22

Frozen before this pass changes Store, System, or active project behavior.

## Starting checkpoints

- System candidate: `37282a760b53e3959d8f18d72f37c068b206706a`
- Review candidate: `459d4c4e808cdfb06f32e53c2bb41ec569baa650`
- Store main: `ab8a4c5d470c310f27fef82683611622ab976168`

The active configurator inventory for this pass is:
- Start Your Own / User 1;
- Window Seat 0.7.4;
- Outdoor bounded source-backed build;
- Alcove frozen reference example;
- Sheet / S-001 Playhouse.

Historical donors and inactive pages are not implementation targets.

## Fixed 3/16 spot operation — expected truth

The operation is distinct from a layout mark, generic pilot hole, and finished drilled hole.

Required Store operation facts:
- operation identity: `SPOT_ON_LOCATION`;
- tool diameter: 0.1875 in;
- full-diameter penetration: 0.1875 in below the defined entry surface;
- depth reference: entry surface along the drilling axis;
- customer supplies/selects location, not routine depth programming;
- total tip penetration = full-diameter penetration + axial point length.

Independent source inspection found **no existing declared drill-point angle or axial point length** for the selected 3/16 tool. Therefore this pass must not invent either value.

Expected consequence until tooling geometry is declared:
- the Store operation record declares the 0.1875-in full-diameter penetration;
- point-angle / axial-point-length / total-tip-penetration remain explicit missing tooling facts;
- a spot request remains `UNRESOLVED` for physical depth lowering with a named tooling-geometry reason;
- missing location remains separately visible as `SPOT_LOCATION_REQUIRED`;
- no-spot demand creates no spot operation and no spot economics.

## Miter boundary

With otherwise complete demand and no unresolved spot tooling:
- 30° single-plane face miter → SUPPORTABLE;
- 45° → SUPPORTABLE;
- 46° → REFUSED by Store, not malformed by the application.

## Economics expectation

The prior $54.82 result belongs to the former depth-undefined spot operation at Store pin `ab8a4c5d...`.

The current fixed spot cycle time of 0.16 min has no source establishing that it remains valid for the newly depth-defined operation. Unless this pass finds such a source, its applicability is `UNRESOLVED`.

Resolved material and non-spot modeled work may remain visible as partial economics, but the candidate must not present $54.82 or another complete total as if the spot cycle were resolved.

## Active-path expectations

- Start Your Own: generated exact-pin Store runtime remains the sole capability/economics authority; same-version confirmation only.
- Window Seat: existing project-owned revision/request/answer journey remains intact; any browser evaluator must be shown reproducible/parity-checked against its declared Store source rather than trusted because it has the same formula.
- Outdoor: preserve its separate material/capability source; class-scoped economics remain unresolved unless a legitimate Store source already exists.
- Alcove: preserve the frozen example and native reference economics; Store capability/material consequences must be current during Configure without shared-contract repricing.
- Sheet / S-001: replace any hardcoded visible Store disposition/material amount with evidence returned from its exact published-job Store source; preserve partial process economics and its separate Store pin.

No project may inherit another project's answer, revision, Store pin, or economics model.

## Evidence rule

Acceptance uses exact Store checkouts, reproducible browser packages or real Store adapters, actual application routes, same-revision confirmation, before/after checks, and bounded fault injection.

No merge, deployment, or promoted-build repoint is authorized by this pass.
