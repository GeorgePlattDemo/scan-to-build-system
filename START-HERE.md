# Start here

This is the working repository. Other Scan-to-Build repositories are provenance until this file says otherwise.

## Every session

1. Read this page.
2. Bench: [`work/capability-bridge/README.md`](work/capability-bridge/README.md)
3. Before changing the app or trying a new part: [`work/capability-bridge/TRIAL-PROTOCOL.md`](work/capability-bridge/TRIAL-PROTOCOL.md)
4. Log the row: [`work/capability-bridge/TRIAL-LOG.md`](work/capability-bridge/TRIAL-LOG.md)
5. Patents when the step touches disclosed relationships: [`work/capability-bridge/PATENTS.md`](work/capability-bridge/PATENTS.md)

Do not start in `grok-file`, the public exhibit, or a new demo folder.

## Run the accepted application

Tree is in [`apps/stb/`](apps/stb/). Source pin: `4595b4785a2686486e477ce2e70fb3f476285a8d`.

```text
cd apps/stb
npm ci --no-audit --no-fund
npx playwright install chromium
npm start
```

Open `http://localhost:4317` only. That origin is the storage origin.

Store evaluation against the Stage-2 pin:

```text
STB_STORE_ZERO_ROOT=<clean scan-to-build-store at 49d22ce4> npm start
```

Exact pin and copy notes: [`apps/README.md`](apps/README.md).

## What is current vs donor

| Need | Place |
| --- | --- |
| App | `apps/stb/` |
| Trial protocol | `work/capability-bridge/TRIAL-PROTOCOL.md` |
| Dimensional / sheet / Store surface | `work/capability-bridge/` |
| Physical Machine Build program | `work/machines/MACHINE-BUILD-PROGRAM-0.1.md` |
| Issued patents | `docs/patents/source/` |
| Atlas originals | `source-library/atlas-research/` (donor) |
| Project pins | `STB-PROJECT-STATE-AND-SOURCE-INDEX.md` |

## Do not

- Invent a second app to try an idea.
- Widen an envelope so a trial passes.
- Treat Store `SUPPORTABLE` as a cut.
- Delete old repositories until pins here resolve.

**NO BLOOD ON WOOD.**
