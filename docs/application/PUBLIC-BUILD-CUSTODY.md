# Public-build custody

Consumed: YES

By what, exact paths:

- `apps/stb/test/unit/public-build-source-manifest.test.mjs` directly reads `apps/stb/public-build/SOURCE-MANIFEST.json` and verifies every manifest-listed file under `apps/stb/public-build/` byte-for-byte against the pinned Review source blobs.
- `apps/stb/README.md` documents `apps/stb/public-build/` as the exact public Review composition preserved from the pinned Review commit and links the current visible build.
- `README.md` exposes **OPEN SYSTEM BUILD** through the public Review deployment; this route does not currently load `apps/stb/public-build/` from System, but it is the visible build whose preserved dependency closure is held there for reconciliation.
- `.github/workflows/app-candidate-checks.yml` runs the unit-test suite containing the custody test; the workflow does not deploy or load `apps/stb/public-build/` directly.

Pinned Review commit: `7b26dfc45c9832271840d134426e096787156a04` in `GeorgePlattDemo/scan-to-build-review`.

Keep / replace-with-pointer / delete-later: **Keep**.

One-line reason: The preserved public-build checkpoint is still directly consumed by a current System unit test and remains the recoverable byte-identity source for Review-to-System reconciliation; no replacement pointer has been proven yet.
