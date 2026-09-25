import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const alcove=fs.readFileSync('system-build-base-8d8a9dd.html','utf8');
const bridge=fs.readFileSync('stb-alcove-store-bridge.js','utf8');
new vm.Script(bridge,{filename:'stb-alcove-store-bridge.js'});
const seat=fs.readFileSync('stb-window-seat-space-utilization-0.7.4.html','utf8');

// Alcove: one bounded option, off by default, derived from existing shelf elevations.
assert.match(alcove,/pilotShelves:false/);
assert.match(alcove,/id="c-pilot-shelves"/);
assert.match(alcove,/3\/16 in pilot spots at shelf elevations/);
assert.match(alcove,/window\.STBAlcoveShelfPilotDemand/);
assert.match(alcove,/kind:'SPOT_ON_LOCATION'/);
// One spot per upright per shelf: four uprights, so four spots per shelf elevation.
assert.match(alcove,/\[1,2,3,4\]\.map\(u=>/);
assert.match(alcove,/targetComponentId:componentId/);
assert.match(alcove,/targetRole:u<=2\?'LEFT_UPRIGHT':'RIGHT_UPRIGHT'/);
assert.match(alcove,/partRelativeXIn:sh/);
assert.match(alcove,/reference:'FROM_BASE'/);
assert.match(alcove,/acrossWidthRule:'INSET_FROM_EDGE'/);
assert.match(alcove,/insetFromEdgeIn:alcove\.spotInsetIn/);
assert.match(alcove,/ALCOVE_SPOT_INSETS_IN=\[1\.5,2\]/);
assert.match(alcove,/name="spot-inset" value="1\.5"/);
assert.match(alcove,/name="spot-inset" value="2"/);
assert.match(alcove,/3\/16 in wide and 3\/16 in deep, measured after the drill point/);
assert.match(alcove,/toolDiameterIn:0\.1875/);
assert.match(alcove,/basis:'DERIVED_FROM_SHELF_ELEVATION'/);
assert.match(alcove,/id="p-pilot"/);
assert.match(alcove,/id="r-pilot"/);
assert.match(alcove,/pilotFeatures\.length\+' × 3\/16 in SPOT_ON_LOCATION/);
assert.match(alcove,/<circle cx="'\+\(x0\+1\.75\)/);
assert.match(alcove,/<circle cx="'\+\(x1-1\.75\)/);

// Alcove no longer owns Store price, cycle, availability, or Q.
assert.equal(alcove.includes('STORE_FIXTURE'),false);
assert.equal(alcove.includes('RECOVERY[across]'),false);
assert.equal(alcove.includes('CYCLE[across]'),false);
assert.match(alcove,/stb-alcove-store-bridge\.js/);
assert.match(alcove,/requestAlcoveStore\(x/);
assert.match(alcove,/MILL_LONGITUDINAL_PROFILE/);
assert.match(alcove,/no local fallback/);
assert.equal(bridge.includes('http://localhost:4317/api/store-zero/job'),false);
assert.match(bridge,/stb-store-runtime\.json/);
assert.match(bridge,/STORE_RUNTIME_NOT_DEPLOYED/);
assert.match(bridge,/STORE_RUNTIME_ENDPOINT_INVALID/);
assert.match(bridge,/ALCOVE_INSERT_V1/);
assert.match(bridge,/expectedStorePin/);
assert.match(bridge,/STORE_CORRELATION_ERROR/);
const programStart=alcove.indexOf('function alcoveComponentPrograms');
const programEnd=alcove.indexOf('function alcoveDefinitionSignature',programStart);
assert.ok(programStart>=0&&programEnd>programStart,'Alcove component-program translator missing');
const componentPrograms=vm.runInNewContext('('+alcove.slice(programStart,programEnd).trim()+')');
const depth14=componentPrograms(65,14,44,5);
const depth11=componentPrograms(65,11,44,5);
assert.equal(depth14.length,19);
assert.equal(depth14.filter(component=>component.features.some(feature=>feature.kind==='MILL_LONGITUDINAL_PROFILE')).length,5);
assert.equal(depth11.length,14);
assert.equal(depth11.filter(component=>component.features.some(feature=>feature.kind==='MILL_LONGITUDINAL_PROFILE')).length,0);
// Spots travel inside each upright's own component program, which is where Store Zero reads them.
const spots=[12,24].flatMap((sh,idx)=>[1,2,3,4].map(u=>({featureId:'ALCOVE-UPRIGHT-0'+u+'-SPOT-0'+(idx+1),kind:'SPOT_ON_LOCATION',targetComponentId:'ALCOVE-UPRIGHT-0'+u,xIn:sh,acrossWidthRule:'INSET_FROM_EDGE',insetFromEdgeIn:2,reference:'FROM_BASE'})));
const spotted=componentPrograms(65,14,44,2,spots);
const uprights=spotted.filter(component=>/UPRIGHT/.test(component.componentId));
assert.equal(uprights.length,4);
assert.ok(uprights.every(component=>component.features.length===2&&component.features.every(feature=>feature.kind==='SPOT_ON_LOCATION'&&feature.insetFromEdgeIn===2&&!('reference' in feature)&&!('targetComponentId' in feature))));
assert.equal(spotted.filter(component=>/SHELF/.test(component.componentId)).every(component=>component.features.every(feature=>feature.kind!=='SPOT_ON_LOCATION')),true);
assert.equal(/materialTotal|machine_service\s*=|sellingPrice\s*\*/.test(bridge),false,'transport bridge contains Store calculation logic');
assert.match(alcove,/Store Zero must evaluate or refuse them; no local price path may absorb or suppress them/);
assert.equal(/stockLengthIn:72|stockLengthIn:96|STB-ZERO-HW-ALCOVE-PACK-001/.test(alcove),false,'Alcove definition contains stale Store-owned stock or SKU decisions');
assert.match(alcove,/selectionAuthority:'STORE_ZERO'/);
assert.match(alcove,/requirementId:'ALCOVE-PINS-AND-SCREWS'/);

// Window Seat: same concept, derived from the actual generated tower shelf datums.
assert.match(seat,/shelfPilotSpots:false/);
assert.match(seat,/id="c-shelf-pilot"/);
assert.match(seat,/shelfDatums=\[\]/);
assert.match(seat,/shelfDatums\.push\(r3\(y\)\)/);
assert.match(seat,/shelfDatums\.push\(r3\(datum\)\)/);
assert.match(seat,/shelfPilotDemand:\{enabled:P\.shelfPilotSpots/);
assert.match(seat,/kind:'SPOT_ON_LOCATION'/);
assert.match(seat,/targetOccurrenceId:upright\.id/);
assert.match(seat,/partRelativeXIn:r3\(y\)/);
assert.match(seat,/reference:'FROM_BASE'/);
assert.match(seat,/acrossWidthRule:'CENTERED_ON_WIDE_FACE'/);
assert.match(seat,/toolDiameterIn:0\.1875/);
assert.match(seat,/basis:'DERIVED_FROM_CONFIGURED_SHELF_ELEVATION'/);
assert.match(seat,/operationId:'OP-SHELF-PILOT-SPOTS-316'/);
assert.match(seat,/mode:'SPOT_ON_LOCATION'/);
assert.match(seat,/basis:'GENERATED FROM CONFIGURATION'/);
assert.match(seat,/not a generic finished-hole request/);
assert.match(seat,/current Window Seat price does not absorb this new operation; Store migration remains required/);
assert.match(seat,/def\.shelfPilotDemand\.features\.forEach/);
assert.match(seat,/fill="#2f6f9e"/);

// The local legacy adapter has no special priced branch for the new shelf pilot operation;
// it therefore reaches the declared UNRESOLVED fallback instead of being silently priced.
assert.equal(/if\(o\.operationId==='OP-SHELF-PILOT-SPOTS-316'\)/.test(seat),false);
assert.match(seat,/no declared service line for this request at this pin — the Store answers it, this page does not invent it/);

// Alcove now routes the option to Store for evaluation; Window Seat remains unmigrated.
assert.match(alcove,/pricingStatus:alcove\.pilotShelves\?'STORE_EVALUATION_REQUIRED':'NOT_REQUESTED'/);
assert.match(seat,/pricingStatus:P\.shelfPilotSpots\?'UNPRICED_UNTIL_STORE_MIGRATION':'NOT_REQUESTED'/);

console.log('PASS · Alcove and Window Seat expose optional shelf-elevation SPOT_ON_LOCATION demand without inventing Store pricing');
