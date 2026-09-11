# Patent Source Manifest

This file records the identities of the issued patent PDFs being made primary sources in this repository.

## User-supplied reference copies

These are the exact PDFs supplied by George for this consolidation session.

| Patent | Uploaded file | SHA-256 |
| --- | --- | --- |
| U.S. 9,720,401 B2 | `US9720401(20260911-175950).pdf` | `d6ff401ee0a60720c0d8b9819a0f828e15036deee1882da06dab7282da0311a4` |
| U.S. 10,768,609 B2 | `US10768609(1).pdf` | `3fd23f9dab7419098162836af25257d2736771bf27196824ad972b479a02b092` |

These hashes identify the exact conversation reference copies. They are retained here so any later repository copy can be compared rather than assumed identical.

## Intended repository paths

- `docs/patents/source/US9720401B2.pdf`
- `docs/patents/source/US10768609B2.pdf`

The repository-side import workflow resolves the full issued PDFs from the public Google Patents publication pages and writes repository SHA-256 values to:

- `docs/patents/source/SHA256SUMS.txt`

If the repository PDF bytes differ from the user-supplied reference hashes, do not treat that alone as a substantive patent difference. Confirm publication number, issued document content and pages. Different hosting/production copies of the same issued grant may have different binary hashes.

## Issued-source identity

### U.S. Patent 9,720,401 B2

- title: `METHOD AND SYSTEM FOR CONSUMER HOME PROJECTS ORDERING AND FABRICATION`
- issued: August 1, 2017
- application: 14/094,074
- filed: December 2, 2013
- issued claims: 18

### U.S. Patent 10,768,609 B2

- title: `METHOD AND SYSTEM FOR CONSUMER HOME PROJECTS ORDERING AND FABRICATION`
- issued: September 8, 2020
- application: 15/645,392
- filed: July 10, 2017
- continuation of application 14/094,074, now U.S. 9,720,401
- issued claims: 15

## Source rule

These full issued documents are primary evidence for patent wording and technical patent correspondence.

Parsed text, claim maps, architecture notes and demonstrations are useful indexes. They do not replace the issued documents.
