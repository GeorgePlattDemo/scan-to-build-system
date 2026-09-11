# M1 hardening and sealing change register

## 0.2.5-m1.2 sealing

| Defect | Files | Evidence |
| --- | --- | --- |
| Sealed authorization decision | `packages/policy/src/index.ts`, `packages/authority/src/index.ts`, `packages/engine/src/index.ts` | `tests/adversarial/sealing.test.ts` |
| Explicit simulation command | `packages/commands/src/index.ts`, engine command branch | sealing tests 13–19 |
| Adapter authenticity | `packages/sim-adapter/src/index.ts`, `assertUsableSimulationAuthorization` | sealing test 20 |
| Boundary checker extension | `scripts/check-boundaries.ts`, `docs/architecture-boundary.md` | `check:import-graph` |
| CI permissions | `.github/workflows/m1.yml` | contents: read |
| Professional files | `.nvmrc`, `.editorconfig` | Node 20 declaration |

## 0.2.5-m1.1 hardening

Maps each requested defect to the files that implement the correction.

| Defect | Files | Tests / evidence |
| --- | --- | --- |
| 1 Reproducible installation | `package.json` (workspaces removed; pinned versions), regenerated `package-lock.json` | `npm ci --no-audit --no-fund` on clean extract; lockfile hash unchanged |
| 2 Type-safe build | `tsconfig.json`, `packages/model/src/{types,validate}.ts`, engine/authority/sim-adapter/inspector typed results | `npm run build` |
| 3 Fail-closed orchestration | `packages/engine/src/index.ts`, `packages/policy/src/index.ts` | adversarial suite; `runM1Slice` blocked kind |
| 4 Authorization issuance | `packages/authority/src/index.ts`, simulation-authorization schema | issuer tests 14–16, 28 |
| 5 Default-deny commands | `packages/commands/src/index.ts`, `gLive` | tests 19–24 |
| 6 Bounded simulation vocabulary | `packages/sim-adapter/src/index.ts`, execution-event schema | tests 25–26 |
| 7 Gate diagnostics | `packages/gates/src/index.ts` | `tests/unit/gates.test.ts` |
| 8 Adversarial tests | `tests/adversarial/blocking-paths.test.ts` | 28 named behaviors |
| 9 Import / architecture check | `scripts/check-boundaries.ts`, `scripts/check-import-graph.ts`, `docs/architecture-boundary.md` | `tests/negative/import-graph.test.ts` |
| 10 CI | `.github/workflows/m1.yml` | ordered ci/build/validate/test/run/inspect/graph |
| 11 Inspector | `apps/inspector/src/{read-model,cli}.ts` | `tests/conformance/inspector.test.ts` |
| 12 Patent treatment | `legal/patents/README.md`; PDFs removed | bibliography + reviewed SHA-256 |
| 13 Status / claims | `README.md`, `CHANGELOG.md`, `FINAL-VALIDATION-REPORT.md`, `MODULE-INVENTORY.md`, `STB-BUILD-M1.md` | permitted claim only |
