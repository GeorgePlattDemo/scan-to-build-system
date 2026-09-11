# ADR-0013 Canonical fixture immutability

Status: accepted

Context: Fixtures are conformance contracts.

Decision: Governed fixture files are byte-hashed in INTEGRITY.json. Substantive change requires a new versioned directory.

Consequences: CI fails on missing, extra, or changed governed files.

Does not establish: semantic equivalence across formatting tools unless bytes match.

Affected: fixtures/*/INTEGRITY.json, scripts/verify-fixtures.ts
