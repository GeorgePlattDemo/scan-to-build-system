# Application-current source library

This bucket preserves current/post-app application planning and boundary documents from the accepted application lineage.

These files are retained because they contain useful build doctrine, semantic cleanup, reusable application structure, and explicit layer boundaries. They do not override the later accepted Build-8 implementation where planning language and implementation differ.

## Source

Primary source repository: `GeorgePlattDemo/grok-file`.

Accepted application pin used for this library: `4595b4785a2686486e477ce2e70fb3f476285a8d`.

Several files retain older branch/pin references inside their original text because they are exact historical/current-source snapshots. Those references are provenance, not repinning of the new system repository.

## Reading posture

- `STB-SEMANTIC-BOUNDARIES-0.1.md` carries the recent language cleanup and is the strongest application-level terminology source in this bucket.
- `STB-APP-STABILIZATION-0.1.md` is valuable for explicit preserve/discard decisions and unresolved-boundary tracking.
- `STB-APP-STRUCTURE-0.1.md` preserves the reusable application thinking that preceded the accepted first vertical; read as planning/reference, not as a command to rebuild the accepted app.
- architecture files under `architecture/` preserve boundary thinking. They remain subject to current owner-layer documents and the accepted application implementation.

The frozen master roadmap remains separately pinned because its full file is large; see `../oversize-pointers/` when present.
