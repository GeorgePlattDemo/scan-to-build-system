# Branch cleanup ledger — 6 October 2026

**Purpose:** inventory the three repositories' non-default branches and propose a preservation route before pruning.

**Status:** proposed documentation only. This ledger creates no tags, deletes no branches and grants no execution authorization. Recheck the live refs before a separately authorized cleanup.

**Inspection:** refreshed on 7 October 2026 UTC (6 October in America/New_York). The tables record tips at inspection, not immutable final tips; the two documentation PR branches will advance when this correction is committed.

**Standing instruction:** [System AGENTS.md](../../AGENTS.md) requires pins and checkpoints to be tags, with one branch per task. [START-HERE.md](../../START-HERE.md) requires historical pins to remain recoverable. The earlier visible-build reconciliation is historical evidence, not the authority for this pass.

## Snapshot

| Repository | Main at inspection | Non-default branches |
| --- | --- | ---: |
| scan-to-build-system | `4a5533e81ef004868531925fde6fbb58f2dfdb0f` | 116 |
| 3d-solutions-program | `dbd5afedb7df3ce7caefc322dc4b70b3bd5de918` | 7 |
| scan-to-build-store | `83d9253b179f92acde8879ebea93e0dbcd8c508b` | 36 |

The 159 rows below comprise **60 deletion candidates whose tips are on main**, **94 proposed tag-and-delete rows**, and **5 branches required by open PRs**. A tag-and-delete row can also be on main when it carries a named historical checkpoint.

## How to read the proposed actions

- **Keep — open PR head or base.** Retain both sides of an open PR. System #7 uses `build/machine-controller-sim-safety-0.1` as its head and `build/app-operational-jobs-0.1` as its base. Program #26, Store #29 and System #201 also have open head branches.
- **Delete after recheck — tip is on main.** The recorded tip is an ancestor of that repository's inspected main. Before deletion, confirm that the live tip still matches, is still an ancestor of live main, has no open PR dependency, and has no unresolved branch-name link or checkpoint requirement.
- **Tag; update named references; then delete.** A provenance, genealogy, migration or baseline record names the branch. Preserve the exact inspected tip under the proposed tag and replace any live branch-name dependency with the tag or a reachable commit permalink before deleting the branch. Being named in a historical record is not a reason to retain a work branch indefinitely.
- **Tag; then delete.** The exact tip is outside main. Preserve it under the proposed tag before deleting, including when its PR is closed or merged. A closed PR alone does not prove its work is incorporated in main.

All tag names below are **proposed**, not evidence that tags exist. Create and verify each tag in its owning repository; never replace an existing tag that points elsewhere. Before removing a branch, compare its live tip with the inspected SHA and recheck open head and base dependencies. If either has changed, stop on that row and reassess it.

PR numbers are context, not preservation proof. “Different tip” means the inspected branch tip differs from the PR's recorded head. GitHub offers restoration of a closed PR's head branch, but this plan preserves tips outside main with explicit tags rather than relying only on that facility. A SHA written in this document does not itself retain a commit. Restore from a verified tag or a commit still reachable from main.

## Required Store identities

The current System runtime pin remains unchanged. Preserve the historical and proof identities explicitly before removing branches that carry them.

| Role | Store commit | Preservation requirement |
| --- | --- | --- |
| Current runtime, owned by System `STORE_PIN` | `9c62d9d6f7775deef83d47196d32c9b5174a352c` | Already an ancestor of inspected Store main; leave the runtime pin and deployment path unchanged. |
| Frozen Review / earlier runtime | `39a1b318063f62220c9c20c42200389098e0c687` | Outside Store main. Verify tag `archive/fix/alcove-demand-driven-store-0.1` at this exact SHA before removing its branch. |
| Published-job / canonical S-001 proof | `4402abeb6b0299a5b6db2eec85ed04c3b0236bcc` | Outside Store main. Verify a dedicated tag `archive/pins/published-job-store-4402abeb6b02` at this exact SHA before pruning any branch that carries it. Tags at descendant branch tips do not replace this exact identity record. |
| Historical accepted Stage-2 baseline | `b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d` | Already on Store main. Verify tag `archive/stage-2-store-zero-reference` and resolve named references before removing that checkpoint branch. |

Four rows previously marked for archiving are already on main: System's `build/app-configurator-engine-0.1-checkpoint`, `build/app-picnic-donor-0.2` and `build/app-picnic-donor-0.2-docs`, and Store's `build/d001-travel-standard-0.1`. Their corrected actions do not require archive tags solely for reachability; the checkpoint and reference rechecks above still apply.

Open PRs at inspection are System #7 and #201, Store #29, and Program #26. This ledger changes none of their states. If the owner later merges #29 and #201, reassess those two head branches using their new tips and merge results.

## scan-to-build-system

| Branch | Tip at inspection | PR | Proposed action |
| --- | --- | --- | --- |
| `build/app-configurator-engine-0.1` | `8730c801d3cd2df193d8647b3de1e78fffeea62a` | #5 | Tag `archive/build/app-configurator-engine-0.1`; update named references; then delete |
| `build/app-durable-jobs-0.1` | `62bf1ab1caf975ef7ca8cdc6d35c03d81bb08e79` | #8 | Tag `archive/build/app-durable-jobs-0.1`; update named references; then delete |
| `build/app-intake-authority-0.1` | `ba5048b4841d107372613e30309a1ef908f8dc42` | — | Tag `archive/build/app-intake-authority-0.1`; update named references; then delete |
| `build/app-operational-jobs-0.1` | `17b950d6a4901b682ca5843e4df3e5d2af2985be` | #6 | Keep (open PR #7 base) |
| `build/global-completion-path-0.1` | `b0caba518aa0e152fa107fe89267ab48ee81296f` | #10 | Tag `archive/build/global-completion-path-0.1`; update named references; then delete |
| `build/machine-controller-sim-safety-0.1` | `b23b2a95f71c89347bdf5c465369b7399b75e834` | #7 | Keep (open PR #7 head) |
| `build/s001-canonical-configurator-0.1` | `1fe12d6e564045e6136750906b4e2206cf2e3898` | #9 | Tag `archive/build/s001-canonical-configurator-0.1`; update named references; then delete |
| `build/sheet-mode2-storezero-0.1` | `0fc232e30843a67ed47c64c7a232c9980ff11e54` | #4 | Tag `archive/build/sheet-mode2-storezero-0.1`; update named references; then delete |
| `docs/baseline-reconciliation-0.1` | `1621d2ea146a248d200ecba59f4b87034a1b1cd5` | #11 | Tag `archive/docs/baseline-reconciliation-0.1`; update named references; then delete |
| `promote/current-baseline-0.1` | `1621d2ea146a248d200ecba59f4b87034a1b1cd5` | #12 | Tag `archive/promote/current-baseline-0.1`; update named references; then delete |
| `build/start-own-picnic-leg-0.1` | `f8616767c8e0010ad9da2052167686ce84a04698` | #36 | Tag `archive/build/start-own-picnic-leg-0.1`; then delete |
| `docs/project1-direct-review-links-0.1` | `1cf2d047cceddb2d158e06a953c9dc154c7c4bce` | #190 | Tag `archive/docs/project1-direct-review-links-0.1`; then delete |
| `reconcile/canonical-app-0.1` | `6f341ded660b62ac1e6344abc61f9c7d36771338` | #35 | Tag `archive/reconcile/canonical-app-0.1`; then delete |
| `repair/demand-driven-stock-sequence-0.1` | `ba1bf0649c05d01b6f6c90c529f42546b4953aae` | #41 | Tag `archive/repair/demand-driven-stock-sequence-0.1`; then delete |
| `window-seat-price-under-drawing` | `7c4a86879934c43f403173e831b5c07f86e7a27c` | #126 | Tag `archive/window-seat-price-under-drawing`; then delete |
| `build/alcove-store-integration-0.1` | `cc54ef2a177f76e1ee1220153f13d02c43d57aa9` | #43 | Delete after recheck (tip is on main) |
| `build/d001-travel-standard-0.1` | `900dbd13f079f8a5f8d76d49c723fd35279164e8` | — | Delete after recheck (tip is on main) |
| `build/definition-contract-0.1` | `b4058f60a536445b26c8ad5682266ecdf54e938c` | — | Delete after recheck (tip is on main) |
| `build/hosted-store-zero-runtime-0.1` | `cb19dce1660df5c119eca6a21faaf49a1b1099c5` | #45 | Delete after recheck (tip is on main) |
| `build/project-owned-journey-routing-0.1` | `d0419127eed9d0a92e791a276e3a8e8ce03cdd91` | #19 | Delete after recheck (tip is on main) |
| `build/s001-playhouse-project-0.1` | `afb5db9a8bfc0110b67bd054cebd3f3819b3bd30` | — | Delete after recheck (tip is on main) |
| `chore/repin-open-system-build-0e074de5` | `f0bf9486c3ebe4f9fb488c476e9ed406aeefae6d` | #25 | Delete after recheck (tip is on main) |
| `chore/repin-open-system-build-23e97635` | `fb9d89f1de1b116235b28df587da6e9b6d538750` | #24 | Delete after recheck (tip is on main) |
| `chore/repin-open-system-build-73a12f63` | `5d1bd7fc63dd435665a6147797dedb2407ad9e53` | #27 | Delete after recheck (tip is on main) |
| `chore/repin-open-system-build-7bb9bb0d` | `a519a55041f82193425d6e700e433a6edcf82cec` | #26 | Delete after recheck (tip is on main) |
| `chore/repin-start-own-0.10` | `bb19aa223449eab68fdf8c3abee2dd64fec6708d` | #31 | Tag `archive/chore/repin-start-own-0.10`; then delete |
| `chore/repin-window-seat-0.7.4` | `1f235894846c8a3e5ac74afb227b79634bb47d2a` | #30 | Delete after recheck (tip is on main) |
| `cleanup/public-snapshot-deadwood-0.1` | `c4faf63e37c440c809708f3013ebcfcf3cf3a5c6` | #57 | Tag `archive/cleanup/public-snapshot-deadwood-0.1`; then delete |
| `cleanup/retired-donor-authority-pointers-0.1` | `85f868568517ed03c269f965566573c444cad827` | #56 | Tag `archive/cleanup/retired-donor-authority-pointers-0.1`; then delete |
| `deploy/open-system-build-0d2ae5f` | `c739d32b7458892b06917ff8252636ba50962c54` | #50 | Delete after recheck (tip is on main) |
| `deploy/open-system-build-417f663` | `bcad78d78b0c032a89e27b56dcc6755fb5aaabb5` | #49 | Delete after recheck (tip is on main) |
| `deploy/open-system-build-4ce8cb8` | `ca9dd1e60e982bf7dd5103c0e994f15d3bfc9e34` | #51 | Delete after recheck (tip is on main) |
| `deploy/open-system-build-4fbf6c8` | `440553eda7eab47c9949bb0a34185d2ae0387349` | #48 | Delete after recheck (tip is on main) |
| `deploy/open-system-build-7b26dfc` | `c1127aeba3c064395a334406d763738daaa694f6` | #55 | Tag `archive/deploy/open-system-build-7b26dfc`; then delete |
| `deploy/open-system-build-b094cb2` | `1b13275f76192604160c94c8f23bc80a076334dd` | #47 | Delete after recheck (tip is on main) |
| `deploy/open-system-build-fdeb20a` | `16b51b422cc919bb189f83ce76a202086c899853` | #52 | Delete after recheck (tip is on main) |
| `deploy/store-zero-railway-0.1` | `58471122d8940461ba8b389a223f468490e140b5` | — | Delete after recheck (tip is on main) |
| `docs/accepted-baseline-status-0.1` | `c30980fffce7d0bf283cacd65fec5fcea5f5af2e` | #13 | Delete after recheck (tip is on main) |
| `docs/alcove-store-connection-course` | `0abedaecb42d5540a767e76de85ca53b9df2c3e8` | — | Delete after recheck (tip is on main) |
| `fix/accepted-baseline-plumbing-0.1` | `f502965d9c7af31c18243c39d7589faaead96992` | #14 | Delete after recheck (tip is on main) |
| `fix/alcove-actor-handoff-final-0.1` | `57faa90325fa3a734a30fd1a88a5e18468681f1d` | #29 | Delete after recheck (tip is on main) |
| `fix/alcove-commercial-journey-reconciliation-0.1` | `5e88cffe3b44f5a3024e307e69b78f01b3ab54ac` | #28 | Delete after recheck (tip is on main) |
| `fix/alcove-demand-driven-store-0.1` | `22bb9738436fa089935a45b8d75450f54b5134c2` | #46 | Delete after recheck (tip is on main) |
| `fix/current-build-pin-fb2c-0.1` | `aabdb10234b4157cf50a292448478559174cfccf` | #38 | Tag `archive/fix/current-build-pin-fb2c-0.1`; then delete |
| `fix/current-inner-cache-link-0.1` | `15cfdf62aa2a560af9849f4ffb73c7646cb9f817` | — | Delete after recheck (tip is on main) |
| `fix/front-door-clicks-link-0.1` | `bb4c27f5789391cf180caeb14bc1e4ee3b3c36a6` | — | Delete after recheck (tip is on main) |
| `fix/front-door-link-0.1` | `89dbd3a50a575a09dd6456d0a68748912cc4276d` | — | Delete after recheck (tip is on main) |
| `fix/front-door-native-link-0.1` | `e3a21f1f809ab1b057dd1eda2b94f3b073eb934d` | — | Delete after recheck (tip is on main) |
| `fix/job1-fresh-store-authority-0.1` | `da53a24135e4e753c44ef5e01b63bd72b95829f0` | — | Delete after recheck (tip is on main) |
| `fix/open-system-build-job1-nav-0.1` | `7743e50d9a8333697b12568e6545316744df73ff` | — | Delete after recheck (tip is on main) |
| `fix/start-own-store-sequence-plumbing-0.1` | `ed9c8c989a8e36debd662142f93eb1a08f69f539` | #37 | Tag `archive/fix/start-own-store-sequence-plumbing-0.1`; then delete |
| `fix/system-build-cache-bust-0.1` | `ac9f06dbd787e541e54bf28b7c3886b9ec6d70af` | — | Delete after recheck (tip is on main) |
| `fix/system-build-cache-bust-0.1-work` | `ac9f06dbd787e541e54bf28b7c3886b9ec6d70af` | — | Delete after recheck (tip is on main) |
| `fix/system-build-cache-bust-0.1a` | `ac9f06dbd787e541e54bf28b7c3886b9ec6d70af` | — | Delete after recheck (tip is on main) |
| `fix/system-build-cache-bust-active-0.1` | `ac9f06dbd787e541e54bf28b7c3886b9ec6d70af` | — | Delete after recheck (tip is on main) |
| `fix/system-build-cache-bust-final-0.1` | `ac9f06dbd787e541e54bf28b7c3886b9ec6d70af` | — | Delete after recheck (tip is on main) |
| `fix/system-build-cache-bust-use-this-0.1` | `be100d144a32d7f651a5c12d5e935c2576a7c354` | #15 | Tag `archive/fix/system-build-cache-bust-use-this-0.1`; then delete |
| `fix/system-build-cache-bust-working-0.1` | `ac9f06dbd787e541e54bf28b7c3886b9ec6d70af` | — | Delete after recheck (tip is on main) |
| `fix/window-seat-canonical-gate-journey-0.1` | `efcffd4b69dcd0cde79c41d740155d779fb37e65` | #22 | Delete after recheck (tip is on main) |
| `fix/window-seat-configure-store-seam-0.1` | `2fe7b0936e90586aea385ef15a44c52c27e32e1a` | #21 | Delete after recheck (tip is on main) |
| `fix/window-seat-full-dual-journey-0.1` | `314a8d13e5f7f4cb85fbeb707ecf2eb1340d149b` | #20 | Delete after recheck (tip is on main) |
| `fix/window-seat-gold-standard-journey-0.1` | `37f54d3f431eb04c1463fdf80ce150d52b9f8628` | #23 | Delete after recheck (tip is on main) |
| `fix/window-seat-layout-system-pin-0.1` | `0228ee9bd6d1d29f135f789007dcc55425ed6b4d` | #17 | Tag `archive/fix/window-seat-layout-system-pin-0.1`; then delete |
| `fix/window-seat-money-ops-system-pin-0.1` | `b1ad429c98ba2fa221d26ab95f25186371517367` | #18 | Tag `archive/fix/window-seat-money-ops-system-pin-0.1`; then delete |
| `fix/window-seat-shell-cache-pin-0.1` | `76bcc92b858b18ddc9d775ee56253b6d9b95c646` | #16 | Tag `archive/fix/window-seat-shell-cache-pin-0.1`; then delete |
| `housekeeping/front-door-truth-0.1` | `6bb4ed9aa5272399ce2dbf22f9299b6794ae67cb` | #53 | Tag `archive/housekeeping/front-door-truth-0.1`; then delete |
| `ignore-this` | `f4769bbf2daaf7e719b723478b7a24f3dfa1344a` | — | Delete after recheck (tip is on main) |
| `last-accidental` | `f4769bbf2daaf7e719b723478b7a24f3dfa1344a` | — | Delete after recheck (tip is on main) |
| `noop` | `f4769bbf2daaf7e719b723478b7a24f3dfa1344a` | — | Delete after recheck (tip is on main) |
| `promote/alcove-real-store-visible-0.1` | `dc5df047985d7b99b7440646d24350cac7af2b4f` | #44 | Delete after recheck (tip is on main) |
| `promotion/configure-store-zero-live-loop-0.1` | `b32bf67fc29d40558aadabd3494ed2419275c8bc` | #33 | Delete after recheck (tip is on main) |
| `promotion/configure-store-zero-real-wiring-0.2` | `8a5633496ed92dfbafed645252157f1fac6d141f` | #34 | Delete after recheck (tip is on main) |
| `promotion/store-convergence-current-surface-0.1` | `d11087861816065309af3947c6e691ff65585218` | #32 | Delete after recheck (tip is on main) |
| `reconcile/current-visible-build-0.1` | `19ce6525661f62f8f0b9ab89e3941c17c1568715` | #58 | Tag `archive/reconcile/current-visible-build-0.1`; then delete |
| `reconcile/job1-native-configure-0.1` | `b36cc226fd4c24005cbc8a7c672787a2c570dd30` | #60 | Tag `archive/reconcile/job1-native-configure-0.1`; then delete |
| `reconcile/visible-build-ownership-0.1` | `d0881390b85d2654e3026477f381e2715cc7ad96` | #59 | Tag `archive/reconcile/visible-build-ownership-0.1`; then delete |
| `repair/current-travel-docs-0.1` | `319a8f4f535a11047c48a371c47fa16e610c7bb0` | — | Delete after recheck (tip is on main) |
| `repair/job1-baseline-regressions-0.1` | `f72d79c3eefb68294959d2ab389dfc9b679ac3c9` | — | Delete after recheck (tip is on main) |
| `repair/start-own-authority-isolation-0.1` | `afb76e404f867ae17a3d114cf022287a44c1f350` | #39 | Tag `archive/repair/start-own-authority-isolation-0.1`; then delete |
| `repair/user1-store-envelope-convergence-0.1` | `62341f0cce614097b4f5a0e387be738192ea4a49` | #40 | Tag `archive/repair/user1-store-envelope-convergence-0.1`; then delete |
| `test-no-more` | `f4769bbf2daaf7e719b723478b7a24f3dfa1344a` | — | Delete after recheck (tip is on main) |
| `ux/job1-fun-restraint-0.1` | `68b03a3bdfe1b007f63fc20bb39582936670595f` | #54 | Tag `archive/ux/job1-fun-restraint-0.1`; then delete |
| `work/capability-bridge-0.1` | `1ce642fc5aba5a8b823d295dee19bf7246e73fdf` | #1 | Delete after recheck (tip is on main) |
| `work/transfer-app-4595b478` | `8517a7334039d839c4adce33af5a487396eb024f` | #3 | Delete after recheck (tip is on main) |
| `work/trial-protocol-0.1` | `75f90eeddaabb651ab54239ba13ca7df9734fe50` | #2 | Delete after recheck (tip is on main) |
| `app/outdoor-0.3` | `ec40775f000707404f375e6d89f1b5ebb2751b5c` | — | Tag `archive/app/outdoor-0.3`; then delete |
| `app/start-own-dev-notes` | `cae58cf01ed09a2f8cc6e6212cda786fe74a4e27` | — | Tag `archive/app/start-own-dev-notes`; then delete |
| `build/alcove-store-bridge-0.1` | `c6c4a0da5ef78f80ae00149a6e80bc8f3cdfda79` | — | Tag `archive/build/alcove-store-bridge-0.1`; then delete |
| `build/alcove-submission-response-0.1` | `4dc6ebbd20784ab8bdd9503f6b2204ca3dd50869` | — | Tag `archive/build/alcove-submission-response-0.1`; then delete |
| `build/app-configurator-engine-0.1-checkpoint` | `be0a90c5279824d193d31458b9ace2c97c7a98a8` | — | Delete after recheck (tip is on main) |
| `build/app-picnic-donor-0.2` | `be0a90c5279824d193d31458b9ace2c97c7a98a8` | — | Delete after recheck (tip is on main) |
| `build/app-picnic-donor-0.2-docs` | `be0a90c5279824d193d31458b9ace2c97c7a98a8` | — | Delete after recheck (tip is on main) |
| `build/d001-five-tool-0.1` | `cf4a8b376c39984abf1804fd2c2883a89430aea7` | — | Tag `archive/build/d001-five-tool-0.1`; then delete |
| `build/job1-bounded-16-18-0.1` | `380517b3a8fefbfacb00a76d1287aedaed38d662` | — | Tag `archive/build/job1-bounded-16-18-0.1`; then delete |
| `build/multi-account-project-ownership-0.1` | `cb861f7a01e619c3ca28d8fab9a5e3cc4bf961c8` | — | Tag `archive/build/multi-account-project-ownership-0.1`; then delete |
| `build/project-workstream-chassis-0.1` | `6b3bb36f077ea58f94bc560bc5bdf5a6a17ed304` | — | Tag `archive/build/project-workstream-chassis-0.1`; then delete |
| `build/start-own-claude-picnic-leg-0.1` | `04753c2b2f4bb13e1bcdf1b54fd77525c9f84707` | — | Tag `archive/build/start-own-claude-picnic-leg-0.1`; then delete |
| `build/store-d001-s001-system-integration-0.1` | `936cdb648d12fa13bfc0721f184f71b5224a7c39` | — | Tag `archive/build/store-d001-s001-system-integration-0.1`; then delete |
| `docs/project-completion-protocol-0.1` | `6b3fe4d64996ffbbf866b1e304a423f873a20ed7` | — | Tag `archive/docs/project-completion-protocol-0.1`; then delete |
| `fix/front-door-picnic-visual-paths-0.1` | `7b367d8d943f0d90e53270474ca12eb3fc56ddc2` | — | Tag `archive/fix/front-door-picnic-visual-paths-0.1`; then delete |
| `fix/job1-catalog-driven-store-integration-0.1` | `786d7bb7787fd1246d4dfb991d48ea7400eb1810` | #42 (different tip) | Tag `archive/fix/job1-catalog-driven-store-integration-0.1`; then delete |
| `fix/job1-main-baseline-0.1` | `f711bb89d5198b3f79d00eb63bd9a481718ca2a0` | — | Tag `archive/fix/job1-main-baseline-0.1`; then delete |
| `fix/open-system-build-job1-full-gates-0.1` | `a4fd614ff27084dd751a656b550b6f513c1d2332` | — | Tag `archive/fix/open-system-build-job1-full-gates-0.1`; then delete |
| `fix/restore-donor-flow-0.1` | `c475bd74fa3842d158cc2f1e8c0ef9a9035289e8` | — | Tag `archive/fix/restore-donor-flow-0.1`; then delete |
| `preview/current-ui` | `7943130eacfbfb80a2b784559110d91f6ffbbff5` | — | Tag `archive/preview/current-ui`; then delete |
| `quarantine/job1-full-gate-promotion-2026-09-22` | `a4fd614ff27084dd751a656b550b6f513c1d2332` | — | Tag `archive/quarantine/job1-full-gate-promotion-2026-09-22`; then delete |
| `recovery/app-operational-sheet-0.1` | `3a3c9558180c41901c1e213a7e2b494314879b20` | — | Tag `archive/recovery/app-operational-sheet-0.1`; then delete |
| `repair/user1-independent-acceptance-0.1` | `7fdf70ca948bfa0efad667d158993a4a1c12cf18` | — | Tag `archive/repair/user1-independent-acceptance-0.1`; then delete |
| `stabilize/controlled-app-baseline-0.1` | `94a33305498b9bd16534c6561cafe786c0f244d8` | — | Tag `archive/stabilize/controlled-app-baseline-0.1`; then delete |
| `stabilize/source-reconciliation-0.1` | `ae5ce2c1242f4cbc66ac20c50fdc4d2230a90d0d` | — | Tag `archive/stabilize/source-reconciliation-0.1`; then delete |
| `system/outdoor-admission-coverage` | `a5dc65c49a81e052f3d2dc22fe7d54254261c98d` | #152 (different tip) | Tag `archive/system/outdoor-admission-coverage`; then delete |
| `window-seat-two-pages` | `a560466a3cacf47e086aa4536faf09b44ffed1ee` | — | Tag `archive/window-seat-two-pages`; then delete |
| `work/store-zero-master-0.1` | `cc8489aece5ad2eb37ac07c5d0c4009abfae1404` | — | Tag `archive/work/store-zero-master-0.1`; then delete |
| `work/store-zero-modeled-catalog-0.1` | `0e7d0baa9b5bc9b227a730dffc601daf484fd72a` | — | Tag `archive/work/store-zero-modeled-catalog-0.1`; then delete |
| `work/store-zero-sheet-stock-0.1` | `9531642a854aaa3863a2162bad0d7415d943a0f9` | — | Tag `archive/work/store-zero-sheet-stock-0.1`; then delete |
| `docs/branch-cleanup-ledger-2026-10-06` | `b3c4d85ddc0612efced9be89156f45f8b58eb3fa` | #201 | Keep (open PR #201 head) |

## 3d-solutions-program

| Branch | Tip at inspection | PR | Proposed action |
| --- | --- | --- | --- |
| `organize/governed-reference-reconciliation-0.1` | `79126b12c8f5b794ca10e75c44533cc7ad4602bc` | #6 | Tag `archive/organize/governed-reference-reconciliation-0.1`; update named references; then delete |
| `organize/grok-reconciliation` | `560586bec1dc64cdbb38a0e7b8fb5c606de40670` | #2 | Tag `archive/organize/grok-reconciliation`; update named references; then delete |
| `organize/transfer-staging-retirement-0.1` | `bdc030fe40f0b64385fe5215e172965845e90cb7` | #5 | Tag `archive/organize/transfer-staging-retirement-0.1`; update named references; then delete |
| `research/d001-project1-reference-q-0.1` | `89f0b0e7d0cc1c8d873ab9bb660482019779be81` | #26 | Keep (open PR #26 head) |
| `housekeeping/program-enforcement-truth-0.1` | `196dd64965d9572d65bcab7efde5a557d45bc473` | #3 | Tag `archive/housekeeping/program-enforcement-truth-0.1`; then delete |
| `organize/canonical-definitions-0.1` | `baca9eb8ce30d16e14431530986a40b4aafe0670` | #4 | Tag `archive/organize/canonical-definitions-0.1`; then delete |
| `organize/first-admission-and-gates` | `d82e761c50de80436714ea79d1822f595d9f8f7a` | #1 | Tag `archive/organize/first-admission-and-gates`; then delete |

## scan-to-build-store

| Branch | Tip at inspection | PR | Proposed action |
| --- | --- | --- | --- |
| `build/sheet-mode2-storezero-0.1` | `d8281bde4649edf9afe22a205838cdb642a5af9a` | #1 | Tag `archive/build/sheet-mode2-storezero-0.1`; update named references; then delete |
| `docs/app-build-0.1-stabilization` | `f39a2e7cd482003d1f90d8bbdd543d4513578101` | — | Tag `archive/docs/app-build-0.1-stabilization`; update named references; then delete |
| `stage-2-store-zero-reference` | `b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d` | — | Tag `archive/stage-2-store-zero-reference`; update named references; then delete |
| `build/s001-centered-field-0.1` | `0da283c01ae9980b39c94e41437bf34340b7c337` | #2 | Tag `archive/build/s001-centered-field-0.1`; then delete |
| `docs/remove-project1-wrapper-0.1` | `aac08122d6fa60cebb5cf625af7a2e784e6b8cd4` | #27 | Tag `archive/docs/remove-project1-wrapper-0.1`; then delete |
| `fix/machine-station-alignment` | `838ae2ad77ec2517209c726c28f761e43297cc0a` | #11 | Tag `archive/fix/machine-station-alignment`; then delete |
| `repair/catalog-and-pricing-policy` | `fee79e4e9265412c4d2ad838305234441b66ae27` | #6 | Tag `archive/repair/catalog-and-pricing-policy`; then delete |
| `repair/demand-driven-stock-sequence-0.1` | `f5c76ceb9c9964033887821e39978d7128d802e2` | #5 | Tag `archive/repair/demand-driven-stock-sequence-0.1`; then delete |
| `repair/reality-bar-no-invented-economics` | `dcc949a680b20af66b418f0a4c99facd55dde20e` | #7 | Tag `archive/repair/reality-bar-no-invented-economics`; then delete |
| `build/alcove-store-request-0.1` | `bacbc9a08c6fa5dba3d7fc2b9fd0982646c3e5ed` | #9 | Delete after recheck (tip is on main) |
| `cleanup/definition-ownership-0.1` | `075a64a322be8a6ac7243b4fa318676f8442248b` | #12 | Tag `archive/cleanup/definition-ownership-0.1`; then delete |
| `fix/alcove-demand-driven-store-0.1` | `39a1b318063f62220c9c20c42200389098e0c687` | #10 | Tag `archive/fix/alcove-demand-driven-store-0.1`; then delete |
| `fix/durable-dimensional-sku-resolution-0.1` | `289f6e8641f13093efbd6922cbd18749e9d9adc8` | #8 | Tag `archive/fix/durable-dimensional-sku-resolution-0.1`; then delete |
| `fix/fresh-store-evaluation-0.1` | `f88ccaf9a2624899e255e66b51111e2b02309dad` | — | Delete after recheck (tip is on main) |
| `fix/start-own-board-sequence-pricing-0.1` | `473d5b88fbda7cadd8f2a12e7603fad152457064` | #3 | Delete after recheck (tip is on main) |
| `repair/user-defined-board-semantics-0.1` | `70a42a1d753077f98e2bf30a03dbc24fa2f85966` | #4 | Tag `archive/repair/user-defined-board-semantics-0.1`; then delete |
| `build/alcove-browser-store-authority-0.1` | `3ceb666521cd6abe14de77269d7ec6c8ea2f015a` | — | Tag `archive/build/alcove-browser-store-authority-0.1`; then delete |
| `build/alcove-whole-parent-0.1` | `2cb41231f7facecd3f212fb5d4efe572a96354ae` | — | Tag `archive/build/alcove-whole-parent-0.1`; then delete |
| `build/bounded-workpiece-growth-0.1` | `87c4d2187d051a577ab301acfa12f2c12a6880ea` | — | Tag `archive/build/bounded-workpiece-growth-0.1`; then delete |
| `build/d001-downstroke-miter-0.1` | `c66363597ed9b5ed355220d5599e726730cd2802` | — | Tag `archive/build/d001-downstroke-miter-0.1`; then delete |
| `build/d001-five-tool-0.1` | `3e1f9f2c18668de86d92c6ccae7e79d3cadd35a1` | — | Tag `archive/build/d001-five-tool-0.1`; then delete |
| `build/d001-travel-standard-0.1` | `95c639a1d0d4812df097ad1eb628594b38f921de` | — | Delete after recheck (tip is on main) |
| `build/store-d001-s001-combined-0.1` | `096e99d645d745b1670185f46c75de75f9e59661` | — | Tag `archive/build/store-d001-s001-combined-0.1`; then delete |
| `build/store-published-jobs-0.1` | `0023b39a9a59c7cd2c882627c78ef59236f553e4` | — | Tag `archive/build/store-published-jobs-0.1`; then delete |
| `build/store-zero-canonical-0.1` | `f88ec61c42446755d00259f88e7fd09f2702fd92` | — | Tag `archive/build/store-zero-canonical-0.1`; then delete |
| `build/window-seat-recovery-0.1` | `9f2000d09b5104bad051919c4e20284f6d9a0776` | — | Tag `archive/build/window-seat-recovery-0.1`; then delete |
| `fix/d001-cutoff-hold-support-presentation-0.1` | `582afd22aef6a1909f2160957c58f6694351cac1` | — | Tag `archive/fix/d001-cutoff-hold-support-presentation-0.1`; then delete |
| `fix/full-length-edge-mill-reference-0.1` | `d22a32c8cd97519b43527162e426e9ae30adc23c` | — | Tag `archive/fix/full-length-edge-mill-reference-0.1`; then delete |
| `fix/full-length-supported-handling-0.1` | `bb6a05ef11459809a520e77bdfd0b39e420af225` | — | Tag `archive/fix/full-length-supported-handling-0.1`; then delete |
| `fix/window-seat-chipload-feed-0.1` | `f0c9d8c571befbb13e3e3acac3255c0c5ed7a595` | — | Tag `archive/fix/window-seat-chipload-feed-0.1`; then delete |
| `fix/window-seat-recovery-rounding-0.1` | `f88ec61c42446755d00259f88e7fd09f2702fd92` | — | Tag `archive/fix/window-seat-recovery-rounding-0.1`; then delete |
| `repair/enforced-store-contract` | `70c681fe82450785567cf60f3b6151d35d9c027a` | — | Tag `archive/repair/enforced-store-contract`; then delete |
| `repair/fixed-spot-depth-0.1` | `7303793620d0ceda509810a661d11e6c31c7d59f` | — | Tag `archive/repair/fixed-spot-depth-0.1`; then delete |
| `stabilize/store-reconciliation-0.1` | `c0a34c180dfd39960f1c90d773f7954e4bd73a1b` | — | Tag `archive/stabilize/store-reconciliation-0.1`; then delete |
| `wip/cut-001-end-to-end-reference-0.1.1` | `a6c7bef784c0468555735a1ad620d163aae9feea` | — | Tag `archive/wip/cut-001-end-to-end-reference-0.1.1`; then delete |
| `docs/top-level-map-20261006` | `5d8fdf7e3ae6a63e40c363d14462b44d8c621bf8` | #29 | Keep (open PR #29 head) |

**NO BLOOD ON WOOD.**
