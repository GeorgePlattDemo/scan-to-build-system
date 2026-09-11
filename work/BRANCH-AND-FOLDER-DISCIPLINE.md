# Branch and Folder Discipline

Use folders to define durable ownership and reading surfaces. Use branches to isolate bounded changes.

Do not use long-lived topic branches as permanent document storage.

Recommended future planning branches:

- `plan/user-1-0.1`
- `plan/store-1-0.1`
- `plan/dimensional-machine-0.1`
- `plan/sheet-machine-0.1`
- `plan/research-cell-0.1`

When a bounded plan is accepted, its controlling/current document should return to `main` with provenance and a clear status.

Historical or rejected branches remain recoverable through the archive/provenance process; they should not be required reading for ordinary current work.
