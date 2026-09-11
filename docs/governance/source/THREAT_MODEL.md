# Threat model (M1)

| Threat | Control |
|---|---|
| Unauthorized packet authorization | Typed constructors; G-CONSENT; G-AUTH-TYPE; G-PKT-VER |
| Model output treated as measurement | assertionBasis=inferred cannot become verified; no model on authorization path |
| Scrape of private project text into aggregation | Owner visibility; no customer graph; M1 fixtures are synthetic |
| Replay of invalidated authorization | Packet version bind; superseded lifecycle fails G-PKT-VER |
| Simulated authorization promoted | Separate types; G-SIM-SEP; no production issuer module |
| Live motion via software | G-LIVE; remotes refused; sim-adapter rejects production auth |
