import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const alcove=fs.readFileSync('system-build-base-8d8a9dd.html','utf8');
const bridge=fs.readFileSync('stb-alcove-store-bridge.js','utf8');
new vm.Script(bridge,{filename:'stb-alcove-store-bridge.js'});
const seat=fs.readFileSync('stb-window-seat-0.8.html','utf8');
const seat9=fs.readFileSync('stb-window-seat-0.9.html','utf8');

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
// Transport lives in the one shared client; the Alcove bridge only shapes Alcove's request.
const client=fs.readFileSync('stb-store-client.js','utf8');
assert.equal(bridge.includes('http://localhost:4317/api/store-zero/job'),false);
assert.equal(client.includes('http://localhost:4317/api/store-zero/job'),false);
assert.match(bridge,/STBStoreClient/);
assert.match(bridge,/ALCOVE_INSERT_V1/);
assert.match(client,/stb-store-runtime\.json/);
assert.match(client,/STORE_RUNTIME_NOT_DEPLOYED/);
assert.match(client,/STORE_RUNTIME_ENDPOINT_INVALID/);
assert.match(client,/expectedStorePin:config\.storePin/);
assert.match(client,/STORE_CORRELATION_ERROR/);
assert.match(client,/STORE_PIN_MISMATCH/);
const runtime=JSON.parse(fs.readFileSync('stb-store-runtime.json','utf8'));
assert.match(runtime.storePin,/^[0-9a-f]{40}$/);
assert.match(alcove,/stb-store-client\.js/);
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

// Window Seat: same concept, derived from the actual generated tower shelf datums,
// sent to the live Store inside each board's own part (cut-package spots). No local price path.
assert.match(seat,/spots:\{on:false,rule:'INSET_FROM_EDGE',inset:1\.5\}/);
assert.match(seat,/id="c-spots"/);
assert.match(seat,/id="c-spot-place"/);
assert.match(seat,/shelfDatums=\[\]/);
assert.match(seat,/shelfDatums\.push\(r3\(y\)\)/);
assert.match(seat,/shelfDatums\.push\(r3\(datum\)\)/);
assert.match(seat,/rule:'CENTERED_ON_WIDE_FACE',inset:null/);
assert.match(seat,/rule:'INSET_FROM_EDGE',inset:1\.5/);
assert.match(seat,/rule:'INSET_FROM_EDGE',inset:2\}/);
assert.match(seat,/acrossWidthRule:place\.rule/);
assert.match(seat,/insetFromEdgeIn=place\.inset/);
assert.match(seat,/if\(spots\[r\.id\]&&spots\[r\.id\]\.length\)part\.spots=spots\[r\.id\]/);
assert.match(seat,/fill="#2f6f9e"/);
// The Store answers; the page carries no Store catalog, price rule or recovery model.
assert.match(seat,/stb-store-client\.js/);
assert.match(seat,/requestType:'CUT_PACKAGE_V1'/);
assert.equal(/sellingPrice\s*\*|list_reference|RECOVERY|FIXTURE|onHand/.test(seat),false,'Window Seat page contains Store-owned price, stock or recovery logic');

// Window Seat 0.9 (the live page): the same spots, but spot facing is a knob added by hand on the intent page and
// only turned on the bench. No placement is assumed until one is picked.
assert.match(seat9,/\{id:'SPOTS',opt:'spots'/);
assert.match(seat9,/spots:\{rule:null,inset:null\}/);
assert.match(seat9,/data-add="'\+k\.opt\+'"/);
assert.match(seat9,/id="c-spot-place"/);
assert.match(seat9,/if\(K\('SPOTS'\)\|\|K\('XSPOT'\)\)/);
assert.match(seat9,/shelfDatums=\[\]/);
assert.match(seat9,/shelfDatums\.push\(r3\(y\)\)/);
assert.match(seat9,/shelfDatums\.push\(r3\(datum\)\)/);
assert.match(seat9,/rule:'CENTERED_ON_WIDE_FACE',inset:null/);
assert.match(seat9,/rule:'INSET_FROM_EDGE',inset:1\.5/);
assert.match(seat9,/rule:'INSET_FROM_EDGE',inset:2\}/);
assert.match(seat9,/acrossWidthRule:place\.rule/);
assert.match(seat9,/insetFromEdgeIn=place\.inset/);
assert.match(seat9,/if\(spots\[r\.id\]&&spots\[r\.id\]\.length\)part\.spots=spots\[r\.id\]/);
assert.match(seat9,/fill="#2f6f9e"/);
assert.match(seat9,/stb-store-client\.js/);
assert.match(seat9,/requestType:'CUT_PACKAGE_V1'/);
assert.equal(/sellingPrice\s*\*|list_reference|RECOVERY|FIXTURE|onHand/.test(seat9),false,'Window Seat 0.9 contains Store-owned price, stock or recovery logic');

console.log('PASS · Alcove and Window Seat send optional shelf-elevation SPOT_ON_LOCATION demand to the Store without inventing Store pricing');
