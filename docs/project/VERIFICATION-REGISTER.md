# Verification Register

**Purpose:** tie current project claims to exact proof and prevent inference beyond that proof.  
**Scope:** current accepted baseline, current application candidate, and parallel machine-safety candidate.  
**Rule:** PASS proves only the stated claim under the stated pins and boundaries.

| Claim | App / system pin | Store / other pin | Proof | Status |
| --- | --- | --- | --- | --- |
| transferred accepted application tree exists in this repository | `main` ancestry through merged PR #3; source `4595b4785a2686486e477ce2e70fb3f476285a8d` | Stage-2 Store path `b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d` when Store is used | merged PR #3; transfer/provenance records | PROVEN FOR ACCEPTED TRANSFER BASELINE |
| current promotion chain starts from frozen configurator candidate | `8730c801d3cd2df193d8647b3de1e78fffeea62a` | path-specific | PR #6 base identity | PROVEN |
| D-001 / Board published-job path executes in the bounded published-job runner | current candidate code proof `dee4a307cf0866ac0985da92dfb5f74045ee90f9` | `4402abeb6b0299a5b6db2eec85ed04c3b0236bcc` for the exact post-polish regression | `work/capability-bridge/TRIAL-LOG.md`; exact trial JSON hash `027427b40b9b5d1ec19d65bf5cbdec0da7263cb9210765efbb863d1d3bdf53fa` | PROVEN AS REFERENCE / STORE-BACKED SOFTWARE PATH |
| rectangular sheet published job executes in the bounded published-job runner | `dee4a307cf0866ac0985da92dfb5f74045ee90f9` | `4402abeb6b0299a5b6db2eec85ed04c3b0236bcc` | same exact post-polish trial | PROVEN AS REFERENCE / STORE-BACKED SOFTWARE PATH |
| canonical S-001 centered-arch job executes against exact Store pin | `dee4a307cf0866ac0985da92dfb5f74045ee90f9` | `4402abeb6b0299a5b6db2eec85ed04c3b0236bcc` | PR #9 integration proof; PR #10 post-polish exact trial; trial JSON SHA-256 above | PROVEN AS REFERENCE / STORE-BACKED SOFTWARE PATH |
| canonical S-001 parent-field reserve is 24 in left/right and 6 in top/bottom | current candidate | `4402abeb6b0299a5b6db2eec85ed04c3b0236bcc` | exact Store-backed result in PR #9 and retained post-polish regression in PR #10 | PROVEN FOR CURRENT CANDIDATE |
| canonical S-001 opening margins inside the 48 × 36 work field are 6 in left/right and 0 in top/bottom | current candidate | `4402abeb6b0299a5b6db2eec85ed04c3b0236bcc` | PR #9 exact Store-backed proof | PROVEN FOR CURRENT CANDIDATE |
| durable S-001 custody survives candidate revision → Store request → attempt → response → review → result/record → export/import/reopen | `dee4a307cf0866ac0985da92dfb5f74045ee90f9` | expected Store pin `4402abeb6b0299a5b6db2eec85ed04c3b0236bcc` | PR #10 browser/candidate checks, including durable S-001 custody and archive behavior | PROVEN IN CURRENT CANDIDATE SOFTWARE |
| stale/imported historical Store requests cannot be retried as current live requests | `dee4a307cf0866ac0985da92dfb5f74045ee90f9` | path-bound | PR #10 browser regressions; trial log retry-history row | PROVEN IN CURRENT CANDIDATE SOFTWARE |
| malformed or authority-bearing published answers are quarantined rather than promoted | `dee4a307cf0866ac0985da92dfb5f74045ee90f9` | expected Store pin `4402abeb6b0299a5b6db2eec85ed04c3b0236bcc` | PR #10 response-firewall regressions | PROVEN IN CURRENT CANDIDATE SOFTWARE |
| declared 10-second transport timeout is enforced | `dee4a307cf0866ac0985da92dfb5f74045ee90f9` | n/a | PR #10 browser regression after the source-inspection failure was corrected | PROVEN IN CURRENT CANDIDATE SOFTWARE |
| completion state cannot override Store refusal | `dee4a307cf0866ac0985da92dfb5f74045ee90f9` | path-bound | PR #10 completion hardening regressions | PROVEN IN CURRENT CANDIDATE SOFTWARE |
| operator may not promote completion, inspection, staging, custody, closeout, Store override, or production state | `dee4a307cf0866ac0985da92dfb5f74045ee90f9` | n/a | `completion-contract.mjs`; completion unit/browser tests; PR #10 scope | PROVEN IN CURRENT CANDIDATE SOFTWARE |
| mandatory physical label point cannot be disabled or moved later by published Store content | `dee4a307cf0866ac0985da92dfb5f74045ee90f9` | path-bound | PR #10 completion hardening regressions | PROVEN IN CURRENT CANDIDATE SOFTWARE |
| machine fail-closed safety kernel blocks modeled unsafe start/restart/bypass conditions | parallel PR #7 `b23b2a95f71c89347bdf5c465369b7399b75e834` | n/a | 14/14 local tests; GitHub Actions run `34775027294` recorded in PR #7 | PROVEN IN PARALLEL SIMULATION CANDIDATE |
| controller-in-loop execution | — | — | no controller-in-loop proof | NOT VALIDATED |
| commissioned D-001 physical production | — | — | no commissioning / measured production proof | NOT CLAIMED |
| commissioned S-001 physical production | — | — | no commissioning / measured production proof | NOT CLAIMED |
| S-001 tab-retention strength | — | — | current Store result reports `NOT_MEASURED` | NOT MEASURED |
| S-001 drilling | — | — | explicitly excluded from PR #10 round | NOT ADMITTED |
| physical execution authority | — | — | current app/Store/machine claims remain false | NOT AUTHORIZED |
| live commercial inventory, payment, reservation, or binding quotation | — | — | no live commercial proof in current candidate | NOT ESTABLISHED |

## Interpretation rules

1. An exact Store-backed PASS does not establish physical fabrication.
2. A modeled or reference machine result does not establish commissioning, guarding adequacy, stopping performance, workholding strength, PL/SIL/category, or measured production economics.
3. A current-candidate proof does not promote the candidate to the accepted repository baseline.
4. A historical PASS remains evidence for its exact pin, but later descendants control where they expressly correct an earlier statement.
5. A failure row in the trial log that was later corrected remains useful defect history; it is not the current state once a later exact regression proves the correction.
6. When a claim cannot be tied to an exact identity and proof, classify it as `UNVERIFIED`, `NOT MEASURED`, `NOT ADMITTED`, `NOT VALIDATED`, or `NOT CLAIMED` rather than filling the gap with architecture intent.

**NO BLOOD ON WOOD.**
