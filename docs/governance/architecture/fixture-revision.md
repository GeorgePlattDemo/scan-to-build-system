# Fixture revision

Canonical fixtures are byte-identity contracts.

To change governed bytes:

1. Keep the existing versioned directory unchanged.
2. Create a new directory such as `fixtures/A-SHELF-SIM-PASS-MIN.v2/`.
3. Generate a new INTEGRITY.json excluding that file.
4. Update tests and the fixture register.
5. Record the approval in CHANGELOG.md.

Formatting or property-order changes fail byte-integrity verification.
