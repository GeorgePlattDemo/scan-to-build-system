(function(root){
  'use strict';

  const CONFIG_URL = new URL('stb-store-runtime.json', document.currentScript.src).href;
  const PROTOCOL_VERSION = 'stb-store-zero-http/1';
  const EXPECTED_STORE_PIN = '39a1b318063f62220c9c20c42200389098e0c687';
  const REQUEST_TYPE = 'USER_DEFINED_BOARD_V1';
  const SCOPE = 'USER_DEFINED_BOARD_V1';
  const DEFINITION_KIND = 'user_defined_board.v1';
  const RULE_VERSION = '0.1';
  const FRESHNESS_RULE = 'STB-STORE-FRESH-EVALUATION-0.1';

  async function resolveEndpoint(){
    const response = await fetch(CONFIG_URL, {cache:'no-store'});
    if(!response.ok) throw new Error('STORE_RUNTIME_CONFIGURATION_UNAVAILABLE');
    const config = await response.json();
    if(!config.jobEndpoint) throw new Error('STORE_RUNTIME_NOT_DEPLOYED');
    const endpoint = new URL(config.jobEndpoint);
    const loopback = host => ['localhost','127.0.0.1','[::1]'].includes(host);
    const localTest = loopback(root.location.hostname) && loopback(endpoint.hostname);
    if(endpoint.username || endpoint.password || endpoint.search || endpoint.hash ||
       endpoint.pathname !== '/api/store-zero/job' ||
       (!localTest && (endpoint.protocol !== 'https:' || loopback(endpoint.hostname))) ||
       (localTest && !['http:','https:'].includes(endpoint.protocol))){
      throw new Error('STORE_RUNTIME_ENDPOINT_INVALID');
    }
    return endpoint.href;
  }

  function canonicalize(value){
    if(value === null) return null;
    const type = typeof value;
    if(type === 'string' || type === 'boolean') return value;
    if(type === 'number'){
      if(!Number.isFinite(value)) throw new TypeError('canonical JSON rejects non-finite numbers');
      return value;
    }
    if(type === 'undefined') throw new TypeError('canonical JSON rejects undefined');
    if(Array.isArray(value)) return value.map(canonicalize);
    if(type === 'object'){
      const output = {};
      Object.keys(value).sort().forEach(key => {
        if(key === '__proto__' || key === 'prototype' || key === 'constructor') {
          throw new TypeError('canonical JSON rejects prototype keys');
        }
        if(value[key] === undefined) throw new TypeError('canonical JSON rejects undefined');
        output[key] = canonicalize(value[key]);
      });
      return output;
    }
    throw new TypeError('canonical JSON rejects '+type);
  }

  function canonicalJson(value){
    return JSON.stringify(canonicalize(value));
  }

  function canonicalInchString(value){
    if(typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError('canonical inch string requires a finite number');
    }
    const negative = value < 0 || Object.is(value,-0);
    const absolute = Math.abs(value);
    const parts = absolute.toFixed(12).split('.');
    const whole = parts[0].replace(/^0+(?=\d)/,'');
    const fraction = (parts[1] || '').replace(/0+$/,'');
    const digits = fraction ? whole+'.'+fraction : whole;
    if(digits === '0') return '0';
    return negative ? '-'+digits : digits;
  }

  async function sha256(value){
    const bytes = new TextEncoder().encode(canonicalJson(value));
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2,'0')).join('');
  }

  function clone(value){
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function payloadFromDemand(demand){
    if(!demand || typeof demand !== 'object') throw new Error('USER_DEFINED_BOARD_DEMAND_REQUIRED');
    const spotCount = Number(demand.declaredSpotCount || 0);
    const spotDemand = spotCount > 0 ? {
      required:true,
      mode:'SPOT_ON_LOCATION',
      countPerPart:1,
      locationRule:'CENTERED_ON_PART',
      acrossWidthRule:'CENTERED_ON_WIDE_FACE',
      totalCount:spotCount
    } : null;
    return {
      line:{
        lineId:'SYO-USER1-XBRACE-LINE-1',
        configurationId:String(demand.configurationId || ''),
        configurationVersion:String(demand.configurationVersion || ''),
        materialDemand:{species:'spf',form:'board',nominalT:2,nominalW:4},
        quantity:1,
        unit:'ea',
        requiredOps:clone(demand.requiredOps || []),
        definedWorkpieceLength:{value:canonicalInchString(Number(demand.definedWorkpieceLengthIn)),unit:'in'},
        sawCuts:Number(demand.declaredSawCuts),
        sawAngleDeg:Number(demand.sawAngleDeg),
        drillCycles:0,
        drillDepthIn:null,
        cutPlane:demand.cutPlane == null ? null : String(demand.cutPlane),
        endIdentity:demand.endIdentity == null ? null : String(demand.endIdentity),
        endRelation:demand.endRelation == null ? null : String(demand.endRelation),
        lengthDatum:demand.lengthDatum == null ? null : String(demand.lengthDatum),
        datumCMethod:String(demand.datumCMethod || ''),
        parts:clone(demand.parts || []),
        spotDemand,
        unresolvedConditions:[],
        materialSource:'STORE_ZERO'
      },
      definitionKind:DEFINITION_KIND,
      ruleVersion:RULE_VERSION
    };
  }

  async function demandSignature(payload){
    const line = payload.line;
    return sha256({
      definitionKind:payload.definitionKind,
      ruleVersion:payload.ruleVersion,
      requestType:REQUEST_TYPE,
      scope:SCOPE,
      lineId:line.lineId,
      configurationId:line.configurationId,
      configurationVersion:line.configurationVersion,
      materialDemand:line.materialDemand,
      quantity:line.quantity,
      unit:line.unit,
      requiredOps:line.requiredOps,
      definedWorkpieceLength:line.definedWorkpieceLength,
      sawCuts:line.sawCuts,
      sawAngleDeg:line.sawAngleDeg,
      drillCycles:line.drillCycles,
      drillDepthIn:line.drillDepthIn,
      cutPlane:line.cutPlane,
      endIdentity:line.endIdentity,
      endRelation:line.endRelation,
      lengthDatum:line.lengthDatum,
      datumCMethod:line.datumCMethod,
      parts:line.parts,
      spotDemand:line.spotDemand,
      unresolvedConditions:line.unresolvedConditions,
      materialSource:line.materialSource
    });
  }

  async function request(demand, options){
    options = options || {};
    const payload = payloadFromDemand(demand);
    const requestId = String(options.requestId || crypto.randomUUID());
    const attemptId = crypto.randomUUID();
    const candidateRevisionId = String(options.candidateRevisionId || demand.configurationVersion || crypto.randomUUID());
    const wire = {
      protocolVersion:PROTOCOL_VERSION,
      requestId,
      projectId:'start-own',
      candidateRevisionId,
      requestType:REQUEST_TYPE,
      scope:SCOPE,
      demandSignature:await demandSignature(payload),
      querySignature:null,
      payloadDigest:await sha256(payload),
      expectedStorePin:EXPECTED_STORE_PIN,
      attemptId,
      attemptNumber:1,
      sentAt:new Date().toISOString(),
      payload
    };

    const endpoint = await resolveEndpoint();
    const response = await fetch(endpoint,{
      method:'POST',
      mode:'cors',
      signal:AbortSignal.timeout(20000),
      cache:'no-store',
      headers:{'Content-Type':'application/json'},
      body:canonicalJson(wire)
    });
    const body = await response.json().catch(() => null);
    if(!response.ok || !body || body.adapterError === true){
      const error = new Error(body?.code || 'STORE_ZERO_UNAVAILABLE');
      error.storeBody = body;
      throw error;
    }
    if(['protocolVersion','requestId','attemptId','projectId','candidateRevisionId',
        'requestType','scope','demandSignature','payloadDigest'].some(key => body[key] !== wire[key])){
      throw new Error('STORE_CORRELATION_ERROR');
    }
    if(body.storePin !== EXPECTED_STORE_PIN) throw new Error('STORE_PIN_MISMATCH');
    const receipt = body.evaluationReceipt || body.rawEvaluation?.evaluationReceipt || null;
    if(body.rawEvaluation?.freshEvaluation !== true ||
       receipt?.requestId !== requestId ||
       receipt?.freshnessRule !== FRESHNESS_RULE ||
       receipt?.authority?.storeRevision !== EXPECTED_STORE_PIN){
      throw new Error('STORE_FRESHNESS_ERROR');
    }
    return body;
  }

  root.STBUserDefinedBoardRuntimeBridge = Object.freeze({
    version:'0.1',
    configurationUrl:CONFIG_URL,
    expectedStorePin:EXPECTED_STORE_PIN,
    requestType:REQUEST_TYPE,
    payloadFromDemand,
    request
  });
})(window);
