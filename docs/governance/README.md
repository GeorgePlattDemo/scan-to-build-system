# Governance Foundation

**Status:** current documentary foundation admitted from the verified Governed Reference baseline.  
**Source repository:** `GeorgePlattDemo/scan-to-build-governed-reference`  
**Source pin:** `18949f163718a937f072f4be3a654bb303e53160`

This directory carries forward the governance guidance that is solid enough to work from after the accepted application build.

It does not merge the Governed Reference runtime into the application. It preserves the documentary rules, implementation boundaries, review discipline, and current reference limitations that future work must respect.

## Reading order

1. [`source/README-GOVERNED-REFERENCE.md`](source/README-GOVERNED-REFERENCE.md) — what the governed reference is and is not.
2. [`source/STB-BUILD-M1.md`](source/STB-BUILD-M1.md) — first bounded implementation/build discipline.
3. [`CONTROLLING-SOURCE-POINTERS.md`](CONTROLLING-SOURCE-POINTERS.md) — exact identities for the large controlling REF and PLAN documents and other large guidance not yet copied byte-for-byte.
4. [`architecture/current-simulation-authority.md`](architecture/current-simulation-authority.md) — current M1 authority mechanism and limitations.
5. [`reference-node/README.md`](reference-node/README.md) — bounded reference-yard behavior and limitations.
6. [`architecture/architecture-boundary.md`](architecture/architecture-boundary.md) — what the static boundary check proves and does not prove.
7. [`corrections/G-I0-COMPOSITION-0.1.md`](corrections/G-I0-COMPOSITION-0.1.md) — exact I0 composition clarification.
8. [`source/GOVERNANCE.md`](source/GOVERNANCE.md), [`source/REVIEWING.md`](source/REVIEWING.md), [`source/SECURITY.md`](source/SECURITY.md), and [`source/THREAT_MODEL.md`](source/THREAT_MODEL.md) — governance and review discipline.

## Authority rule

These files retain the role stated by their source documents. Copying them here does not broaden their authority.

- `STB-REF-0.2.5` controls governed domain semantics for its stated version.
- `STB-PLAN-0.2.5` controls its activation sequence.
- `STB-BUILD-M1` controls the bounded M1 implementation actions; it does not amend REF semantics.
- Current implementation notes describe the accepted governed baseline at the pinned source commit.
- Informative architecture notes remain informative unless a later controlling plan/build explicitly activates them.

## Current governed capability

The current governed baseline supports only the bounded, inspectable, simulation-only paths stated by its source documents. Production authorization remains unavailable. Simulation evidence is not production authority. Physical fabrication, machine safety certification, structural adequacy, first-fit accuracy, code compliance, and commercial operation are not implied.

## Safety

**NO BLOOD ON WOOD.**

I0 remains non-waivable. A cleaner working repository does not weaken refusal, unresolved-condition, human-authority, simulation/production, or machine-boundary distinctions.

## Legacy/demo boundary

No Sarah/demo behavior is admitted here merely because an earlier prototype visually completed a chain. Governed meanings come from this current documentary baseline, not from the historical demo.
