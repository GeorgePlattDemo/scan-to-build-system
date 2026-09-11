# SECURITY

- Do not disclose a suspected safety-control or authorization bypass in a
  repository issue, pull request, discussion, or public message.
- Send the repository owner a minimum private notice identifying the affected
  file or boundary without including reproduction details. Establish an agreed
  private channel before transmitting exploit steps, sensitive fixtures, or
  proof-of-concept material.
- GitHub private vulnerability reporting may be used only after the repository
  owner has enabled and confirmed it in repository settings.
- Do not file public issues that describe how to start machine motion or how to promote SimulationAuthorization.
- v0.2 has no production secrets. Absence is intentional.
- Fixtures contain no credentials.
- CI must fail if a live-motion command exporter or production issuer appears under `packages/`.
- There is no network service in M1. Process-local files only.

Receipt of a report does not establish a production vulnerability, machine-
safety certification issue, or duty to deploy a physical remedy. Findings are
classified against the implemented M1 simulation-only boundary.
