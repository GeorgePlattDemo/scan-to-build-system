# S-001 Mode-2 Controls Reference 0.1

**Status:** REFERENCE controls stack under the already-declared Mode-2 kinematic contract  
**Evidence class:** REFERENCE  
**Physical status:** NOT CLAIMED  
**Does not replace:** Store pin `ca6a6e01`, `SHEET_MODE2_STENCIL_V1`, `SHEET_MODE2_ARCHED_APERTURE_V0`, or the kinematic pages

The Mode-2 REFERENCE machine can be implemented with commercially obtainable closed-loop servo hardware, deterministic local motion-control hardware, and an inspectable open-source control environment capable of coordinated X/Y interpolation; application and Store remain upstream and machine-neutral, while safety functions remain independently engineered.

This file names classes and current official sources. It does not freeze SKUs, write controller code, or assign safety authority to open-source software.

## Preferred research stack

| Layer | Selection | Why it fits | Official source |
| --- | --- | --- | --- |
| Local compute | Commodity x86 PC running Linux with Preempt-RT | Local, inspectable, no cloud dependency | LinuxCNC 2.9 docs: https://linuxcnc.org/docs/html/ |
| Motion environment | LinuxCNC 2.9.x uspace | Current stable line (docs cite 2.9.10). Coordinated mode plus CIRCLE trajectory class | https://linuxcnc.org/documents/ ; https://linuxcnc.org/docs/html/user/user-concepts.html |
| Interpolation class | LinuxCNC coordinated motion; G2/G3 circular interpolation in the controller | Official G2/G3 arc in the XY plane is the interpolation class that can follow the 19.5 in segment. App and Store do not emit G-code | https://linuxcnc.org/docs/html/gcode/g-code.html |
| Hardware interface | Mesa HostMot2 over Ethernet (`hm2_eth`) | FPGA step/dir, encoder, PWM, GPIO; official LinuxCNC driver lists 7i96S | https://linuxcnc.org/docs/html/man/man9/hostmot2.9.html ; Ubuntu `hm2_eth(9)` |
| Candidate I/O card | Mesa 7i96S class Ethernet FPGA | Five buffered differential step/dir channels, field I/O, HostMot2 firmware | Mesa 7i96S manual |
| Alternate analog servo card | Mesa 7i77-class analog ±10 V + encoder | If the research fixture uses analog servo amplifiers instead of step/dir drives | Mesa 7i77 literature; HostMot2 PWM/encoder modules |
| Real-time boundary | LinuxCNC motion controller is a realtime component (`motmod`, `tpmod`) | Process control of X/Y interpolation and bounded Z lives here, not in the app | LinuxCNC developer / code notes |

## Alternate research stack

LinuxCNC + community-maintained EtherCAT HAL (`linuxcnc-ethercat` / lcec, current community home `linuxcnc-ethercat/linuxcnc-ethercat`) driving CiA 402-class servo drives. Use only if the research fixture is built around EtherCAT amplifiers. The original sittner repository is archived; do not treat it as current.

Machinekit is not the preferred path for this fixture. It is not required to make the 19.5 in segment computationally plausible.

## Language / toolchain boundary

| Layer | Environment | Role |
| --- | --- | --- |
| App / Store | existing JavaScript / ES modules | demand, envelope, audit |
| Machine-site translator | Python 3, non-real-time | later: turn a validated neutral requirement into a local motion plan. Not a servo loop |
| Motion control | LinuxCNC HAL + INI + realtime C motion controller | coordinated X/Y, bounded Z, homing, I/O |
| Hardware abstraction | HostMot2 HAL pins | step/dir or analog PWM, encoder, GPIO |
| Test / simulation | LinuxCNC AXIS / preview, plus the non-executable `mode2-reference-path` object in this repository | prove the segment can be represented without emitting G-code upstream |

Python is not the real-time servo loop. Rust is not required. C is present because that is the LinuxCNC motion controller, not because this program is writing C.

## Candidate component classes

CANDIDATE REFERENCE COMPONENT. Not SELECTED PRODUCTION COMPONENT.

| Function | Class | Representative current example | Unverified |
| --- | --- | --- | --- |
| Sheet X servo / motor | Closed-loop servo or closed-loop stepper sized later | industrial servo + drive, or stepper + encoder following error | torque, ratio, roller diameter |
| Sheet X feedback | Incremental encoder on motor; later independent sheet feedback if slip fails the segment test | quadrature encoder into HostMot2 | counts/rev, slip on 4-ply sheathing |
| Sheet X drive | Servo drive accepting step/dir or analog command | matching the chosen Mesa firmware | tuning |
| Tool Y servo / motor | Same class as X | same | travel vs 72 in blank |
| Tool Y linear drive | Rack-and-pinion on vertical ways, or equivalent ballscrew | disclosed pinion-on-ways class | pitch, backlash |
| Tool Y feedback | Motor encoder; later linear scale if required | HostMot2 encoder module | accuracy of the 19.5 in radius |
| Router / spindle | Commercial panel-router motor, 1/4 or 1/2 in collet | Safety Speed SR5 / SR5U literature: floating router, plunge/depth | bit, speed, load |
| Bounded Z | Mechanical or closed-loop plunge stop; Z is not a drawing axis | SR5 floating head as commercial existence proof of plunge/depth, not identity | plunge force, retract interlock |
| Motion controller | LinuxCNC + Mesa HostMot2 Ethernet | 7i96S class | commissioned latency |
| Local start / stop | Panel next to the machine; no remote Cycle Start | existing program rule | panel layout |
| Non-safety position sensing | Home switches, seat/yoke state inputs into ordinary I/O | HostMot2 GPIO | which switches |
| Simulation | LinuxCNC preview + reference path object | this repository `mode2-reference-path.mjs` | measured path |

## Commercial machine baseline

Safety Speed official literature establishes, as commercial practice and not as an identity map:

- H5 / H-series: vertical panel support, material rollers, guided carriage, 64 in class crosscut on a 10 ft frame
- SR5 / SR5U: saw + router on one vertical frame; floating router head for consistent depth; material rollers; TUV to UL/CSA on published models
- SpeedWorx class: powered panel / carriage positioning exists in the same manufacturer's line

Sources: https://safetyspeed.com/products/machines/saw-router-combos/sr5-panel-saw-and-router-combo/ ; SR5/SR5U literature PDF; H-series owner's manual tables.

Bounded Mode-2 delta still required:

- sheet itself as coordinated X through servo-controlled manipulating rollers / rotating yokes
- centerline tooling platform as coordinated Y
- bounded Z routing depth
- curvilinear two-dimensional geometry
- retained stencil attachment points

This is a vertical-panel Mode-2 reference architecture using established commercial machine functions. It is not a Safety Speed retrofit instruction and not an endorsement.

## Process control vs safety control

Process control may later command X/Y interpolation, homing, sequence state, and position monitoring.

Safety remains separate:

- emergency stop
- guard state
- unexpected motion
- loss of restraint / lost seat
- spindle containment
- electrical safety
- safe torque off where applicable
- restart prevention
- commissioning

LinuxCNC, HostMot2, Python, JavaScript, Store, and the application are not a safety case. A later certified safety implementation is an unresolved engineering dependency. NO BLOOD ON WOOD.

## Machine-site translator (defined, not implemented)

Input (machine-neutral): parent SKU, outer rectangle, circular-segment chord/rise/radius, route depth, stencil tab count, operation family, part identity.

Eventual local outputs: sheet-X motion, tool-Y motion, plunge/retract, tab interruptions, stop/release. No production postprocessor in this pass.

## First motion proof

If sheet-X and tool-Y cannot represent the 36 in chord / 12 in rise / 19.5 in radius segment together, Mode-2 curvilinear is not yet a machine fact. The non-executable reference path object in the application repository is only a representation proof. It is not permission to energize a fixture.
