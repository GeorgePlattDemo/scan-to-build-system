from pathlib import Path
import re

p = Path('work/store/stb-store-zero-master-0.1.html')
s = p.read_text()
before = s

# Catalog identity moves to the modeled September 15 reference state.
s = s.replace("catalogClock:  '2026-09-10',", "catalogClock:  '2026-09-15',", 1)
s = s.replace("engine:        'STB-ZERO-PRICE-1 v0.2.2',", "engine:        'STB-ZERO-PRICE-1 v0.2.3',", 1)
anchor = "  commit:        '096e99d',\n\n  cells: {"
insert = """  commit:        '096e99d',

  catalogModel: {
    revision:       'STB-ZERO-CATALOG-2026-09-15-01',
    asOf:           '2026-09-15',
    priceMode:      'MODELED_REFERENCE',
    priceBasis:     'aggregate estimation from local and regional retail sampling as of September 15, 2026; exact-item observations where available, comparable retail sampling otherwise',
    sampleSources:  'Menards · Home Depot · Lowe\'s · regional hardwood/panel comparables',
    markOn:         1.05,
    inventoryMode:  'MODELED_TEST_INVENTORY',
    inventoryBasis: 'Store Zero test inventory, intentionally sufficient for ordinary bounded demonstrations; shortage is triggered only when a request exceeds a declared modeled count'
  },

  cells: {"""
assert s.count(anchor) == 1, 'catalog-model anchor mismatch'
s = s.replace(anchor, insert, 1)

# The frozen project no longer owns a copied material total. It is derived from the pinned Store catalog.
old_fab = """  fabrication: {
    material: 272.86, cellRecovery: 83.56, hardware: 18.00, total: 374.42,
    cycleMin: 29.1, cycleMeasured: false, cycleBasis: 'CALCULATED'
  },"""
new_fab = """  fabrication: {
    material: null, cellRecovery: 83.56, hardware: 18.00, total: null,
    priceBasis: 'derived at render from the pinned Store Zero catalog',
    cycleMin: 29.1, cycleMeasured: false, cycleBasis: 'CALCULATED'
  },"""
assert s.count(old_fab) == 1, 'fabrication anchor mismatch'
s = s.replace(old_fab, new_fab, 1)

# Replace material catalog data only. Dimensional rows now carry modeled sampled-retail basis; final Store price is derived.
pat = re.compile(r"  /\* declared stock — stated figures, not physical counts \*/\n  stock: \[.*?\n  \},\n\n  owner:", re.S)
new_catalog = """  /* Dimensional material catalog.
     row = sku · description · modeled sampled-retail basis · modeled on-hand · current-job need · pricing note */
  stock: [
    ['STB-ZERO-PINE-1X6-96-001', 'Pine 1×6×96 select S4S',    19.50, 200, 10, 'modeled from current regional retail observations; Home Depot sample $18.75 plus nearby comparable context'],
    ['STB-ZERO-PINE-1X6-72-001', 'Pine 1×6×72 select S4S',    14.00, 200,  4, 'modeled from current regional retail observations; Lowe\'s 6 ft sample $13.79 plus nearby comparable context'],
    ['STB-ZERO-POP-1X6-96-001',  'Poplar 1×6×96 select S4S',  31.50, 200,  0, 'modeled from Home Depot $31.15 and Lowe\'s $31.84 samples'],
    ['STB-ZERO-OAK-1X6-96-001',  'Red oak 1×6×96 select S4S', 48.92, 200,  0, 'modeled from Home Depot $50.00 and Lowe\'s $47.84 samples'],
    ['STB-ZERO-CHR-1X6-96-001',  'Cherry 1×6×96 select S4S',  51.96, 200,  0, 'modeled from comparable Home Depot S4S cherry samples around $50.88–$53.03']
  ],

  /* Sheet-goods catalog.
     row = sku · sample/source id · description · supported spec · modeled sampled-retail basis · modeled on-hand · role · pricing note */
  sheetStock: {
    items: [
      ['STB-ZERO-SHEET-PLY-B2-12-4X8-001', 'Menards 1252015', '1/2 × 4 × 8 Sanded Utility Plywood', '.453 × 48 × 95-7/8 · B2 · Meranti/Okoume · veneer core · sanded 2 sides · moisture-resistant glue', 43.99, 60, 'better-looking hardwood backing / utility veneer · NOT exterior grade', 'exact Menards item observation; nearby birch/sanded comparables bracket the same class'],
      ['STB-ZERO-SHEET-ACX-34-4X8-001', 'Menards 1251064 · 690053', '3/4 × 4 × 8 Premium ACX Sanded Plywood', '.703 × 48 × 96 · Pine · AC · PS1 · exterior grade · sanded 2 sides', 52.59, 60, 'verified exterior-grade panel · thicker than the roughly 1/2 in target', 'exact Menards item observation'],
      ['STB-ZERO-MDF-12-49X97-001', 'Menards 1272002 · Home Depot comparable', '1/2 × 49 × 97 MDF Panel', '1/2 × 49 × 97 · standard MDF · smooth paintable surface', 45.00, 60, 'full-sheet low-cost backing / paintable panel', 'Menards and Home Depot current samples both $45.00'],
      ['STB-ZERO-MDF-12-2X4-001', 'Menards 1272032', '1/2 × 2 × 4 MDF Handi-Panel', 'nominal 1/2 × 2 × 4 · MDF', 12.99, 60, 'small low-cost backing / trial panel', 'exact Menards item observation'],
      ['STB-ZERO-MDF-34-4X4-001', 'Menards 1272049', '3/4 × 4 × 4 MDF Handi-Panel', 'nominal 3/4 × 4 × 4 · MDF', 29.99, 60, 'thicker low-cost panel / fixture or backing option', 'exact Menards item observation'],
      ['STB-ZERO-SHEET-ACX-12-4X8-001', 'Menards model 690051 · modeled', '1/2 × 4 × 8 Premium ACX Sanded Plywood', 'nominal 1/2 × 4 × 8 · ACX · sanded · exterior-family panel', 48.00, 60, 'preferred roughly-1/2 in exterior-capable reference panel', 'modeled best estimate: exact Menards family exists; nearby retail evidence places new 1/2 ACX around this level'],
      ['STB-ZERO-SHEET-BIRCH-UV-14-4X8-001', 'Menards 1251610 · regional comparable', '1/4 × 4 × 8 UV Prefinished Birch Veneer Core Plywood', 'nominal 1/4 × 4 × 8 · birch veneer core · UV prefinished', 45.00, 60, 'decorative / nice backing reference panel', 'modeled retail estimate from Menards product identity plus current regional prefinished-birch comparables']
    ]
  },

  owner:"""
s, n = pat.subn(new_catalog, s, count=1)
assert n == 1, f'catalog block replacement count={n}'

s = s.replace("economics: { markOn:'5%', cellRecovery:'declared', cycleModel:'single-family only' },",
              "economics: { markOn:'5% over modeled sampled-retail basis', cellRecovery:'declared', cycleModel:'single-family only' },", 1)

# Plain-language model statement in Part 01.
old_html = """  <h2 class="lab">DECLARED STOCK — STATED FIGURES, NOT PHYSICAL COUNTS</h2>
  <div id="sz-stock"></div>

  <h2 class="lab">MENARDS REFERENCE SHEET SHELF — MERCHANT PRICE × 1.05</h2>
  <div class="band calm"><b>Reference merchant shelf, not live Store inventory.</b> Menards Everyday Low Price is retained as the merchant basis and Store Zero derives its reference shelf price by applying the declared 5% mark-on. Expired rebate values are not used. Store Zero on-hand remains unresolved until a Store declaration establishes it.</div>
  <div id="sz-sheet-stock"></div>"""
new_html = """  <h2 class="lab">MODELED MATERIAL CATALOG — SEPTEMBER 15, 2026</h2>
  <div class="band calm"><b>Store Zero is complete on purpose.</b> Material prices are modeled reference values built from an aggregate of local and regional retail sampling as of September 15, 2026. Store Zero applies its declared 5% mark-on to that sampled-retail basis. Inventory counts are modeled Store Zero test inventory — not merchant inventory and not physical counts — and are intentionally high enough for ordinary bounded demonstrations to resolve cleanly. A shortage becomes meaningful when a request actually exceeds a declared modeled count.</div>

  <h2 class="lab">DIMENSIONAL STOCK — MODELED COUNTS</h2>
  <div id="sz-stock"></div>

  <h2 class="lab">SHEET GOODS — MODELED COUNTS</h2>
  <div id="sz-sheet-stock"></div>"""
assert s.count(old_html) == 1, 'Part 01 catalog copy anchor mismatch'
s = s.replace(old_html, new_html, 1)

# Add modeled-basis facts to the identity block.
facts_anchor = """    ['SOURCE COMMIT / PIN', STORE_ZERO.commit],
    ['D-001 · DIMENSIONAL', STORE_ZERO.cells['D-001'].status],"""
facts_new = """    ['SOURCE COMMIT / PIN', STORE_ZERO.commit],
    ['CATALOG REVISION', STORE_ZERO.catalogModel.revision],
    ['PRICE BASIS', STORE_ZERO.catalogModel.priceMode + ' · sampled ' + STORE_ZERO.catalogModel.asOf],
    ['INVENTORY BASIS', STORE_ZERO.catalogModel.inventoryMode + ' · sufficient-by-default'],
    ['D-001 · DIMENSIONAL', STORE_ZERO.cells['D-001'].status],"""
assert s.count(facts_anchor) == 1, 'facts anchor mismatch'
s = s.replace(facts_anchor, facts_new, 1)

# One price rule for both dimensional and sheet goods; base fabrication derives from it.
helper_anchor = """function money(v){
  if(v === null || v === undefined) return '—';
  return (v<0?'\\u2212':'') + '$' + Math.abs(v).toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g,',');
}
function ops(){"""
helper_new = """function money(v){
  if(v === null || v === undefined) return '—';
  return (v<0?'\\u2212':'') + '$' + Math.abs(v).toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g,',');
}
function markedPrice(v){ return Math.round(v * STORE_ZERO.catalogModel.markOn * 100) / 100; }
function storeUnit(s){ return markedPrice(s[2]); }
function baseFabrication(){
  var material = Math.round((storeUnit(STORE_ZERO.stock[0]) * STORE_ZERO.stock[0][4] +
                             storeUnit(STORE_ZERO.stock[1]) * STORE_ZERO.stock[1][4]) * 100) / 100;
  var total = Math.round((material + PROJECT_DEFINITION.fabrication.cellRecovery + PROJECT_DEFINITION.fabrication.hardware) * 100) / 100;
  return { material:material, total:total };
}
function ops(){"""
assert s.count(helper_anchor) == 1, 'helper anchor mismatch'
s = s.replace(helper_anchor, helper_new, 1)

# Replace both catalog renders. Prices and stock counts now visibly show their modeled basis.
stock_pat = re.compile(r"  \$\('sz-stock'\)\.innerHTML =\n.*?\n\n  var sh = STORE_ZERO\.sheetStock;", re.S)
stock_new = """  $('sz-stock').innerHTML =
    '<table><thead><tr><th>SKU</th><th>Description / basis</th><th class="n">Modeled retail</th><th class="n">Store Zero</th>' +
    '<th class="n">Modeled on hand</th><th class="n">This job needs</th><th>State</th></tr></thead><tbody>' +
    STORE_ZERO.stock.map(function(s){
      var short = s[4] > s[3];
      return '<tr><td>' + s[0] + '</td><td>' + s[1] + '<br><span style="font-size:9.5px;color:var(--text-3)">' + s[5] + '</span></td>' +
        '<td class="n">' + money(s[2]) + '</td><td class="n">' + money(storeUnit(s)) + '</td><td class="n">' + s[3] +
        '</td><td class="n">' + (s[4] || '—') + '</td><td>' +
        (short ? '<span class="chip wn">SHORT BY ' + (s[4]-s[3]) + '</span>' :
          s[4] ? '<span class="chip ok">SUFFICIENT</span>' : '<span class="chip gy">AVAILABLE</span>') + '</td></tr>';
    }).join('') + '</tbody></table>' +
    '<p style="margin:7px 0 0;font-size:10.5px;color:var(--text-3)">Store Zero unit price = modeled sampled-retail basis × ' + STORE_ZERO.catalogModel.markOn.toFixed(2) + '. Modeled on-hand is intentionally sufficient for normal demonstrations. It is not a merchant claim or a physical count.</p>';

  var sh = STORE_ZERO.sheetStock;"""
s, n = stock_pat.subn(stock_new, s, count=1)
assert n == 1, f'dimensional render replacement count={n}'

sheet_pat = re.compile(r"  \$\('sz-sheet-stock'\)\.innerHTML =\n.*?\n}\n\n/\* ═════════════════ 02 · REQUEST", re.S)
sheet_new = """  $('sz-sheet-stock').innerHTML =
    '<table><thead><tr><th>Store Zero SKU</th><th>Sample / source</th><th>Description / supported spec</th>' +
    '<th class="n">Modeled retail</th><th class="n">Store Zero</th><th class="n">Modeled on hand</th><th>Role</th></tr></thead><tbody>' +
    sh.items.map(function(i){
      var storePrice = markedPrice(i[4]);
      return '<tr><td>' + i[0] + '</td><td>' + i[1] + '</td><td><b style="color:var(--text)">' + i[2] + '</b><br>' + i[3] +
        '<br><span style="font-size:9.5px;color:var(--text-3)">' + i[7] + '</span></td><td class="n">' + money(i[4]) +
        '</td><td class="n">' + money(storePrice) + '</td><td class="n">' + i[5] + '</td><td>' + i[6] + '</td></tr>';
    }).join('') + '</tbody></table>' +
    '<p style="margin:7px 0 0;font-size:10.5px;color:var(--text-3)">Catalog revision ' + STORE_ZERO.catalogModel.revision + ' · ' + STORE_ZERO.catalogModel.priceBasis + '. Sample sources: ' + STORE_ZERO.catalogModel.sampleSources + '. Store Zero price = modeled retail × ' + STORE_ZERO.catalogModel.markOn.toFixed(2) + '. Inventory = modeled Store Zero test inventory.</p>';
}

/* ═════════════════ 02 · REQUEST"""
s, n = sheet_pat.subn(sheet_new, s, count=1)
assert n == 1, f'sheet render replacement count={n}'

# Price displayed through the exchange now derives from the same catalog values.
s = s.replace("money(P.fabrication.total) + ' budgetary'", "money(baseFabrication().total) + ' budgetary'", 1)
s = s.replace("var fab      = PROJECT_DEFINITION.fabrication.total;", "var fab      = baseFabrication().total;", 1)
s = s.replace("var fab  = PROJECT_DEFINITION.fabrication.total;", "var fab  = baseFabrication().total;", 1)
s = s.replace("var swapDelta = Math.round((STORE_ZERO.stock[2][2] - STORE_ZERO.stock[0][2]) * short[4] * 100)/100;",
              "var swapDelta = Math.round((storeUnit(STORE_ZERO.stock[2]) - storeUnit(STORE_ZERO.stock[0])) * short[4] * 100)/100;", 1)
s = s.replace("money(STORE_ZERO.stock[2][2]) + ' against ' +\n        money(short[2]) + ' a board.",
              "money(storeUnit(STORE_ZERO.stock[2])) + ' against ' +\n        money(storeUnit(short)) + ' a board.", 1)

# Carry catalog revision in offer pins and show it.
s = s.replace("pins: { clock: STORE_ZERO.catalogClock, engine: STORE_ZERO.engine, commit: STORE_ZERO.commit }",
              "pins: { clock: STORE_ZERO.catalogClock, engine: STORE_ZERO.engine, commit: STORE_ZERO.commit, catalog: STORE_ZERO.catalogModel.revision }", 1)
s = s.replace("O.pins.clock + ' · ' + O.pins.commit", "O.pins.clock + ' · ' + O.pins.catalog + ' · ' + O.pins.commit", 1)
s = s.replace("' and commit ' + O.pins.commit + '.</b> '", "', catalog revision ' + O.pins.catalog + ', and source commit ' + O.pins.commit + '.</b> '", 1)

assert s != before
assert "catalogClock:  '2026-09-15'" in s
assert "STB-ZERO-CATALOG-2026-09-15-01" in s
assert s.count("MODELED_TEST_INVENTORY") >= 1
assert s.count("STB-ZERO-SHEET-ACX-12-4X8-001") == 1
assert s.count("STB-ZERO-SHEET-BIRCH-UV-14-4X8-001") == 1
assert 'PRICE UNRESOLVED' not in s
assert 'UNRESOLVED</span></td><td>' not in s
assert s.count('var fab      = baseFabrication().total;') == 1
assert s.count('var fab  = baseFabrication().total;') == 1
assert s.count('money(baseFabrication().total)') == 1
p.write_text(s)
