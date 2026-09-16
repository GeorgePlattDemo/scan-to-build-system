from pathlib import Path

p = Path('work/capability-bridge/TRIAL-LOG.md')
s = p.read_text()
anchor = '| --- | --- | --- | --- | --- | --- | --- |\n'
row = "| 2026-09-15 | uniform project/workstream entry chassis | every actor and every newly created or resumed project reaches the same Projects → Project workstreams gate before project-specific intake or machine work | FAIL (source inspection) | APP-CONSTRAINT | app | `/begin` currently reorders start/resume content by actor and create/resume routes go directly to `destinationView`; no durable dimensional/sheet workstream summary exists. Amend only app presentation, routing, and project index metadata; preserve the Board vertical, Store, review, record, and machine authority. |\n"
assert anchor in s
assert row not in s
p.write_text(s.replace(anchor, anchor + row, 1))
