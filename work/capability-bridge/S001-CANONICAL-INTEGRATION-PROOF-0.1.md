# S-001 Canonical Integration Proof 0.1

**Status:** exact Store-backed application integration proof completed  
**Scope:** published-job runtime only; durable Review/Record promotion remains separate  
**Physical execution authority:** false  
**Controller output produced:** false  
**Safety invariant:** **NO BLOOD ON WOOD**

## Evidence inputs

Application source was taken from the successful GitHub Actions artifact produced from:

- repository: `GeorgePlattDemo/scan-to-build-system`
- branch: `build/s001-canonical-configurator-0.1`
- source artifact run: `34779733370`
- artifact source commit: `88c8c402afa74b8f76b52074292e0ae2394e9625`
- artifact: `stb-app-source`

The application published-job contract pins Store to:

`GeorgePlattDemo/scan-to-build-store@4402abeb6b0299a5b6db2eec85ed04c3b0236bcc`

An exact Store Git bundle for that functional commit was produced by Store CI. The bundle was cloned into a separate checkout, detached at exactly `4402abeb6b0299a5b6db2eec85ed04c3b0236bcc`, and verified clean with `git status --porcelain` empty before execution.

The Store branch CI independently passed the arched S-001 envelope tests, base S-001 envelope tests, and D-001 control tests before the integration run.

## Executed integration command

From the application source artifact:

```text
STB_STORE_PUBLISHED_JOBS_ROOT=<exact-clean-4402-checkout> \
  node ops/run-published-job.mjs --all
```

The application runner therefore imported the real Store module from the exact clean pinned checkout. No Store evaluator, catalog, or answer was copied into the application source for this proof.

## Result summary

The runtime payload reported:

```text
kind = scan-to-build-published-job-trial
storePin = 4402abeb6b0299a5b6db2eec85ed04c3b0236bcc
physicalExecutionAuthorized = false
controllerOutputProduced = false
```

All three bounded published jobs returned `SUPPORTABLE`:

### Square 2×4

- job: `square-stick`
- envelope: `D001-STAGE2-ENVELOPE-0.2`
- status: `SUPPORTABLE`
- pricing status: `BUDGETARY_ESTIMATE`
- modeled `T_job_min = 9.486`
- material = `$3.13`
- modeled cell recovery = `$50.81`
- total budgetary `Q = $53.94`
- not a commercial quote or physical fabrication result.

### Rectangular sheet stencil

- job: `rect-stencil`
- job type: `SHEET_MODE2_STENCIL_V1`
- envelope: `S001-MODE2-STENCIL-V1`
- status: `SUPPORTABLE`
- evidence class: `REFERENCE`
- physical status: `NOT_CLAIMED`
- commissioned: `false`
- pricing status: `BUDGETARY_MATERIAL_ONLY`
- material-only `Q = $57.82`
- `processQ_status = UNRESOLVED`.

### Canonical centered arched sheet

- job: `arched-opening`
- project class: `S001_CENTERED_ARCHED_SHEET_V0`
- job type: `SHEET_MODE2_ARCHED_APERTURE_V0`
- Store envelope: `S001-MODE2-ARCHED-APERTURE-V0`
- status: `SUPPORTABLE`
- evidence class: `REFERENCE`
- physical status: `NOT_CLAIMED`
- commissioned: `false`
- Store work field: `S001-CENTER-WORK-FIELD-V0`
- work field: `48 in` horizontal × `36 in` vertical
- complete requested profile inside field: `true`
- full-sheet reserved margin outside field: `24 in` each long-axis end, `6 in` top/bottom
- canonical opening margin inside work field: `6 in` left/right, `0 in` top/bottom
- Store-derived circular-segment radius: `19.5 in`
- requested tabs: `4`
- planned tabs: `5`
- tab policy: `S001-STENCIL-TAB-POLICY-V0`
- physical retention status: `NOT_MEASURED`
- pricing status: `BUDGETARY_MATERIAL_ONLY`
- material-only `Q = $26.55`
- `processQ_status = UNRESOLVED`.

## Raw runtime evidence identity

The complete JSON runtime payload used for this proof was `22,166 bytes` and had SHA-256:

`17a525a7bb6605cdfcf6873166966c0bebbaa0652721c527076f2b866695c4c5`

The project record does not need to retain every low-level machine event. This proof records the consequential identities, dispositions, envelope facts, derived geometry, tab-plan summary, pricing basis, and authority state.

## Negative behavior already exercised at the Store owner

Store branch tests also exercise fail-closed behavior for the arched family, including:

- request exceeding the centered working field → `REFUSED` with `CENTER_WORK_FIELD_EXCEEDED`;
- parent too small to contain the canonical field → `REFUSED` with `CENTER_WORK_FIELD_OUTSIDE_PARENT`;
- route depth above the published envelope → `REFUSED`;
- missing/invalid retained tabs → `REFUSED` or unresolved as declared;
- machine-local language such as G-code → `REFUSED`;
- missing curve information → `UNRESOLVED`;
- dimensional stock on S-001 → `REFUSED`.

The application preview does not clamp an out-of-field request. It may warn locally, but the unchanged demand still goes to Store so the Store-owned gate remains authoritative.

## What this proves

This proof establishes that the current application published-job layer can load the exact pinned Store implementation and carry the canonical S-001 requirement through the real Store evaluator to a reproducible bounded Store result without inventing machine-local or physical authority.

It does **not** establish:

- physical machine commissioning;
- measured tab holding strength;
- measured cycle time for S-001;
- a complete fabrication price for S-001;
- controller-in-the-loop validation;
- physical execution authority;
- durable project Review/Record completion for the S-001 project.

## Remaining promotion gate

The canonical arched project is not “fully plugged in” until this exact proven Store path is connected through the existing durable application custody chain:

```text
candidate revision
→ Store request
→ Store attempt
→ Store response / estimate
→ Review
→ Result
→ Record
→ export / import / reopen
```

That promotion must reuse the existing durable semantics and may not weaken Store gates, invent price/process evidence, or create controller/physical authority.
